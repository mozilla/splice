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


def _tile_dict(tile, bucketer, legacy=False):
    tile_dict = dict(
        directoryId=tile.id,
        url=tile.target_url,
        bgColor=tile.bg_color,
        title=tile.title,
        type=tile.type,
        imageURI=switch_to_cdn_url(tile.image_uri),
        enhancedImageURI=switch_to_cdn_url(tile.enhanced_image_uri))
    if not legacy:
        # only suggested tiles have categories
        if tile.adgroup.categories:
            # TODO(najiang@mozilla.com) only grab the first category here.
            # We should create multiple tiles for multiple categories, with
            # each tile has a frecent site list based on the category.
            bucket = bucketer[tile.adgroup.categories[0].category]
            frequency_caps = {"daily": tile.adgroup.frequency_cap_daily, "total": tile.adgroup.frequency_cap_total}
            tile_dict.update(dict(
                titleBgColor=tile.title_bg_color,
                frecent_sites=bucket["sites"],
                frequency_caps=frequency_caps,
                adgroup_name=bucket["adgroup_name"],
                adgroup_categories=[category.category for category in tile.adgroup.categories],
                explanation=tile.adgroup.explanation,
                check_inadjacency=tile.adgroup.check_inadjacency))
    return tile_dict


def switch_to_cdn_url(image_uri):
    """See https://github.com/oyiptong/splice/issues/203"""
    from splice.environment import Environment

    env = Environment.instance()
    basename = os.path.basename(image_uri)
    return os.path.join(env.config.CLOUDFRONT_BASE_URL, "images/%s" % basename)


def get_possible_distributions(today=None):
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
        .filter(Campaign.end_date > today)
        .filter(Campaign.start_date <= today)
        .join(Adgroup)
        .join(Campaign)
        .join(CampaignCountry)
        .order_by(Tile.id))

    rows = query.all()
    bucketer = load_bucketer()
    artifacts = defaultdict(list)
    tiles = {}
    for tile in rows:
        locale = tile.adgroup.locale
        countries = tile.adgroup.campaign.countries
        channel = tile.adgroup.channel.name
        safe_channel_name = urllib.quote(channel)

        tile_dict = _tile_dict(tile, bucketer)
        legacy_dict = _tile_dict(tile, bucketer, True)
        suggested = len(tile.adgroup.categories) > 0

        for country in countries:
            key = (safe_channel_name, country.country_code, locale)
            value = tiles.setdefault(key, Dists(legacy=[], directory=[], suggested=[]))
            if suggested:
                value.suggested.append(tile_dict)
            else:
                value.directory.append(tile_dict)
                value.legacy.append(legacy_dict)

    tile_index = {}
    for (channel, country, locale), (legacy, directory, suggested) in tiles.items():
        country_locale = "%s/%s" % (country, locale)
        # v2
        legacy_json = json.dumps({locale: legacy}, sort_keys=True)
        legacy_hsh = hashlib.sha1(legacy_json).hexdigest()
        legacy_key = "{0}/{1}.{2}.json".format(channel, country_locale, legacy_hsh)
        artifacts[channel].append({
            "key": legacy_key,
            "data": legacy})

        # v3
        ag = json.dumps({'suggested': suggested, 'directory': directory}, sort_keys=True)
        ag_hsh = hashlib.sha1(ag).hexdigest()
        ag_key = "{0}/{1}.{2}.ag.json".format(channel, country_locale, ag_hsh)
        artifacts[channel].append({
            "key": ag_key,
            "data": ag,
        })
        tile_index[country_locale] = {
            'legacy': os.path.join(env.config.CLOUDFRONT_BASE_URL, legacy_key),
            'ag': os.path.join(env.config.CLOUDFRONT_BASE_URL, ag_key),
        }

        # the index file
        artifacts[channel].append({
            "key": "{0}_{1}".format(channel, env.config.S3["tile_index_key"]),
            "data": json.dumps(tile_index, sort_keys=True)
        })

    return artifacts
