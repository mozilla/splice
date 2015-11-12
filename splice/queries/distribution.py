import hashlib
import os
import urllib
import json

from datetime import datetime
from collections import defaultdict
from collections import namedtuple

from sqlalchemy.sql.expression import false
from splice.models import Tile, Adgroup, Campaign, CampaignCountry
from splice.web.api.tile_upload import load_bucketer


Dists = namedtuple("Dists", ['legacy', 'directory', 'suggested'])


def _create_tiles(tile, bucketer, legacy=False):
    """Create the new Directory/Suggested/Legacy tiles

    Params:
        tile: sqlalchemy record for tiles table
        bucketer: dict of buckets
        legacy: flag to create legacy tile
    Return:
        List of tile dicts. It returns multiple new tiles if the argument tile is a
        suggested tile with multiple categories. Otherwise, it returns a one item list.
    """
    new_tiles = []
    tile_dict = dict(
        directoryId=tile.id,
        url=tile.target_url,
        bgColor=tile.bg_color,
        title=tile.title,
        type=tile.type,
        imageURI=switch_to_cdn_url(tile.image_uri),
        enhancedImageURI=switch_to_cdn_url(tile.enhanced_image_uri))
    if not legacy and tile.adgroup.categories:
        for category in tile.adgroup.categories:
            bucket = bucketer[category.category]
            frequency_caps = {"daily": tile.adgroup.frequency_cap_daily,
                              "total": tile.adgroup.frequency_cap_total}
            copy = dict(tile_dict)
            copy.update(dict(
                titleBgColor=tile.title_bg_color,
                frecent_sites=bucket["sites"],
                frequency_caps=frequency_caps,
                adgroup_name=bucket["adgroup_name"],
                adgroup_categories=[category.category],
                explanation=tile.adgroup.explanation or bucket["explanation"],
                check_inadjacency=tile.adgroup.check_inadjacency))
            new_tiles.append(copy)
    else:
        new_tiles.append(tile_dict)

    return new_tiles


def switch_to_cdn_url(image_uri):
    """Switch the S3 URI with the CDN URI

    We store the S3 URI in the database to allow campaign managers to view the
    uploaded images without suffering from the CDN latency. When preparing to
    generate tiles for the Firefox, it's necessary to replace the S3 URIs with
    the CDN ones, as Firefox only allows images hosted on a trusted URI, e.g.
    "tiles.cdn.mozilla.net".

    See https://github.com/oyiptong/splice/issues/203 for more details.
    """
    from splice.environment import Environment

    env = Environment.instance()
    basename = os.path.basename(image_uri)
    return os.path.join(env.config.CLOUDFRONT_BASE_URL, "images/%s" % basename)


def get_possible_distributions(today=None, channel_id=None):
    from splice.environment import Environment

    env = Environment.instance()
    if today is None:
        today = datetime.utcnow().date()

    query = (
        env.db.session
        .query(Tile)
        .filter(Tile.paused == false())
        .filter(Adgroup.paused == false())
        .filter(Campaign.paused == false())
        .filter(Campaign.end_date >= today)
        .filter(Campaign.start_date <= today)
        .join(Adgroup)
        .join(Campaign)
        .join(CampaignCountry)
        .order_by(Tile.id))

    if channel_id is not None:
        query = query.filter(Campaign.channel_id == channel_id)

    rows = query.all()
    bucketer = load_bucketer()
    artifacts = defaultdict(list)
    tiles = {}
    for tile in rows:
        locale = tile.adgroup.locale
        countries = tile.adgroup.campaign.countries
        channel = tile.adgroup.channel.name
        safe_channel_name = urllib.quote(channel)

        new_tiles = _create_tiles(tile, bucketer)
        legacy_tiles = _create_tiles(tile, bucketer, True)
        suggested = len(tile.adgroup.categories) > 0

        for country in countries:
            key = (safe_channel_name, country.country_code, locale)
            value = tiles.setdefault(key, Dists(legacy=[], directory=[], suggested=[]))
            if suggested:
                value.suggested.extend(new_tiles)
            else:
                value.directory.extend(new_tiles)
                value.legacy.extend(legacy_tiles)

    tile_index = {}
    for (channel, country, locale), (legacy, directory, suggested) in tiles.items():
        country_locale = "%s/%s" % (country, locale)
        # v2
        legacy_json = json.dumps({locale: legacy}, sort_keys=True)
        legacy_hsh = hashlib.sha1(legacy_json).hexdigest()
        legacy_key = "{0}/{1}.{2}.json".format(channel, country_locale, legacy_hsh)
        artifacts[channel].append({
            "key": legacy_key,
            "data": legacy_json})

        # v3
        ag = json.dumps({'suggested': suggested, 'directory': directory}, sort_keys=True)
        ag_hsh = hashlib.sha1(ag).hexdigest()
        ag_key = "{0}/{1}.{2}.ag.json".format(channel, country_locale, ag_hsh)
        artifacts[channel].append({
            "key": ag_key,
            "data": ag,
        })

        tile_index_channel = tile_index.setdefault(channel, {'__ver__': 3})
        tile_index_channel[country_locale] = {
            'legacy': os.path.join(env.config.CLOUDFRONT_BASE_URL, legacy_key),
            'ag': os.path.join(env.config.CLOUDFRONT_BASE_URL, ag_key),
        }

    # the index files
    for channel, tile_index_channel in tile_index.items():
        artifacts[channel].append({
            "key": "{0}_{1}".format(channel, env.config.S3["tile_index_key"]),
            "data": json.dumps(tile_index_channel, sort_keys=True),
            "force_upload": True
        })
    return artifacts
