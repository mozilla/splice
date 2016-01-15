import mock

from tests.base import BaseTestCase
from nose.tools import assert_equal
from flask import url_for, json


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
