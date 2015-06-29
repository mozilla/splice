import sys
import os
import json
import hashlib
import logging
import base64
import urllib
import copy
import re
import bleach
import pytz
from datetime import datetime
from boto.s3.cors import CORSConfiguration
from boto.s3.key import Key
import jsonschema
from furl import furl
from dateutil.parser import parse as du_parse
from splice.queries import tile_exists, insert_tile, insert_distribution
from splice.environment import Environment
from splice.schemas import get_payload_schema


command_logger = logging.getLogger("command")
metadata_pattern = re.compile("data:(.+);base64")
mime_extensions = {
    "image/png": "png",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
}


class IngestError(Exception):
    pass


class ScheduleError(Exception):
    pass


def slice_image_uri(image_uri):
    """
    Turn an image uri into a sha1 hash, mime_type and data tuple
    """
    try:
        meta, data = image_uri.split(',', 1)
        mime_type = metadata_pattern.match(meta).groups()[0]
    except:
        raise IngestError("Unexpected image data")

    unquoted = urllib.unquote(data)
    image_data = base64.b64decode(unquoted)

    image_hash = hashlib.sha1(image_data).hexdigest()

    return image_hash, mime_type, image_data


def ingest_links(data, channel_id, *args, **kwargs):
    """ Obtain links, insert in data warehouse

    Params:
        data: JSON payload with multiple schema versions. For versions prior to
        1.1.23, the JSON schema does NOT re-use data for imageURI and
        enhancedImageURI. Otherwise, there is a "assets" property, in which
        stores a "URI id" to "URI" mapping. This function will use the correct
        schema for both types of payloads
    """
    def remove_unserializable_data(tile):
        if 'time_limits' in tile:
            limits = tile['time_limits']
            limits.pop('start_dt', None)
            limits.pop('end_dt', None)
        return tile

    def populate_image_uris(tile, assets):
        """ Replace imageURI ID by image in place"""
        try:
            image_uri_id = tile["imageURI"]
            tile["imageURI"] = assets[image_uri_id]
            if "enhancedImageURI" in tile:
                enhanced_image_uri_id = tile["enhancedImageURI"]
                tile["enhancedImageURI"] = assets[enhanced_image_uri_id]
        except KeyError as e:
            command_logger.error("Failed to find base64-encoded image for key: {0}, "
                                 "when inserting tile with title: {1}, locale: "
                                 "{2}, type: {3}, url: {4}".format(e,
                                                                   tile["title"],
                                                                   country_locale_str,
                                                                   tile["type"],
                                                                   tile["url"]))
            return False
        return True

    # copy data to modify inplace, do NOT mutate the original input, cause
    # memory is much cheaper than people's mind
    data = copy.deepcopy(data)
    is_compact = "assets" in data
    try:
        jsonschema.validate(data, get_payload_schema(is_compact))
    except jsonschema.exceptions.ValidationError, e:
        command_logger.error("ERROR: cannot validate JSON: {0}".format(e.message))
        exc_class, exc, tb = sys.exc_info()
        raise exc_class, exc, tb

    from splice.environment import Environment
    env = Environment.instance()
    conn = env.db.engine.connect()

    if is_compact:
        assets, distributions = data["assets"], data["distributions"]
    else:
        assets, distributions = None, data

    ingested_data = {}
    country_locales = sorted(distributions.keys())

    try:
        for country_locale_str in country_locales:

            tiles = distributions[country_locale_str]
            country_code, locale = country_locale_str.split("/")
            country_code = country_code.upper()

            if country_code not in Environment.instance().fixtures["countries"]:
                raise IngestError("country_code '{0}' is invalid".format(country_code))

            if locale not in Environment.instance().fixtures["locales"]:
                raise IngestError("locale '{0}' is invalid".format(locale))

            command_logger.info("PROCESSING FOR COUNTRY:{0} LOCALE:{1} CHANNEL:{2}".format(country_code,
                                                                                           locale,
                                                                                           channel_id))

            new_tiles_list = []

            for t in tiles:
                trans = conn.begin()
                try:
                    if not env.is_test:
                        conn.execute("LOCK TABLE tiles; LOCK TABLE adgroups; LOCK TABLE adgroup_sites;")

                    # TODO: (najiang@mozilla.com), collect and return tile
                    # ingestion errors - Bug 1169302
                    if is_compact and not populate_image_uris(t, assets):
                        continue
                    image_hash = hashlib.sha1(t["imageURI"]).hexdigest()
                    enhanced_image_hash = hashlib.sha1(t.get("enhancedImageURI")).hexdigest() \
                        if "enhancedImageURI" in t else None

                    # deduplicate and sort frecent_sites
                    frecent_sites = sorted(set(t.get("frecent_sites", [])))
                    if frecent_sites:
                        t['frecent_sites'] = frecent_sites
                    frequency_caps = t.get("frequency_caps", {"daily": 0, "total": 0})
                    adgroup_name = bleach.clean(t.get("adgroup_name", ""), strip=True) or None
                    explanation = bleach.clean(t.get("explanation", ""), strip=True) or None

                    check_inadjacency = False
                    if 'check_inadjacency' in t:
                        check_inadjacency = t['check_inadjacency']

                    # we have both the string and datetime objects to allow for optional timezones on the client
                    time_limits = t.get("time_limits", {
                        'start': None, 'end': None,
                        'start_dt': None, 'end_dt': None
                    })
                    if time_limits.get('start') or time_limits.get('end'):
                        time_limits.update({
                            'start_dt': du_parse(time_limits['start']) if time_limits.get('start') else None,
                            'end_dt': du_parse(time_limits['end']) if time_limits.get('end') else None
                        })
                        for dt_name in ('start_dt', 'end_dt'):
                            dt = time_limits[dt_name]
                            if dt and dt.tzinfo:
                                # capture the datetime as UTC, but without the Timezone info
                                # check because input may be TZ-unaware
                                time_limits[dt_name] = dt.astimezone(pytz.utc).replace(tzinfo=None)

                    frequency_caps = t.get("frequency_caps", {"daily": 0, "total": 0})

                    columns = dict(
                        target_url=t["url"],
                        bg_color=t["bgColor"],
                        title=t["title"],
                        typ=t["type"],
                        image_uri=image_hash,
                        enhanced_image_uri=enhanced_image_hash,
                        locale=locale,
                        frecent_sites=frecent_sites,
                        time_limits=time_limits,
                        frequency_caps=frequency_caps,
                        adgroup_name=adgroup_name,
                        explanation=explanation,
                        check_inadjacency=check_inadjacency,
                        channel_id=channel_id,
                        conn=conn
                    )

                    db_tile_id, ag_id = tile_exists(**columns)
                    f_tile_id = t.get("directoryId")

                    if db_tile_id is None or ag_id is None:
                        """
                        Will generate a new id if not found in db
                        """
                        db_tile_id, ag_id = insert_tile(**columns)
                        t["directoryId"] = db_tile_id
                        new_tiles_list.append(remove_unserializable_data(t))
                        command_logger.info("INSERT: Creating id:{0}".format(db_tile_id))

                    elif db_tile_id == f_tile_id:
                        new_tiles_list.append(remove_unserializable_data(t))
                        command_logger.info("NOOP: id:{0} already exists".format(f_tile_id))

                    else:
                        """
                        Either f_tile_id was not provided or
                        the id's provided differ
                        """
                        t["directoryId"] = db_tile_id
                        new_tiles_list.append(remove_unserializable_data(t))
                        command_logger.info("IGNORE: Tile already exists with id: {1}".format(f_tile_id, db_tile_id))

                except Exception as e:
                    trans.rollback()
                    command_logger.error("ERROR: {0}\nError inserting {1}.  ".format(e, json.dumps(t, sort_keys=True)))
                else:
                    trans.commit()

            ingested_data[country_locale_str] = new_tiles_list

        return ingested_data

    finally:
        conn.close()


