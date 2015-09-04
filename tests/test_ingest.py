# -*- coding: utf-8 -*-
import json
import magic
import copy
import re
import pytz
import hashlib
from sqlalchemy import or_
from mock import Mock, PropertyMock
from nose.tools import (
    assert_raises,
    assert_equal,
    assert_not_equal,
    assert_true)
from jsonschema.exceptions import ValidationError
from dateutil.parser import parse as du_parse
from tests.base import BaseTestCase
from splice.ingest import ingest_links, generate_artifacts, IngestError, distribute
from splice.models import Tile, Adgroup, AdgroupSite


DESKTOP_LOCALE_DISTRO_PATTERN = re.compile(r'desktop/(.*)\..*.ag.json')
AG_DIST_PATHNAME = re.compile('desktop/([A-Z]{2}/([a-z]{2}-[A-Z]{2}))\.[a-z0-9]+\.ag\.json')
LEGACY_DIST_PATHNAME = re.compile('desktop/([A-Z]{2}/([a-z]{2}-[A-Z]{2}))\.[a-z0-9]+\.json')


class TestIngestLinks(BaseTestCase):

    def test_invalid_data(self):
        """
        Invalid data is sent for ingestion
        """
        assert_raises(ValidationError, ingest_links, {"invalid": {"data": 1}}, self.channels[0].id)

    def test_empty_data(self):
        """
        Empty data input is not processed
        """
        data = ingest_links({}, self.channels[0].id)
        assert_equal(data, {})

    def test_invalid_country_code(self):
        """
        Invalid country code is rejected
        """
        assert_raises(IngestError, ingest_links, {"INVALID/en-US": [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]}, self.channels[0].id)

    def test_invalid_locale(self):
        """
        Invalid locale is rejected
        """
        assert_raises(IngestError, ingest_links, {"US/en-DE": [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]}, self.channels[0].id)

    def test_invalid_related(self):
        """
        Invalid suggested type is rejected
        """
        assert_raises(ValidationError, ingest_links, {"US/en-US": [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF",
                "frecent_sites": "not an array, really"
            }
        ]}, self.channels[0].id)

    def test_check_type_uniqueness(self):
        """
        A test of type uniqueness
        """
        tile_1 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "type": "affiliate"
        }
        tile_2 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "type": "sponsored"
        }

        dist = {"US/en-US": [tile_1, tile_1, tile_2]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(len(dist['US/en-US']), len(data['US/en-US']))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30 + len(dist['US/en-US']) - 1, c)

    def test_suggested_sites(self):
        """
        just a simple suggested site tile
        """
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frecent_sites": ["http://abc.com", "https://xyz.com"]
        }
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        c = self.env.db.session.query(AdgroupSite).count()
        assert_equal(0, c)
        data = ingest_links({"US/en-US": [tile]}, self.channels[0].id)
        assert_equal(1, len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(31, c)
        c = self.env.db.session.query(AdgroupSite).count()
        assert_equal(2, c)

    def test_sorted_suggested_sites(self):
        """
        ensure suggested sites are sorted
        """
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frecent_sites": ["http://lmnop.org", "http://def.com", "http://abc.com", "http://def.com", "https://xyz.com"]
        }
        data = ingest_links({"CA/en-US": [tile]}, self.channels[0].id)
        assert_equal(1, len(data["CA/en-US"]))
        assert_equal(data["CA/en-US"][0]['frecent_sites'],
                     ["http://abc.com", "http://def.com", "http://lmnop.org", "https://xyz.com"])

    def test_ingest_suggested_sites(self):
        """
        Test that there is no duplication when ingesting tiles
        """
        with open(self.get_fixture_path("tiles_suggested.json"), 'r') as f:
            tiles = json.load(f)

        num_tiles = self.env.db.session.query(Tile).count()
        data = ingest_links(tiles, self.channels[0].id)
        assert_equal(len(data['STAR/en-US']), 5)
        new_num_tiles = self.env.db.session.query(Tile).count()
        assert_equal(num_tiles + 4, new_num_tiles)

        # ingesting the same thing a second time should be idempotent
        data = ingest_links(tiles, self.channels[0].id)
        assert_equal(len(data['STAR/en-US']), 5)
        new_num_tiles = self.env.db.session.query(Tile).count()
        assert_equal(num_tiles + 4, new_num_tiles)

    def test_ingest_compact_payload(self):
        """ Test compact payload for ingest link
        """
        image_uri = "data:image/png;base64,somedata foo"
        enhanced_uri = "data:image/png;base64,somedata bar"
        assets = {
            "image 0": image_uri,
            "enhanced image 0": enhanced_uri,
        }
        tile_us = {
            "imageURI": "image 0",
            "enhancedImageURI": "enhanced image 0",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
        }
        tile_ca = {
            "imageURI": "image 0",
            "url": "https://somewhere.ca",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
        }
        dist = {
            "assets": assets,
            "distributions": {
                "US/en-US": [tile_us],
                "CA/en-US": [tile_ca]
            }
        }

        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(1, len(data["US/en-US"]))
        assert_equal(1, len(data["CA/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(32, c)

        # test tile for CA/en-US
        tile = self.env.db.session.query(Tile).filter(Tile.id == 31).one()
        ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == 31).one()
        assert_equal(tile.adgroup_id, ag.id)
        assert_equal(tile.image_uri, hashlib.sha1(image_uri).hexdigest())

        # test tile for US/en-US
        tile = self.env.db.session.query(Tile).filter(Tile.id == 32).one()
        ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == 32).one()
        assert_equal(tile.adgroup_id, ag.id)
        assert_equal(tile.image_uri, hashlib.sha1(image_uri).hexdigest())
        assert_equal(tile.enhanced_image_uri, hashlib.sha1(enhanced_uri).hexdigest())

    def test_ingest_invalid_compact_payload(self):
        """ Test invalid compact payload for ingest link
        """
        image_uri = "data:image/png;base64,somedata foo"
        tile_us = {
            "imageURI": "image missing",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
        }
        invalid_dist_assets_missing = {
            "distributions": {
                "US/en-US": [tile_us],
            }
        }
        invalid_dist_distributions_missing = {
            "assets": {
                "image 0": image_uri,
            }
        }
        invalid_dist_uri_missing = {
            "assets": {
                "image 0": image_uri,
            },
            "distributions": {
                "US/en-US": [tile_us]
            }
        }
        assert_raises(ValidationError, ingest_links,
                      invalid_dist_assets_missing, self.channels[0].id)
        assert_raises(ValidationError, ingest_links,
                      invalid_dist_distributions_missing, self.channels[0].id)
        tiles = ingest_links(invalid_dist_uri_missing, self.channels[0].id)
        assert_equal(len(tiles["US/en-US"]), 0)

    def test_start_end_dates(self):
        """
        a simple start/end date tile
        """
        tile_no_tz = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
                "end": "2014-01-31T00:00:00.000"
            }
        }

        dist = {"US/en-US": [tile_no_tz]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(1, len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(31, c)

        tile = self.env.db.session.query(Tile).filter(Tile.id == 31).one()
        ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == 31).one()
        assert_equal(tile.adgroup_id, ag.id)

        assert_equal(ag.start_date, dist["US/en-US"][0]['time_limits']['start'])
        assert_equal(ag.end_date, dist["US/en-US"][0]['time_limits']['end'])
        assert_equal(ag.start_date_dt, du_parse(dist["US/en-US"][0]['time_limits']['start']))
        assert_equal(ag.end_date_dt, du_parse(dist["US/en-US"][0]['time_limits']['end']))

    def test_start_end_dates_timezones(self):
        """
        test start/end dates with timezones
        """
        def parse_to_utc_notz(dt_str):
            """
            Return a TZ unaware dt in UTC
            """
            dt = du_parse(dt_str)
            if dt.tzinfo:
                dt = dt.astimezone(pytz.utc).replace(tzinfo=None)

            return dt

        tile_no_tz = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
                "end": "2014-01-31T00:00:00.000"
            }
        }

        tile_with_tz = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhereelse.com",
            "title": "Some Other Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000Z",
                "end": "2014-01-31T00:00:00.000Z"
            }
        }

        tile_with_mixed_tz = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhereelseyet.com",
            "title": "Yet Some Other Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
                "end": "2014-01-31T00:00:00.000Z"
            }
        }

        dist = {"US/en-US": [tile_no_tz, tile_with_tz, tile_with_mixed_tz]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(len(dist["US/en-US"]), len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30 + len(dist["US/en-US"]), c)

        tile_tested = 0
        for i, tile_def in enumerate(dist["US/en-US"]):
            obj_id = 30 + 1 + i
            tile = self.env.db.session.query(Tile).filter(Tile.id == obj_id).one()
            ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == obj_id).one()
            assert_equal(tile.adgroup_id, ag.id)

            assert_equal(ag.start_date, tile_def['time_limits']['start'])
            assert_equal(ag.end_date, tile_def['time_limits']['end'])
            assert_equal(ag.start_date_dt, parse_to_utc_notz(tile_def['time_limits']['start']))
            assert_equal(ag.end_date_dt, parse_to_utc_notz(tile_def['time_limits']['end']))
            tile_tested += 1

        assert_equal(len(dist["US/en-US"]), tile_tested)

    def test_start_end_dates_optional(self):
        """
        Ensure that start/end dates are optional
        """
        tile_no_start = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "end": "2014-01-31T00:00:00.000"
            }
        }

        tile_no_end = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhereelse.com",
            "title": "Some Other Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
            }
        }

        tile_empty_limits = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://yetsomewhereelse.com",
            "title": "Yet Some Other Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {}
        }

        dist = {"US/en-US": [tile_no_start, tile_no_end, tile_empty_limits]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(len(dist["US/en-US"]), len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30 + len(dist["US/en-US"]), c)

        tile_tested = 0
        for i, tile_def in enumerate(dist["US/en-US"]):
            obj_id = 30 + 1 + i
            tile = self.env.db.session.query(Tile).filter(Tile.id == obj_id).one()
            ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == obj_id).one()
            assert_equal(tile.adgroup_id, ag.id)

            if ag.start_date:
                assert_equal(ag.start_date, tile_def['time_limits']['start'])
                tile_tested += 1

            if ag.end_date:
                assert_equal(ag.end_date, tile_def['time_limits']['end'])
                tile_tested += 1

        # one tile not tested because it has neither start or end dates
        assert_equal(len(dist["US/en-US"]) - 1, tile_tested)

    def test_start_end_dates_uniqueness(self):
        """
        Test that start/end are part of what make tiles unique
        """
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
                "end": "2014-01-31T00:00:00.000"
            }
        }

        tile_no_start = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "end": "2014-01-31T00:00:00.000"
            }
        }

        tile_no_end = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
            }
        }

        tile_empty_limits = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Tile",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {}
        }

        dist = {"US/en-US": [tile, tile_no_start, tile_no_end, tile_empty_limits]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(len(dist["US/en-US"]), len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30 + len(dist["US/en-US"]), c)

    def test_adgroups_channel_id_uniqueness(self):
        """
        Test that channel_ids in adgroups are part of what makes Tiles unique
        """
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
        }

        dist = {"US/en-US": [tile]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        ingest_links(dist, self.channels[0].id)
        ingest_links(dist, self.channels[1].id)
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(32, c)

    def test_title_bg_color(self):
        """
        A simple test of title_bg_color
        """
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "titleBgColor": "#FF00FF"
        }
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links({"US/en-US": [tile]}, self.channels[0].id)
        assert_equal(1, len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(31, c)

        tile = self.env.db.session.query(Tile).filter(Tile.id == 31).one()
        ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == 31).one()
        assert_equal(tile.adgroup_id, ag.id)
        assert_equal(tile.title_bg_color, "#FF00FF")

    def test_frequency_caps(self):
        """
        A simple test of frequency caps
        """
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frequency_caps": {
                "daily": 3,
                "total": 10
            }
        }
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links({"US/en-US": [tile]}, self.channels[0].id)
        assert_equal(1, len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(31, c)

        tile = self.env.db.session.query(Tile).filter(Tile.id == 31).one()
        ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == 31).one()
        assert_equal(tile.adgroup_id, ag.id)
        assert_equal(ag.frequency_cap_daily, 3)
        assert_equal(ag.frequency_cap_total, 10)

    def test_frequency_cap_missing_data(self):
        """
        Test caps with details missing
        """

        def make_dist(caps):
            tile = {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF",
                "frequency_caps": caps
            }
            return {"US/en-US": [tile]}

        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        assert_raises(ValidationError, ingest_links, make_dist({}), self.channels[0].id)
        assert_raises(ValidationError, ingest_links, make_dist({'daily': 3}), self.channels[0].id)
        assert_raises(ValidationError, ingest_links, make_dist({'total': 10}), self.channels[0].id)
        assert_raises(ValidationError, ingest_links, make_dist({'daily': "a number"}), self.channels[0].id)
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)

    def test_frequency_caps_uniqueness(self):
        """
        A test of frequency caps uniqueness
        """
        tile_1 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frequency_caps": {
                "daily": 3,
                "total": 10
            }
        }
        tile_2 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frequency_caps": {
                "daily": 4,
                "total": 10
            }
        }
        tile_3 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frequency_caps": {
                "daily": 3,
                "total": 11
            }
        }

        dist = {"US/en-US": [tile_1, tile_1, tile_2, tile_3]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(len(dist['US/en-US']), len(data['US/en-US']))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30 + len(dist['US/en-US']) - 1, c)

    def test_explanation(self):
        explanation = "Suggested for %1$S fans who visit site %2$S"
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "adgroup_name": "Technology",
            "explanation": explanation,
        }
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links({"US/en-US": [tile]}, self.channels[0].id)
        assert_equal(1, len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(31, c)

        tile = self.env.db.session.query(Tile).filter(Tile.id == 31).one()
        ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == 31).one()
        assert_equal(tile.adgroup_id, ag.id)
        assert_equal(ag.name, "Technology")
        assert_equal(ag.explanation, explanation)

    @staticmethod
    def _make_dist(parts):
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "adgroup_name": "Technology",
            "explanation": "Suggested for %1$S fans who visit site %2$S",
        }
        tile.update(parts)
        return {"US/en-US": [tile]}

    def test_explanation_invalid_data(self):
        tile = self._make_dist({"explanation": "A huge template %1$S, %2$S" * 100})
        assert_raises(ValidationError, ingest_links, tile, self.channels[0].id)

    def test_explanation_template_sanitization(self):
        # test templates with html tags
        tile = self._make_dist({
            "adgroup_name": "<script>Technology</script>",
            "explanation": "<br/>Suggested for %1$S, %2$S<br/>"})
        ingest_links(tile, self.channels[0].id)
        ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == 31).one()
        assert_equal(ag.name, "Technology")
        assert_equal(ag.explanation, "Suggested for %1$S, %2$S")

        # test templates with tags only and special characters
        tile = self._make_dist({
            "title": "Some Another Title",
            "adgroup_name": "<script><script/>",
            "explanation": "< Suggested for %1$S, %2$S >"})
        ingest_links(tile, self.channels[0].id)
        ag = self.env.db.session.query(Adgroup).filter(Adgroup.id == 32).one()
        assert_equal(ag.name, None)
        assert_equal(ag.explanation, "&lt; Suggested for %1$S, %2$S &gt;")

    def test_explanation_uniqueness(self):
        """
        A test of explanation uniqueness
        """
        tile_1 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "adgroup_name": "A",
            "explanation": "B",
        }
        tile_2 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "adgroup_name": "A",
            "explanation": "C",
        }
        tile_3 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "adgroup_name": "D",
            "explanation": "B",
        }

        dist = {"US/en-US": [tile_1, tile_1, tile_2, tile_3]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(len(dist['US/en-US']), len(data['US/en-US']))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30 + len(dist['US/en-US']) - 1, c)

    def test_check_inadjacency(self):
        """
        Simple inadjacency flag test
        """
        suggested_tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title Suggested",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frecent_sites": ["http://lmnop.org", "http://def.com", "http://abc.com", "http://def.com", "https://xyz.com"],
            "check_inadjacency": True
        }

        directory_tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere-else.com",
            "title": "Some Title Directory",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "check_inadjacency": True
        }

        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links({"US/en-US": [suggested_tile, directory_tile]}, self.channels[0].id)
        assert_equal(2, len(data["US/en-US"]))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(32, c)
        ag = self.env.db.session.query(Adgroup).filter(or_(Adgroup.id == 31, Adgroup.id == 32)).all()

        asserted = 0
        for a in ag:
            assert(a.check_inadjacency)
            asserted += 1
        assert_equal(2, asserted)

    def test_check_inadjacency_invalid(self):
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title Suggested",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frecent_sites": ["http://lmnop.org", "http://def.com", "http://abc.com", "http://def.com", "https://xyz.com"],
            "check_inadjacency": "True"
        }
        dist = {"US/en-US": [tile]}
        c = self.env.db.session.query(Adgroup).count()
        assert_raises(ValidationError, ingest_links, dist, self.channels[0].id)
        c2 = self.env.db.session.query(Adgroup).count()
        assert_equal(c, c2)

    def test_check_inadjacency_uniqueness(self):
        """
        A test of inadjacency uniqueness
        """
        tile_1 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "check_inadjacency": True
        }
        tile_2 = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "check_inadjacency": False
        }

        dist = {"US/en-US": [tile_1, tile_1, tile_2]}
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30, c)
        data = ingest_links(dist, self.channels[0].id)
        assert_equal(len(dist['US/en-US']), len(data['US/en-US']))
        c = self.env.db.session.query(Adgroup).count()
        assert_equal(30 + len(dist['US/en-US']) - 1, c)

    def test_id_creation(self):
        """
        Test an id is created for a valid tile
        """
        tile = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF"
        }
        data = ingest_links({"STAR/en-US": [tile]}, self.channels[0].id)
        directory_id = data["STAR/en-US"][0]["directoryId"]

        # the biggest ID is 30 - next one should be 31
        assert_equal(31, directory_id)

    def test_id_not_duplicated(self):
        """
        Test an id is created for a valid tile
        """
        tiles_star = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            },
            {
                "imageURI": "data:image/png;base64,someotherdata",
                "url": "https://somewhereelse.com",
                "title": "Some Other Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            },
        ]

        tiles_ca = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]
        data = ingest_links({
            "STAR/en-US": tiles_star,
            "CA/en-US": tiles_ca,
        }, self.channels[0].id)
        directory_id_star = data["STAR/en-US"][0]["directoryId"]
        directory_id_ca = data["CA/en-US"][0]["directoryId"]
        assert_equal(31, directory_id_star)
        assert_not_equal(data["STAR/en-US"][1]["directoryId"], directory_id_star)
        assert_equal(directory_id_ca, directory_id_star)

    def test_id_not_overwritten(self):
        """
        Test an id is created for a valid tile
        """
        tiles_star = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star}, self.channels[0].id)
        directory_id = data["STAR/en-US"][0]["directoryId"]
        assert_equal(31, directory_id)

        data = ingest_links({"STAR/en-US": tiles_star}, self.channels[0].id)
        directory_id = data["STAR/en-US"][0]["directoryId"]
        assert_equal(31, directory_id)

    def test_error_mid_ingestion(self):
        """
        Test an error happening mid-ingestion
        """
        tiles_star = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            },
            {
                "imageURI": "data:image/png;base64,someotherdata",
                "url": "https://somewhereelse.com",
                "title": "Some Other Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            },
        ]
        tile_count_before = self.env.db.session.query(Tile).count()

        import splice.ingest
        insert_function = splice.ingest.insert_tile

        # put counts in a dict to get around python's
        # non-local scope restrictions on variables
        # for access in mock_ingest
        counts = {
            'call': 0,
            'exception_at': 2,
        }

        def mock_ingest(*args, **kwargs):
            counts['call'] += 1
            if counts['call'] < counts['exception_at']:
                return insert_function(*args, **kwargs)
            else:
                raise Exception('Boom')

        function_mock = Mock(side_effect=mock_ingest)
        try:
            splice.ingest.insert_tile = function_mock

            assert_raises(Exception, ingest_links, {"STAR/en-US": tiles_star}, self.channels[0].id)
            tile_count_after = self.env.db.session.query(Tile).count()

            # None of two has been inserted, to test the "all or nothing" scenario
            assert_equal(0, tile_count_after - tile_count_before)

        finally:
            # put the module function back to what it was
            splice.ingest.insert_tile = insert_function

    def test_ingest_dbpool(self):
        """
        Test a ingestion of a large number of tiles that could use up connections to the db
        """
        with open(self.get_fixture_path("2014-10-30.ja-pt.json"), 'r') as f:
            tiles = json.load(f)
        ingest_links(tiles, self.channels[0].id)
        num_tiles = self.env.db.session.query(Tile).count()
        assert(num_tiles > 30)

    def test_ingest_no_duplicates(self):
        """
        Test that there is no duplication when ingesting tiles
        """
        with open(self.get_fixture_path("tiles_duplicates.json"), 'r') as f:
            tiles = json.load(f)

        num_tiles = self.env.db.session.query(Tile).count()
        ingest_links(tiles, self.channels[0].id)
        new_num_tiles = self.env.db.session.query(Tile).count()
        assert_equal(num_tiles + 1, new_num_tiles)


