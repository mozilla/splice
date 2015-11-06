from collections import defaultdict
from collections import namedtuple
import hashlib
import os
import urllib

from datetime import datetime
import json

from splice.models import Tile, Adgroup, Campaign, CampaignCountry

Dists = namedtuple("Dists", ['legacy', 'directory', 'suggested'])


def _tile_dict(tile, legacy=False):
        tile_dict = dict(
            target_url=tile.target_url,
            bg_color=tile.bg_color,
            title_bg_color=tile.title_bg_color,
            title=tile.title,
            typ=tile.type,
            image_uri=tile.image_uri,
            enhanced_image_uri=tile.enhanced_image_uri,
            locale=tile.adgroup.locale,
            channel_id=tile.adgroup.channel_id)
        if not legacy:
            frequency_caps = {"daily": tile.adgroup.frequency_cap_daily, "total": tile.adgroup.frequency_cap_total}
            #todo populate frecent_sites, adgroup_name
            tile_dict.update(dict(
                frecent_sites=None,
                # time_limits=time_limits,
                frequency_caps=frequency_caps,
                adgroup_name=None,
                adgroup_categories=tile.adgroup.categories,
                explanation=tile.adgroup.explanation,
                check_inadjacency=tile.adgroup.check_inadjacency))
        return tile_dict


def get_possible_distributions(today=None):
    from splice.environment import Environment

    env = Environment.instance()
    if today is None:
        today = datetime.utcnow().date()

    query = (
        env.db.session
        .query(Tile)
        .filter(Tile.paused == False)
        .filter(Adgroup.paused == False)
        .filter(Campaign.paused == False)
        .filter(Campaign.end_date > today)
        .filter(Campaign.start_date <= today)
        .join(Adgroup)
        .join(Campaign)
        .join(CampaignCountry)
        .order_by(Tile.id))

    rows = query.all()

    artifacts = defaultdict(list)
    tiles = {}
    for tile in rows:
        locale = tile.adgroup.locale
        countries = tile.adgroup.campaign.countries
        channel = tile.adgroup.channel.name
        safe_channel_name = urllib.quote(channel)

        tile_dict = _tile_dict(tile)
        legacy_dict = _tile_dict(tile, True)
        suggested = len(tile.adgroup.categories) > 0

        for country in countries:
            key = (safe_channel_name, country, locale)
            value = tiles.setdefault(key, Dists(legacy=[], directory=[], suggested=[]))
            if suggested:
                value.suggested.append(tile_dict)
            else:
                value.directory.append(tile_dict)
                value.legacy.append(legacy_dict)

    tile_index = {}
    for (channel, country, locale), (legacy, directory, suggested) in tiles.items():
        country_locale = "%s/%s" % (country, locale)
        # do v2
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

    return artifacts






