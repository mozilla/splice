import mock

from datetime import datetime
from tests.base import BaseTestCase
from nose.tools import assert_equal
from flask import url_for, json

from splice.queries.distribution import multiplex_directory_tiles


class TestDistributionAPI(BaseTestCase):
    def test_get_all_distributions(self):
        url = url_for('api.distributions.distributions', date="2015-10-01")
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)["results"]
        assert_equal(set(resp.keys()), set(["desktop", "desktop-prerelease"]))
        # desktop channel: 3 country_locals * 2 versions + 1 index file
        # prerelease channel: 1 country_locals * 2 versions + 1 index file
        total = 0
        for _, artifacts in resp.items():
            total += len(artifacts)
        assert_equal(total, 10)

    def test_get_all_distributions_channel_id(self):
        url = url_for('api.distributions.distributions', date="2015-10-01", channel_id=1)
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)["results"]
        assert_equal(set(resp.keys()), set(["desktop"]))
        # desktop channel: 3 country_locals * 2 versions + 1 index file
        total = 0
        for _, artifacts in resp.items():
            total += len(artifacts)
        assert_equal(total, 7)

        url = url_for('api.distributions.distributions', date="2015-10-01", channel_id=3)
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)["results"]
        assert_equal(set(resp.keys()), set(["desktop-prerelease"]))
        # prerelease channel: 1 country_locals * 1 versions + 1 index file
        total = 0
        for _, artifacts in resp.items():
            total += len(artifacts)
        assert_equal(total, 3)

    def test_get_all_distributions_ordering(self):
        url = url_for('api.distributions.distributions', date="2015-10-01", channel_id=3)
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)["results"]
        artifacts = resp['desktop-prerelease']
        distribution = json.loads(artifacts[1]['data'])
        directory_tiles = distribution['directory']
        tile_titles = [t['title'] for t in directory_tiles]
        assert_equal(['Pocket for Firefox', 'MDN'], tile_titles)

    def test_get_all_distributions_failure(self):
        url = url_for('api.distributions.distributions', date="2000-10-01")
        response = self.client.get(url)
        assert_equal(response.status_code, 404)

    def test_post_all_distributions(self):
        url = url_for('api.distributions.distributions', date="2000-10-01")
        response = self.client.post(url)
        assert_equal(response.status_code, 201)

    @mock.patch('splice.queries.distribution.get_possible_distributions')
    def test_post_all_distributions_failure(self, query_mock):
        query_mock.side_effect = ValueError("cannot connect to database")
        url = url_for('api.distributions.distributions', date="2015-10-01")
        response = self.client.post(url)
        assert_equal(response.status_code, 400)

    def test_multiplex_directory_tiles(self):
        """test the multiplex_directory_tiles function"""
        # target url group 1
        tile1 = {"type": "affiliate", "directoryId": 1, "url": "http://www.test.com",
                 "created_at": datetime(2016, 1, 18, 16, 16, 16), "position_priority": "low"}

        # target url group 2
        tile2 = {"type": "affiliate", "directoryId": 2, "url": "http://www.test1.com",
                 "created_at": datetime(2016, 1, 18, 16, 16, 16), "position_priority": "high"}

        # target url group 3
        tile3 = {"type": "affiliate", "directoryId": 3, "url": "http://www.mozilla.org",
                 "created_at": datetime(2016, 1, 18, 13, 16, 16), "position_priority": "high"}
        tile4 = {"type": "affiliate", "directoryId": 4, "url": "http://www.mozilla.org",
                 "created_at": datetime(2016, 1, 18, 17, 16, 16), "position_priority": "high"}
        tile5 = {"type": "affiliate", "directoryId": 5, "url": "http://www.mozilla.org",
                 "created_at": datetime(2016, 1, 18, 16, 16, 16), "position_priority": "medium"}
        tiles = [tile1, tile2, tile3, tile4, tile5]
        ret = list(multiplex_directory_tiles(tiles))
        assert_equal(len(ret), 3)
        get_tile_id = lambda tile: tile["directoryId"]
        assert_equal(map(get_tile_id, ret[0]), [2, 3, 1])  # priority ordering
        assert_equal(map(get_tile_id, ret[1]), [4, 2, 1])  # same priority but tile 4 gets created later
        assert_equal(map(get_tile_id, ret[2]), [2, 5, 1])  # priority ordering