def generate_artifacts(data, channel_name, deploy):
    """Generate locale json files for upload to s3
    :param data: tile data for upload
    :channel_name: distribution channel name
    :deploy: tells whether to deploy to the channels
    """

    artifacts = []
    tile_index = {'__ver__': 3}
    image_index = {}
    env = Environment.instance()

    def image_add(hash, mime_type, image, locale, tile_id, *args, **kwargs):
        """
        Add an image to the index and artifact list, return file url
        """
        if hash not in image_index:
            try:
                file_ext = mime_extensions[mime_type]
            except:
                raise IngestError("Unsupported file type: {0}".format(mime_type))
            s3_key = "images/{0}.{1}.{2}".format(hash, len(image), file_ext)
            url = os.path.join(env.config.CLOUDFRONT_BASE_URL, s3_key)

            image_index[hash] = url
            artifacts.append({
                "mime": mime_type,
                "key": s3_key,
                "data": image
            })

        return image_index[hash]

    safe_channel_name = urllib.quote(channel_name)

    for country_locale, tile_data in data.iteritems():
        sug_tiles = []
        dir_tiles = []

        country_code, locale = country_locale.split("/")
        # copy data to modify inplace
        tile_data = copy.deepcopy(tile_data)

        for tile in tile_data:
            # image splitting from input
            url = image_add(*slice_image_uri(tile["imageURI"]), locale=locale, tile_id=tile["directoryId"])
            tile["imageURI"] = url

            if 'enhancedImageURI' in tile:
                url = image_add(*slice_image_uri(tile["enhancedImageURI"]), locale=locale, tile_id=tile["directoryId"])
                tile["enhancedImageURI"] = url
            if 'frecent_sites' in tile:
                sug_tiles.append(tile)
            else:
                dir_tiles.append(tile)

        # deploy both v2 and v3 versions
        if deploy:
            # v2

            legacy_tiles = copy.deepcopy(dir_tiles)
            for tile in legacy_tiles:
                # remove extra metadata
                for key in ('frequency_caps', 'adgroup_name', 'explanation', 'check_inadjacency', 'time_limits'):
                    tile.pop(key, None)

            legacy = json.dumps({locale: legacy_tiles}, sort_keys=True)
            legacy_hsh = hashlib.sha1(legacy).hexdigest()
            legacy_key = "{0}/{1}.{2}.json".format(safe_channel_name, country_locale, legacy_hsh)
            artifacts.append({
                "key": legacy_key,
                "data": legacy,
            })

            # v3
            ag = json.dumps({'suggested': sug_tiles, 'directory': dir_tiles}, sort_keys=True)
            ag_hsh = hashlib.sha1(ag).hexdigest()
            ag_key = "{0}/{1}.{2}.ag.json".format(safe_channel_name, country_locale, ag_hsh)
            artifacts.append({
                "key": ag_key,
                "data": ag,
            })
            tile_index[country_locale] = {
                'legacy': os.path.join(env.config.CLOUDFRONT_BASE_URL, legacy_key),
                'ag': os.path.join(env.config.CLOUDFRONT_BASE_URL, ag_key),
            }

    if deploy:
        # include tile index if deployment is requested.  'ver' allows us to make onyx
        # backward compatible more easily
        artifacts.append({
            "key": "{0}_{1}".format(safe_channel_name, env.config.S3["tile_index_key"]),
            "data": json.dumps(tile_index, sort_keys=True),
            "force_upload": True,
        })

    # include data submission in artifacts
    data_serialized = json.dumps(compress_payload(data), sort_keys=True)
    hsh = hashlib.sha1(data_serialized).hexdigest()
    dt_str = datetime.utcnow().isoformat().replace(":", "-")
    artifacts.append({
        "key": os.path.join("/distributions", safe_channel_name, "{0}.{1}.json".format(hsh, dt_str)),
        "data": data_serialized,
        "dist": True
    })

    return artifacts