class TestGenerateArtifacts(BaseTestCase):

    def test_generate_artifacts(self):
        """
        Tests that the correct number of artifacts are generated
        """
        with open(self.get_fixture_path("tiles_suggested.json"), 'r') as f:
            fixture = json.load(f)

        tile = fixture["STAR/en-US"][4]

        data = ingest_links({"STAR/en-US": [tile]}, self.channels[0].id)
        artifacts = generate_artifacts(data, self.channels[0].name, True)
        # tile index, v2, v3 and 2 image files are generated
        assert_equal(6, len(artifacts))

        data = ingest_links({
            "STAR/en-US": [tile],
            "CA/en-US": [tile]
        }, self.channels[0].id)
        artifacts = generate_artifacts(data, self.channels[0].name, True)
        # includes two more file: the locale data payload for each version
        assert_equal(8, len(artifacts))

    def test_generate_artifacts_compact(self):
        """
        Tests that the correct number of artifacts are generated for compact
        payload
        """
        image_uri = "data:image/png;base64,QSBwcmV0dHkgaW1hZ2UgOik="
        enhanced_uri = "data:image/png;base64,WWV0IGFub3RoZXIgcHJldHR5IGltYWdlIDop"
        assets = {
            "image 0": image_uri,
            "enhanced image 0": enhanced_uri,
        }
        tile_us = {
            "imageURI": "image 0",
            "enhancedImageURI": "enhanced image 0",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
        }
        dist_us = {
            "assets": assets,
            "distributions": {
                "US/en-US": [tile_us]
            }
        }
        dist_us_ca = {
            "assets": assets,
            "distributions": {
                "US/en-US": [tile_us],
                "CA/en-US": [tile_us]
            }
        }

        data = ingest_links(dist_us, self.channels[0].id)
        artifacts = generate_artifacts(data, self.channels[0].name, True)
        # tile index, v2, v3 and 2 image files are generated
        assert_equal(6, len(artifacts))

        data = ingest_links(dist_us_ca, self.channels[0].id)
        artifacts = generate_artifacts(data, self.channels[0].name, True)
        # includes two more file: the locale data payload for each version
        assert_equal(8, len(artifacts))

        # verify the compact tiles
        artifact = artifacts[-1]
        payload = json.loads(artifact["data"])
        assert_true("assets" in payload)
        assert_true("distributions" in payload)
        assets = payload["assets"]
        for _, tiles in payload["distributions"].iteritems():
            for tile in tiles:
                assert_true(tile["imageURI"] in assets)
                if tile.get("enhancedImageURI"):
                    assert_true(tile["enhancedImageURI"] in assets)

    def test_unknown_mime_type(self):
        """
        Tests that an unknown mime type is rejected
        """
        tiles_star = [
            {
                "imageURI": "data:image/weirdimage;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star}, self.channels[0].id)
        assert_raises(IngestError, generate_artifacts, data, self.channels[0].name, True)

    def test_malformed_data_uri_meta(self):
        """
        Tests that a malformed data uri declaration is rejected
        """
        tiles_star = [
            {
                "imageURI": "data:image/somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star}, self.channels[0].id)
        assert_raises(IngestError, generate_artifacts, data, self.channels[0].name, True)

    def test_image_content(self):
        with open(self.get_fixture_path("valid_tile.json"), 'r') as f:
            tiles = json.load(f)
        data = ingest_links(tiles, self.channels[0].id)
        artifacts = generate_artifacts(data, self.channels[0].name, True)

        found_image = False
        for file in artifacts:
            if "mime" in file:
                found_image = True
                assert_equal(file["mime"], magic.from_buffer(file["data"], mime=True))

        assert_true(found_image)

    def test_image_artifact_hash(self):
        """
        Test that the correct number of image artifacts are produced
        """
        with open(self.get_fixture_path("valid_tile.json"), 'r') as f:
            fixture = json.load(f)

        tile_1 = fixture["STAR/en-US"][0]

        tile_2 = copy.deepcopy(tile_1)
        tile_2['title'] = 'Some Other Title'

        tile_3 = copy.deepcopy(tile_1)
        tile_3['title'] = 'Yet Another Title'

        tiles = {'STAR/en-US': [tile_1, tile_2, tile_3]}
        data = ingest_links(tiles, self.channels[0].id)
        artifacts = generate_artifacts(data, self.channels[0].name, True)

        # even if there are 3 tiles, there should only be 2 images
        image_count = 0
        for a in artifacts:
            mime = a.get('mime')
            if mime and mime == 'image/png':
                image_count += 1

        assert_equal(2, image_count)

    def test_generate_artifacts_tile_count(self):
        """
        Tests that the correct number of tiles are produced
        """

        with open(self.get_fixture_path('mozilla-tiles.fennec.sg.json'), 'r') as f:
            tiles = json.load(f)

        data = ingest_links(tiles, self.channels[0].id)
        artifacts = generate_artifacts(data, self.channels[0].name, True)

        assertions_run = False
        for a in artifacts:
            m = DESKTOP_LOCALE_DISTRO_PATTERN.match(a['key'])
            if m:
                country_locale = m.groups()[0]
                distro_data = json.loads(a['data'])
                assert_equal(len(tiles[country_locale]) - 1, len(distro_data['directory']))
                assert_equal(1, len(distro_data['suggested']))
                assertions_run = True
        assert(assertions_run)


class TestDistribute(BaseTestCase):

    def setUp(self):
        import splice.ingest

        self.key_mock = Mock()
        self.bucket_mock = Mock()

        def bucket_get_key_mock(*args, **kwargs):
            return None
        self.bucket_mock.get_key = Mock(side_effect=bucket_get_key_mock)

        def get_key_mock(*args, **kwargs):
            return self.key_mock
        splice.ingest.Key = Mock(side_effect=get_key_mock)

        def get_bucket_mock(*args, **kwargs):
            return self.bucket_mock
        self.env.s3.get_bucket = Mock(side_effect=get_bucket_mock)

        self.key_names = []

        def key_set_name(name):
            self.key_names.append(name)
        type(self.key_mock).name = PropertyMock(side_effect=key_set_name)

        self.key_contents = []

        def key_set_contents(data, **kwargs):
            self.key_contents.append(data)
        self.key_mock.set_contents_from_string = Mock(side_effect=key_set_contents)

        super(TestDistribute, self).setUp()

    def test_distribute(self):
        tiles_star = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "enhancedImageURI": "data:image/png;base64,somemoredata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        tiles_ca = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star}, self.channels[0].id)
        distribute(data, self.channels[0].id, True)
        # 6 files are uploaded, mirrors generate artifacts
        assert_equal(6, self.key_mock.set_contents_from_string.call_count)

        self.key_mock.set_contents_from_string = Mock()
        data = ingest_links({
            "STAR/en-US": tiles_star,
            "CA/en-US": tiles_ca,
        }, self.channels[0].id)
        distribute(data, self.channels[0].id, True)
        #  includes two more upload: the locate data payload (for both versions)
        assert_equal(8, self.key_mock.set_contents_from_string.call_count)

    def test_distribute_suggested(self):
        tiles_star = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "enhancedImageURI": "data:image/png;base64,somemoredata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF",
                "frecent_sites": ['http://xyz.com', 'http://abc.com']
            }
        ]

        tiles_ca = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Other Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({
            "STAR/en-US": tiles_star,
            "CA/en-US": tiles_ca,
        }, self.channels[0].id)
        distribute(data, self.channels[0].id, True)

        # in this case, the 3rd element should be the mock of the s3 upload for the 'ag' index
        frecents = json.loads(self.key_mock.set_contents_from_string.mock_calls[3][1][0])['suggested'][0]['frecent_sites']
        assert_equal(frecents, ['http://abc.com', 'http://xyz.com'])

    def test_distribute_compact(self):
        image_uri = "data:image/png;base64,QSBwcmV0dHkgaW1hZ2UgOik="
        enhanced_uri = "data:image/png;base64,WWV0IGFub3RoZXIgcHJldHR5IGltYWdlIDop"
        assets = {
            "image 0": image_uri,
            "enhanced image 0": enhanced_uri,
        }
        tile_us = {
            "imageURI": "image 0",
            "enhancedImageURI": "enhanced image 0",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF",
        }
        dist_ca_us = {
            "assets": assets,
            "distributions": {
                "US/en-US": [tile_us],
                "CA/en-US": [tile_us]
            }
        }
        data = ingest_links(dist_ca_us, self.channels[0].id)
        distribute(data, self.channels[0].id, True)
        assert_equal(8, self.key_mock.set_contents_from_string.call_count)

    def test_distribute_frequency_cap(self):
        """
        Tests if frequency cap makes it in distributions
        """
        tile_en_gb = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title CA",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frequency_caps": {
                "daily": 3,
                "total": 10
            }
        }

        tile_en_us = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere_else.com",
            "title": "Some Title US",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frequency_caps": {
                "daily": 5,
                "total": 15
            }
        }

        tiles_en_us_suggested = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title US Suggested",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frecent_sites": ['http://xyz.com', 'http://abc.com'],
            "frequency_caps": {
                "daily": 7,
                "total": 20
            }
        }

        distribution = {
            "US/en-US": [tile_en_us, tiles_en_us_suggested],
            "GB/en-US": [tile_en_us],
            "GB/en-GB": [tile_en_gb]
        }

        data = ingest_links(distribution, self.channels[0].id)
        distribute(data, self.channels[0].id, True)
        # one image, 3 AG distributions, 3 legacy distributions, one index, one input distribution
        assert_equal(9, self.key_mock.set_contents_from_string.call_count)

        num_tiles_checked = 0
        for i, key in enumerate(self.key_names):
            ag = AG_DIST_PATHNAME.match(key)
            leg = LEGACY_DIST_PATHNAME.match(key)
            if ag:
                country_locale, locale = ag.groups()
                data = json.loads(self.key_contents[i])
                for tile in data['directory']:
                    # index 0 expected, only for US/en-US
                    assert_equal(distribution[country_locale][0]['frequency_caps'], tile.get('frequency_caps'))
                    num_tiles_checked += 1
                for tile in data['suggested']:
                    # index 1 expected, only for US/en-US
                    assert_equal(distribution[country_locale][1]['frequency_caps'], tile.get('frequency_caps'))
                    num_tiles_checked += 1

            elif leg:
                country_locale, locale = leg.groups()
                data = json.loads(self.key_contents[i])
                assert_equal(1, len(data[locale]))
                tile = data[locale][0]
                assert_equal(None, tile.get('frequency_caps'))
                num_tiles_checked += 1

        assert_equal(7, num_tiles_checked)

    def test_distribute_adgroup_explanation(self):
        tile_en_us = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere_else.com",
            "title": "Some Title US",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "adgroup_name": "Teçhnology".decode('utf-8'),
            "explanation": "推荐 for %1$S fans who also like %2$S".decode('utf-8')
        }

        tiles_en_us_suggested = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title US Suggested",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frecent_sites": ['http://xyz.com', 'http://abc.com'],
            "adgroup_name": "Technology",
            "explanation": "Suggested for %1$S fans who also like %2$S"
        }

        distribution = {
            "US/en-US": [tile_en_us, tiles_en_us_suggested],
            "GB/en-US": [tile_en_us],
        }

        data = ingest_links(distribution, self.channels[0].id)
        distribute(data, self.channels[0].id, True)
        # one image, 2 AG distributions, 2 legacy distributions, one index, one input distribution
        assert_equal(7, self.key_mock.set_contents_from_string.call_count)

        num_tiles_checked = 0
        for i, key in enumerate(self.key_names):
            ag = AG_DIST_PATHNAME.match(key)
            leg = LEGACY_DIST_PATHNAME.match(key)
            if ag:
                country_locale, locale = ag.groups()
                data = json.loads(self.key_contents[i])
                for tile in data['directory']:
                    # index 0 expected, only for US/en-US
                    assert_equal(distribution[country_locale][0]['adgroup_name'], tile.get('adgroup_name'))
                    assert_equal(distribution[country_locale][0]['explanation'], tile.get('explanation'))
                    num_tiles_checked += 1
                for tile in data['suggested']:
                    # index 1 expected, only for US/en-US
                    assert_equal(distribution[country_locale][1]['adgroup_name'], tile.get('adgroup_name'))
                    assert_equal(distribution[country_locale][1]['explanation'], tile.get('explanation'))
                    num_tiles_checked += 1

            elif leg:
                country_locale, locale = leg.groups()
                data = json.loads(self.key_contents[i])
                assert_equal(1, len(data[locale]))
                tile = data[locale][0]
                assert_equal(None, tile.get('adgroup_name'))
                assert_equal(None, tile.get('explanation'))
                num_tiles_checked += 1

        assert_equal(5, num_tiles_checked)

    def test_distribute_inadjacency_check(self):
        """
        Test if check_inadjacency makes it in distributions
        """
        tile_en_gb = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title CA",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "check_inadjacency": True
        }

        tile_en_us = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere_else.com",
            "title": "Some Title US",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "check_inadjacency": True
        }

        tiles_en_us_suggested = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title US Suggested",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frecent_sites": ['http://xyz.com', 'http://abc.com'],
            "check_inadjacency": True,
            "frequency_caps": {
                "daily": 7,
                "total": 20
            }
        }

        distribution = {
            "US/en-US": [tile_en_us, tiles_en_us_suggested],
            "GB/en-US": [tile_en_us],
            "GB/en-GB": [tile_en_gb]
        }

        data = ingest_links(distribution, self.channels[0].id)
        distribute(data, self.channels[0].id, True)
        # one image, 3 AG distributions, 3 legacy distributions, one index, one input distribution
        assert_equal(9, self.key_mock.set_contents_from_string.call_count)

        num_tiles_checked = 0
        for i, key in enumerate(self.key_names):
            ag = AG_DIST_PATHNAME.match(key)
            leg = LEGACY_DIST_PATHNAME.match(key)
            if ag:
                country_locale, locale = ag.groups()
                data = json.loads(self.key_contents[i])
                for tile in data['directory']:
                    # index 0 expected, only for US/en-US
                    assert_equal(distribution[country_locale][0]['check_inadjacency'], tile.get('check_inadjacency'))
                    num_tiles_checked += 1
                for tile in data['suggested']:
                    # index 1 expected, only for US/en-US
                    assert_equal(distribution[country_locale][1]['check_inadjacency'], tile.get('check_inadjacency'))
                    num_tiles_checked += 1

            elif leg:
                country_locale, locale = leg.groups()
                data = json.loads(self.key_contents[i])
                assert_equal(1, len(data[locale]))
                tile = data[locale][0]
                assert_equal(None, tile.get('check_inadjacency'))
                num_tiles_checked += 1

        assert_equal(7, num_tiles_checked)

    def test_distribute_time_limits(self):
        """
        Test if time limits make it in distributions
        """
        tile_en_gb = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title CA",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
                "end": "2014-01-31T00:00:00.000"
            }
        }

        tile_en_us = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere_else.com",
            "title": "Some Title US",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
                "end": "2014-01-31T00:00:00.000"
            }
        }

        tiles_en_us_suggested = {
            "imageURI": "data:image/png;base64,somedata",
            "url": "https://somewhere.com",
            "title": "Some Title US Suggested",
            "type": "organic",
            "bgColor": "#FFFFFF",
            "frecent_sites": ['http://xyz.com', 'http://abc.com'],
            "check_inadjacency": True,
            "frequency_caps": {
                "daily": 7,
                "total": 20
            },
            "time_limits": {
                "start": "2014-01-12T00:00:00.000",
                "end": "2014-01-31T00:00:00.000"
            }
        }

        distribution = {
            "US/en-US": [tile_en_us, tiles_en_us_suggested],
            "GB/en-US": [tile_en_us],
            "GB/en-GB": [tile_en_gb]
        }

        data = ingest_links(distribution, self.channels[0].id)
        distribute(data, self.channels[0].id, True)
        # one image, 3 AG distributions, 3 legacy distributions, one index, one input distribution
        assert_equal(9, self.key_mock.set_contents_from_string.call_count)

        num_tiles_checked = 0
        for i, key in enumerate(self.key_names):
            ag = AG_DIST_PATHNAME.match(key)
            leg = LEGACY_DIST_PATHNAME.match(key)
            if ag:
                country_locale, locale = ag.groups()
                data = json.loads(self.key_contents[i])
                for tile in data['directory']:
                    # index 0 expected, only for US/en-US
                    assert_equal(distribution[country_locale][0]['time_limits'], tile.get('time_limits'))
                    num_tiles_checked += 1
                for tile in data['suggested']:
                    # index 1 expected, only for US/en-US
                    assert_equal(distribution[country_locale][1]['time_limits'], tile.get('time_limits'))
                    num_tiles_checked += 1

            elif leg:
                country_locale, locale = leg.groups()
                data = json.loads(self.key_contents[i])
                assert_equal(1, len(data[locale]))
                tile = data[locale][0]
                assert_equal(None, tile.get('time_limits'))
                num_tiles_checked += 1

        assert_equal(7, num_tiles_checked)

    def test_deploy_always_generates_tile_index(self):
        """A tiles index file should always be generated"""

        # this is a dict, because of a quirk in python's namespacing/scoping
        # https://docs.python.org/2/tutorial/classes.html#python-scopes-and-namespaces
        index_uploaded = {'count': 0}

        def key_set_name(name):
            if name == "{0}_tile_index.v3.json".format(self.channels[0].name):
                index_uploaded['count'] += 1
        name_mock = PropertyMock(side_effect=key_set_name)
        type(self.key_mock).name = name_mock

        with open(self.get_fixture_path("mozilla-tiles.fennec.json"), 'r') as f:
            tiles = json.load(f)

        data = ingest_links(tiles, self.channels[0].id)
        distribute(data, self.channels[0].id, True)
        assert_equal(1, index_uploaded['count'])

        data = ingest_links(tiles, self.channels[0].id)
        distribute(data, self.channels[0].id, True)

        assert_equal(2, index_uploaded['count'])


