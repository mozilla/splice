import mock

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
        tile1 = {"type": "sponsored", "directoryId": 1, "url": "www.test.com"}
        tile2 = {"type": "sponsored", "directoryId": 2, "url": "www.test1.com"}
        tile3 = {"type": "affiliate", "directoryId": 3, "url": "www.mozilla.org"}
        tile4 = {"type": "affiliate", "directoryId": 4, "url": "www.mozilla.org"}
        tiles = [tile1, tile2, tile3, tile4]
        ret = multiplex_directory_tiles(tiles)
        assert_equal(len(ret), 4)
        assert_equal([
            [tile3, tile1],
            [tile4, tile1],
            [tile3, tile2],
            [tile4, tile2]
        ], ret)
        ret = multiplex_directory_tiles(tiles[2:])
        assert_equal(len(ret), 2)
        assert_equal([
            [tile3],
            [tile4]
        ], ret)
        ret = multiplex_directory_tiles(tiles[:2])
        assert_equal(len(ret), 2)
        assert_equal([
            [tile1],
            [tile2]
        ], ret)
        ret = multiplex_directory_tiles(tiles[:1])
        assert_equal(len(ret), 1)
        assert_equal([[tile1]], ret)
