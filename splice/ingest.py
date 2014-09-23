import sys
import os
import json
import hashlib
import logging
from datetime import datetime
from boto.s3.cors import CORSConfiguration
from boto.s3.key import Key
import jsonschema
from splice.queries import tile_exists, insert_tile, insert_distribution
from splice.environment import Environment

command_logger = logging.getLogger("command")

payload_schema = {
    "type": "object",
    "patternProperties": {
        "^([A-Za-z]+)/([A-Za-z-]+)$": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "directoryId": {
                        "type": "integer",
                    },
                    "url": {
                        "type": "string",
                        "pattern": "^https?://.*$",
                    },
                    "title": {
                        "type": "string",
                    },
                    "bgColor": {
                        "type": "string",
                        "pattern": "^#[0-9a-fA-F]+$|^rgb\([0-9]+,[0-9]+,[0-9]+\)$|"
                    },
                    "type": {
                        "enum": ["affiliate", "organic", "sponsored"],
                    },
                    "imageURI": {
                        "type": "string",
                        "pattern": "^data:image/.*$|^https?://.*$",
                    },
                    "enhancedImageURI": {
                        "type": "string",
                        "pattern": "^data:image/.*$|^https?://.*$",
                    },
                },
                "required": ["url", "title", "bgColor", "type", "imageURI"],
            }
        }
    },
    "additionalProperties": False,
}


class IngestError(Exception):
    pass


def ingest_links(data, *args, **kwargs):
    """
    Obtain links, insert in data warehouse
    """

    try:
        jsonschema.validate(data, payload_schema)
    except jsonschema.exceptions.ValidationError, e:
        command_logger.error("ERROR: cannot validate JSON: {0}".format(e.message))
        exc_class, exc, tb = sys.exc_info()
        raise exc_class, exc, tb

    ingested_data = {}
    for country_locale_str, tiles in data.iteritems():
        country_code, locale = country_locale_str.split("/")
        country_code = country_code.upper()

        if country_code not in Environment.instance().fixtures["countries"]:
            raise IngestError("country_code '{0}' is invalid".format(country_code))

        if locale not in Environment.instance().fixtures["locales"]:
            raise IngestError("locale '{0}' is invalid".format(locale))

        command_logger.info("PROCESSING FOR COUNTRY:{0} LOCALE:{1}".format(country_code, locale))

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
                command_logger.info("INSERT: Creating id:{0}".format(db_tile_id))

            elif db_tile_id == f_tile_id:
                new_tiles_list.append(t)
                command_logger.info("NOOP: id:{0} already exists".format(f_tile_id))

            else:
                """
                Either f_tile_id was not provided or
                the id's provided differ
                """
                t["directoryId"] = db_tile_id
                new_tiles_list.append(t)
                command_logger.info("IGNORE: Tile already exists with id: {1}".format(f_tile_id, db_tile_id))

        ingested_data[country_locale_str] = new_tiles_list

    return ingested_data


def generate_artifacts(data):
    """
    Generate locale json files, upload to s3
    """
    artifacts = []
    tile_index = {}
    for country_locale, tile_data in data.iteritems():

        country_code, locale = country_locale.split("/")
        d = dict.fromkeys([locale], tile_data)
        serialized = json.dumps(d, sort_keys=True)
        hsh = hashlib.sha1(serialized).hexdigest()
        s3_key = "{0}.{1}.json".format(country_locale, hsh)
        artifacts.append({
            "key": s3_key,
            "data": serialized,
        })

        tile_index[country_locale] = os.path.join(Environment.instance().config.CLOUDFRONT_BASE_URL, s3_key)

    # include tile index

    artifacts.append({
        "key": Environment.instance().config.S3["tile_index_key"],
        "data": json.dumps(tile_index, sort_keys=True)
    })

    # include data submission in artifacts

    data_serialized = json.dumps(data, sort_keys=True)
    hsh = hashlib.sha1(data_serialized).hexdigest()
    dt_str = datetime.utcnow().isoformat().replace(":", "-")
    artifacts.append({
        "key": os.path.join("/distributions", "{0}.{1}.json".format(hsh, dt_str)),
        "data": data_serialized,
        "dist": True
    })

    return artifacts


def deploy(data):
    command_logger.info("Generating Data")
    artifacts = generate_artifacts(data)

    command_logger.info("Uploading to S3")

    env = Environment.instance()
    bucket = Environment.instance().s3.get_bucket(Environment.instance().config.S3["bucket"])
    cors = CORSConfiguration()
    cors.add_rule("GET", "*", allowed_header="*");
    bucket.set_cors(cors)

    deployed = []

    # upload individual files
    for file in artifacts:
        key = Key(bucket)
        key.name = file["key"]
        key.set_contents_from_string(file["data"])
        key.set_acl("public-read")
        key.content_type = "application/json"
        key.content_disposition = "inline"

        url = key.generate_url(expires_in=0, query_auth=False)
        command_logger.info("Deployed file at {0}".format(url))
        deployed.append(url)

        if file.get("dist", False):
            insert_distribution(url)

    return deployed