def distribute(data, channel_id, deploy, scheduled_dt=None):
    """Upload tile data to S3
    :data: tile data
    :channel_id: channel id for which to distribute tile data
    :deploy: whether to deploy tiles to firefox immediately
    :scheduled_dt: an optional scheduled date in the future for deploy. overrides deploy
    """
    command_logger.info("Generating Data")

    from splice.models import Channel
    from splice.environment import Environment

    env = Environment.instance()

    if scheduled_dt:
        now = datetime.utcnow()
        if now > scheduled_dt:
            raise ScheduleError("scheduled date needs to be in the future")
        elif deploy:
            raise ScheduleError("cannot specify deploy and schedule at the same time")

    channel = (
        env.db.session
        .query(Channel)
        .filter(Channel.id == channel_id)
        .one())

    artifacts = generate_artifacts(data, channel.name, deploy)

    command_logger.info("Uploading to S3 for channel {0}".format(channel.name))

    bucket = Environment.instance().s3.get_bucket(Environment.instance().config.S3["bucket"])
    cors = CORSConfiguration()
    cors.add_rule("GET", "*", allowed_header="*")
    bucket.set_cors(cors)

    distributed = []

    headers = {
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': 'inline',
    }

    # upload individual files
    for file in artifacts:
        if "mime" in file:
            headers['Content-Type'] = file["mime"]
        else:
            # default to JSON for artifacts
            headers['Content-Type'] = "application/json"

        key = bucket.get_key(file["key"])
        uploaded = False

        if key is None or file.get("force_upload"):
            key = Key(bucket)
            key.name = file["key"]
            key.set_contents_from_string(file["data"], headers=headers)
            key.set_acl("public-read")
            uploaded = True

        url = key.generate_url(expires_in=0, query_auth=False)

        # remove x-amz-security-token, which is inserted even if query_auth=False
        # ref: https://github.com/boto/boto/issues/1477
        uri = furl(url)
        try:
            uri.args.pop('x-amz-security-token')
        except:
            pass
        url = uri.url

        if uploaded:
            command_logger.info("UPLOADED {0}".format(url))
        else:
            command_logger.info("SKIPPED {0}".format(url))
        distributed.append([url, uploaded])

        if file.get("dist", False):
            insert_distribution(url, channel_id, deploy, scheduled_dt)

    return distributed


