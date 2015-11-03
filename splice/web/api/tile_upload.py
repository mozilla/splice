import csv
import hashlib
import os
import StringIO
import zipfile
import random
import traceback

from PIL import Image
from collections import defaultdict
from boto.s3.cors import CORSConfiguration
from boto.s3.key import Key
from splice.environment import Environment
from splice.queries.common import session_scope
from splice.queries.adgroup import insert_adgroup
from splice.queries.tile import insert_tile


env = Environment.instance()
MIME_EXTENSIONS = {
    "png": "image/png",
    "gif": "image/gif",
    "jpeg": "image/jpg",
    "svg": "image/svg+xml",
}
VALID_CREATIVE_EXTS = set(MIME_EXTENSIONS.keys())


def bulk_upload(uploaded_zip_file, assets, campaign_id, channel_id):
    """Bulk upload adgroups and tiles for a given campaign id and channel.

    For performance reason. It ingests the input files first, just perform
    some basic data validations. If all the checks get passed, then it continues
    to do the more expensive operations, including image processing, database
    insertions, and S3 file uploading.

    Params:
        uploaded_zip_file: string, the name of the creative zip file
        assets: string, the name of the assets tsv (a.k.a spreadsheed)
        campaign_id: int, campaign id
        channel_id: int, channel id. This argument is for campatibility reason only
    """
    bucketer = load_bucketer()
    try:
        ingested_assets = ingest_assets(uploaded_zip_file, assets, bucketer, campaign_id, channel_id)
        creative_map = load_creatives_to_memory(uploaded_zip_file)
        insert_ingested_assets(ingested_assets, campaign_id, channel_id, creative_map)
    except Exception as e:
        env.log(traceback.format_exc())  # only log the stack trace at the top level
        raise e


def insert_ingested_assets(ingested_assets, campaign_id, channel_id, creative_map):
    """Insert assets(adgroups and tiles) to database, upload creatives to S3 if neccessary

    Note that the S3 uploading and database operations are interleaved in this function.
    The image_uri and enhanced_image_uri for each tile are set as the key (URL) on S3.
    """
    # a function scope cache to speedup the uploading of duplicate creatives
    s3_key_cache = dict()
    bucket, headers = setup_s3()
    with session_scope() as session:
        for key, value in ingested_assets.iteritems():
            # at least two items in the value, i.e. one adgroup and 1+ tiles
            assert(len(value) >= 2)
            adgroup, tiles = value[0], value[1:]
            inserted_adgroup = insert_adgroup(session, adgroup)
            for tile in tiles:
                tile["image_uri"], tile["enhanced_image_uri"] = \
                    upload_creatives_to_s3(tile, creative_map, bucket, headers, s3_key_cache)
                tile["adgroup_id"] = inserted_adgroup["id"]
                insert_tile(session, tile)


def setup_s3():
    bucket = Environment.instance().s3.get_bucket(Environment.instance().config.S3["bucket"])
    cors = CORSConfiguration()
    cors.add_rule("GET", "*", allowed_header="*")
    bucket.set_cors(cors)
    headers = {
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': 'inline',
    }
    return bucket, headers


def generate_s3_key(image, ext, key_cache):
    hash = hashlib.sha1(image).hexdigest()
    if hash not in key_cache:
        s3_key = "images/{0}.{1}.{2}".format(hash, len(image), ext)
        url = os.path.join(Environment.instance().config.CLOUDFRONT_BASE_URL, s3_key)
        key_cache[hash] = url
    return key_cache[hash]


def upload_creatives_to_s3(tile, creative_map, bucket, headers, key_cache):
    def _upload(image_key):
        (image, ext) = creative_map[image_key]
        s3_key = generate_s3_key(image, ext, key_cache)
        headers['Content-Type'] = MIME_EXTENSIONS[ext]
        key = bucket.get_key(s3_key)
        if key is None:
            key = Key(bucket)
            key.name = s3_key
            key.set_contents_from_string(image, headers=headers)
            key.set_acl("public-read")

        return s3_key

    return _upload(tile["image_uri"]), _upload(tile["enhanced_image_uri"])


def load_creatives_to_memory(uploaded_zip_file):
    """Load all the creatives into memory, resizing it if neccessary"""
    creative_map = {}
    try:
        with zipfile.ZipFile(uploaded_zip_file, "r") as zf:
            for info in zf.infolist():
                basename = os.path.basename(info.filename)
                name, ext = os.path.splitext(basename)
                ext = ext[1:].lower()
                ext = "jpeg" if ext == "jpg" else ext  # Pillow.Image only takes 'jpeg'
                # skip all the invalid file extensions. As user might upload unrelated files by accident
                if ext in VALID_CREATIVE_EXTS and not basename.startswith('.'):
                    buf = zf.read(info)
                    img = Image.open(StringIO.StringIO(buf))
                    if img.size != (290, 180):
                        img.thumbnail((290, 180))
                        buffer = StringIO.StringIO()
                        img.save(buffer, ext)
                        buf = buffer.getvalue()
                        buffer.close()
                    creative_map[name.lower()] = (buf, ext)
    except zipfile.BadZipfile as e:
        msg = "Error when opening zip file: %s, %s" % (uploaded_zip_file, e)
        env.log(msg)
        raise ValueError(msg)
    except Exception as e:
        msg = "Error when loading image: %s" % e
        env.log(msg)
        raise ValueError(msg)

    return creative_map


