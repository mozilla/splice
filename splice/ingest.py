import json
from splice.models import Tile
from splice.queries import tile_exists
from splice.environment import Environment

env = Environment.instance()


class IngestError(Exception):
    pass


def ingest_links(data, logger=None, *args, **kwargs):
    """
    Obtain links, insert in data warehouse
    """

    ingested_data = {}
    for country_code, tile_data in data.iteritems():
        country_code = country_code.upper()

        if country_code not in env.fixtures["countries"]:
            raise IngestError("ERROR: country_code '{0}' is invalid\n\nvalid countries: {1}".format(country_code, json.dumps(env.fixtures["countries"], indent=2)))
        logger.info("PROCESSING FOR COUNTRY: {0}".format(country_code))

        for locale, tiles in tile_data.iteritems():

            if locale not in env.fixtures["locales"]:
                raise IngestError("ERROR: locale '{0}' is invalid\n\nvalid locales: {1}".format(locale, json.dumps(list(env.fixtures["locales"]), indent=2)))

            new_tiles_data = {}
            new_tiles_list = []

            for t in tiles:
                columns = dict(
                    target_url=t["url"],
                    bg_color=t["bgColor"],
                    title=t["title"],
                    type=t["type"],
                    image_uri=t["imageURI"],
                    enhanced_image_uri=t.get("enhancedImageURI"),
                    locale=locale,
                )

                db_tile_id = tile_exists(**columns)
                f_tile_id = t.get("directoryId")

                if not db_tile_id:
                    """
                    Will generate a new id if not found in db
                    """
                    obj = Tile(**columns)
                    env.db.session.add(obj)
                    env.db.session.flush()
                    t["directoryId"] = obj.id
                    new_tiles_list.append(t)
                    if logger:
                        logger.info("INSERT: Creating id:{0}".format(obj.id))

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

            env.db.session.commit()
            new_tiles_data[locale] = new_tiles_list
            key_name = "{0}/{1}".format(country_code, locale)
            ingested_data[key_name] = new_tiles_data

    return ingested_data