class TestISOPattern(BaseTestCase):

    def test_relative_time_str(self):
        """
        Verify a relative ISO8061 time string validates
        """
        from splice.schemas import ISO_8061_pattern
        pat = re.compile(ISO_8061_pattern)
        date_str = '2014-01-12T00:00:00.000'
        m = pat.match(date_str)
        assert(m)
        assert_equal(None, m.groups()[-2])

    def test_absolute_time_str(self):
        """
        Verify a ISO8061 time string with Z time string validates
        """
        from splice.schemas import ISO_8061_pattern
        pat = re.compile(ISO_8061_pattern)
        date_str = '2014-01-12T00:00:00.000Z'
        m = pat.match(date_str)
        assert(m)
        assert_equal('Z', m.groups()[-2])

    def test_timezone_str(self):
        """
        Verify a ISO8061 time string with timezone time string validates
        """
        from splice.schemas import ISO_8061_pattern
        pat = re.compile(ISO_8061_pattern)
        date_str = '2015-05-05T14:19:58.359981-05:00'
        m = pat.match(date_str)
        assert(m)
        assert_equal('-05:00', m.groups()[-2])

        date_str = '2015-05-05T14:19:58.359981-05'
        m = pat.match(date_str)
        assert(m)
        assert_equal('-05', m.groups()[-2])

        date_str = '2015-05-05T14:19:58.359981-0500'
        m = pat.match(date_str)
        assert(m)
        assert_equal('-0500', m.groups()[-2])