def load_assets(assets):
    for item in csv.DictReader(assets, delimiter='\t'):
        yield item


def load_bucketer():
    buckets = Environment.instance()._load_category_bucketer()
    bucketer = dict()
    for bucket in buckets:
        category = bucket["name"]
        bucketer[category] = bucket

    return bucketer


def ingest_asset(asset, image_set, bucketer, locale_set, campaign_id=0,
                 channel_id=1, adgroup_type="suggested", tile_type="affiliate"):
    """Ingest a single entry in assets file, it creates an adgroup and a tile"""
    adgroup, tile = dict(), dict()

    # frecent_sites won't be populated here. Given a category, we can get all the
    # frecent sites from the bucketer
    locale = asset["Locales Served"].strip()
    category = asset["Category  (As per Bucketer)"].strip()
    if locale not in locale_set:
        raise ValueError("Unknown locale: '%s'" % locale)
    if category not in bucketer:
        raise ValueError("Unknown category: '%s'" % category)

    adgroup['categories'] = [category]
    adgroup['locale'] = locale
    # FIXME (najiang@mozilla.com) perhaps a better way to name a adgroup here
    adgroup['name'] = "Adgroup %s %03i" % (category, random.randint(1, 100))
    adgroup['campaign_id'] = campaign_id
    adgroup['channel_id'] = channel_id
    adgroup['type'] = adgroup_type
    adgroup['paused'] = False
    adgroup['frequency_cap_daily'] = int(asset["Daily Frequency Cap"])
    adgroup['frequency_cap_total'] = int(asset["Total Frequency Cap"])
    explanation = asset["Targeting Explanation"].strip()
    # user may use the explanation from bucketer instead of customization
    if not explanation:
        explanation = bucketer[category]['explanation']
    adgroup['explanation'] = explanation

    # again, for the performance concern, image resizing won't be conducted here.
    # Instead, we only pass down the name of images for imageURI and enhancedImageURI
    tile['title'] = asset["Tile Title"].strip()
    tile['type'] = tile_type
    tile['status'] = "unapproved"
    adgroup['paused'] = False
    tile['bg_color'] = ""
    tile['title_bg_color'] = ""
    tile['target_url'] = asset["Clickthrough URL"].strip()
    rootpath = asset["Asset Name: Root"]
    image_uri, enhanced_image_uri = rootpath + "_b", rootpath + '_a'
    if image_uri not in image_set:
        raise ValueError("Missing creative %s" % image_uri)
    if enhanced_image_uri not in image_set:
        raise ValueError("Missing creative %s" % enhanced_image_uri)
    tile['image_uri'] = image_uri
    tile['enhanced_image_uri'] = enhanced_image_uri

    return adgroup, tile


def zip_list(zip_name):
    """List all the file names in a zipfile, directory names and file extensions are omitted"""
    def _get_image_name(name):
        return os.path.splitext(os.path.basename(name))[0]

    with zipfile.ZipFile(zip_name, "r") as zf:
        file_names = set([_get_image_name(name) for name in zf.namelist()])
        try:
            file_names.remove('')
        except:  # pragma: no cover
            pass
    return file_names


def ingest_assets(uploaded_zip_file, assets, bucketer, campaign_id=0, channel_id=1):
    ''' Ingest zipfile and assets spreadsheet to build adgroups and tiles.

    Note that it only checks the existence of creatives, verify the category,
    but it won't do the image resizing and frecent sites injection.

    Params:
        uploaded_zip_file: string, path of zipfile
        assets: string, path of assets
        bucketer: dict, bucketer using the category as the key

    Return:
        A dict with format as:
        key: ('category', 'locale', 'type', 'freq cap daily', 'freq cap total')
        value: ['adgroup', 'tile0', 'tile1', ..., 'tileN']
    '''
    locale_set = set(Environment.instance()._load_locales())
    image_set = zip_list(uploaded_zip_file)
    fd = open(assets, "rb") if isinstance(assets, str) else assets

    ingested_assets = defaultdict(list)
    try:
        for asset in load_assets(fd):
            adgroup, tile = ingest_asset(asset, image_set, bucketer, locale_set, campaign_id, channel_id)
            key = (adgroup["categories"][0], adgroup["locale"], adgroup["type"],
                   adgroup["frequency_cap_daily"], adgroup["frequency_cap_total"])
            # the first element for a new key is always the adgroup, followed by a list of tiles
            if key not in ingested_assets:
                ingested_assets[key].append(adgroup)
            ingested_assets[key].append(tile)
    except ValueError as e:
        env.log("Error when ingesting assets: %s" % e)
        raise e
    finally:
        if fd != assets:  # only close it if we opened it
            fd.close()

    return ingested_assets