def compress_payload(payload):
    """ Make an inplace modification to the payload that compresses it by
    creating an asset dictionary and referring to the assets by ID in the
    payload

    params:
        payload: a tile dictionary of format as:
            {
                "US/en": [tile 0, ..., tile n],
                ...,
                "CA/en": [tile 0, ..., tile n]
            }

    output:
        a dictionary with "assets" amd "distributions" fields:
            {
                "assets": {
                    "0": "uri 0",
                    ...,
                    "N": "uri n",
                }
                "distributions": {
                    "US/en": [tile 0, ..., tile n],
                    ...,
                    "CA/en": [tile 0, ..., tile n]
                }
            }
        where each value of imageURI or enhancedImageURI in the tile is just a
        key in the "assets" dictionary.

    """
    clone = dict(payload)
    id = 0
    assets = dict()
    uri2id = dict()
    for locale, tiles in clone.iteritems():
        for tile in tiles:
            uri = tile["imageURI"]
            enhanced_uri = tile.get("enhancedImageURI")
            if uri in uri2id:
                tile["imageURI"] = uri2id[uri]
            else:
                tile["imageURI"] = uri2id[uri] = "%d" % id
                id += 1
            if enhanced_uri is not None:
                if enhanced_uri in uri2id:
                    tile["enhancedImageURI"] = uri2id[enhanced_uri]
                else:
                    tile["enhancedImageURI"] = uri2id[enhanced_uri] = "%d" % id
                    id += 1

    for uri, id in uri2id.iteritems():
        assets[id] = uri

    return {"assets": assets, "distributions": payload}
