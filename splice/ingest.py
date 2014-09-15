import os
import json
import hashlib
from boto.s3.key import Key
from splice.queries import tile_exists, insert_tile
from splice.environment import Environment


class IngestError(Exception):
    pass


def ingest_links(data, logger=None, *args, **kwargs):
    """
    Obtain links, insert in data warehouse
    """

    ingested_data = {}
    for country_locale_str, tiles in data.iteritems():
        country_code, locale = country_locale_str.split("/")
        country_code = country_code.upper()

        if country_code not in Environment.instance().fixtures["countries"]:
            raise IngestError("ERROR: country_code '{0}' is invalid\n\nvalid countries: {1}".format(country_code, json.dumps(Environment.instance().fixtures["countries"], indent=2)))

        if locale not in Environment.instance().fixtures["locales"]:
            raise IngestError("ERROR: locale '{0}' is invalid\n\nvalid locales: {1}".format(locale, json.dumps(list(Environment.instance().fixtures["locales"]), indent=2)))

        if logger:
            logger.info("PROCESSING FOR COUNTRY:{0} LOCALE:{1}".format(country_code, locale))

        new_tiles_list = []

        for t in tiles:
            image_hash = hashlib.sha1(t["imageURI"]).hexdigest()
            enhanced_image_hash = hashlib.sha1(t.get("enhancedImageURI")).hexdigest() if "enhancedImageURI" in t else None

            columns = dict(
                target_url=t["url"],
                bg_color=t["bgColor"],
                title=t["title"],
                type=t["type"],
                image_uri=image_hash,
                enhanced_image_uri=enhanced_image_hash,
                locale=locale,
            )

            db_tile_id = tile_exists(**columns)
            f_tile_id = t.get("directoryId")

            if db_tile_id is None:
                """
                Will generate a new id if not found in db
                """
                db_tile_id = insert_tile(**columns)
                t["directoryId"] = db_tile_id
                new_tiles_list.append(t)
                if logger:
                    logger.info("INSERT: Creating id:{0}".format(db_tile_id))

            elif db_tile_id == f_tile_id:
                new_tiles_list.append(t)
                if logger:
                    logger.info("NOOP: id:{0} already exists".format(f_tile_id))

            else:
                """
                Either f_tile_id was not provided or
                the id's provided differ
                """
                t["directoryId"] = db_tile_id
                new_tiles_list.append(t)
                if logger:
                    logger.info("IGNORE: Tile already exists with id: {1}".format(f_tile_id, db_tile_id))

        ingested_data[country_locale_str] = new_tiles_list

    return ingested_data


def generate_artifacts(data):
    """
    Generate locale json files, upload to s3
    """
    artifacts = []
    tile_index = {}
    for country_locale, tile_data in data.iteritems():

        serialized = json.dumps(tile_data, sort_keys=True)
        hsh = hashlib.sha1(serialized).hexdigest()
        s3_key = "{0}.{1}.json".format(country_locale, hsh)
        artifacts.append({
            "key": s3_key,
            "data": serialized,
        })

        tile_index[country_locale] = os.path.join(Environment.instance().config.CLOUDFRONT_BASE_URL, s3_key)

    artifacts.append({
        "key": Environment.instance().config.S3["tile_index_key"],
        "data": json.dumps(tile_index, sort_keys=True)
    })

    return artifacts


def deploy(data, logger=None):
    if logger:
        logger.info("Generating Data")
    artifacts = generate_artifacts(data)

    if logger:
        logger.info("Uploading to S3")

    env = Environment.instance()
    bucket = Environment.instance().s3.get_bucket(Environment.instance().config.S3["bucket"])

    deployed = []

    # upload individual files
    for file in artifacts:
        key = Key(bucket)
        key.name = file["key"]
        key.set_contents_from_string(file["data"])
        key.set_acl("public-read")

        url = key.generate_url(expires_in=0, query_auth=False)
        if logger:
            logger.info("Deployed file at {0}".format(url))
        deployed.append(url)

    return deployed
