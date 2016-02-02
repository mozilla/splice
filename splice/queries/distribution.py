import hashlib
import os
import urllib
import json
import copy

from datetime import datetime
from collections import defaultdict
from collections import namedtuple
from itertools import product

from furl import furl
from sqlalchemy.sql import desc
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
        created_at=tile.created_at,
        position_priority=tile.position_priority)
    if tile.image_uri:
        tile_dict['imageURI'] = switch_to_cdn_url(tile.image_uri)
    if tile.enhanced_image_uri:
        tile_dict['enhancedImageURI'] = switch_to_cdn_url(tile.enhanced_image_uri)
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
    try:
        basename = os.path.basename(image_uri)
    except:
        basename = image_uri  # if the image_uri is a hash string, use it directly
    return os.path.join(env.config.CLOUDFRONT_BASE_URL, "images/%s" % basename)


def get_possible_distributions(today=None, channel_id=None):
    """Generate all possible distributions for a given date and channel.
    The result tiles are grouped by the (country, locale, channel_id),
    a tile index file will be generated as well as the last item of result.
    Note that all tiles in a distribution will be ordered by the created
    timestamp descendingly.

    Params:
        today: date, the target date on which to produce the distributions.
        The default is None, which means use the current date.
        channel_id: int, the target channel_id. Will produce distributions
        for all the channels if not specified.
    Returns:
        A distribution dictionary of (channel, distribution_list) type,
        where channel is the name of the channel, and distribution_list
        consists of all distributions for that channel. For example:
        {
            "desktop": [
                {
                    "key": "desktop/US/en-US/some_hash_0.json",
                    "data": {"distribution_payload"}
                },
                {
                    "key": "desktop/CA/en-US/some_hash_1.json",
                    "data": {"distribution_payload"}
                },

                ...,

                {
                    "key": "desktop/CA/en-GB/some_hash_2.json",
                    "data": {"distribution_payload"}
                },
                {
                    "key": "desktop_tile_index.json"
                    "data": {"tile_index_payload"},
                    "force_upload": True
                }
            ]
        }

    """
    # TODO(najiang@mozilla.com): Clean up suggested tiles
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
        .order_by(desc(Tile.created_at)))

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
    for (channel, country, locale), (legacy, directory, _suggested) in tiles.items():
        country_locale = "%s/%s" % (country, locale)
        legacy_keys, ag_keys = [], []

        # v2
        for legacy_tiles in multiplex_directory_tiles(legacy):
            legacy_json = json.dumps({'locale': legacy_tiles}, sort_keys=True)
            legacy_hsh = hashlib.sha1(legacy_json).hexdigest()
            legacy_key = "{0}/{1}.{2}.json".format(channel, country_locale, legacy_hsh)
            legacy_keys.append(legacy_key)
            artifacts[channel].append({
                "key": legacy_key,
                "data": legacy_json})

        # v3
        for ag_tiles in multiplex_directory_tiles(directory):
            ag = json.dumps({'suggested': [], 'directory': ag_tiles}, sort_keys=True)
            ag_hsh = hashlib.sha1(ag).hexdigest()
            ag_key = "{0}/{1}.{2}.ag.json".format(channel, country_locale, ag_hsh)
            ag_keys.append(ag_key)
            artifacts[channel].append({
                "key": ag_key,
                "data": ag,
            })

        tile_index_channel = tile_index.setdefault(channel, {'__ver__': 3})
        all_legacy_keys = [os.path.join(env.config.CLOUDFRONT_BASE_URL, k) for k in legacy_keys]
        all_ag_keys = [os.path.join(env.config.CLOUDFRONT_BASE_URL, k) for k in ag_keys]
        tile_index_channel[country_locale] = {
            'legacy': all_legacy_keys,
            'ag': all_ag_keys
        }

    # the index files
    for channel, tile_index_channel in tile_index.items():
        artifacts[channel].append({
            "key": "{0}_{1}".format(channel, env.config.S3["tile_index_key"]),
            "data": json.dumps(tile_index_channel, sort_keys=True),
            "force_upload": True
        })
    return artifacts


def multiplex_directory_tiles(tiles):
    """Directory tile multiplexer that creates all possible combinations of the
    tile sets based on the target url. It multiplexes the tiles with the same
    Full Qualified Domain Name(FQDN). For example,
    "https://www.mozilla.org/pocket" and "https://www.mozilla.org/gears"
    share the same FQDN "www.mozilla.org".

    Params:
        tiles: a list of tiles.
    Return:
        A list of tile sets. All tiles will be sorted by the position_priority
        and the created_at time stamp together in a descending order.
    """
    fqdns = defaultdict(list)
    for tile in tiles:
        url = furl(tile["url"]).netloc
        assert url, "URL: %s is invalid" % tile["url"]
        fqdns[url].append(tile)

    # Cartesian product of the identical FQDN tiles and the sponsored tiles
    for multiplex in product(*fqdns.values()):
        ret = copy.deepcopy(list(multiplex))  # need to deep copy the list as we have to make the change in place
        ret.sort(key=lambda tile:
                 (Tile.POSITION_PRIORITY[tile["position_priority"]], tile["created_at"]),
                 reverse=True)
        for tile in ret:  # the client doesn't need following fields
            del tile["created_at"]
            del tile["position_priority"]
        yield ret
