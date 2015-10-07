
from nose.tools import assert_equal
from flask import url_for, json
from tests.base import BaseTestCase
from splice.environment import Environment
from tests.populate_database import parse_csv


class TestCountryLocale(BaseTestCase):
    def test_get_all_locale(self):
        """ Test for getting all locales"""
        url = url_for('api.init.init', target="locales")
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        locales = json.loads(response.data)['results']

        locales_fixture = Environment.instance()._load_locales()[:-1]
        locales_fixture.sort()
        assert_equal(locales, locales_fixture)

    def test_get_all_channels(self):
        """ Test for getting all channels"""
        url = url_for('api.init.init', target="channels")
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        channels = json.loads(response.data)['results']

        for i, channel in enumerate(parse_csv("channels.csv")):
            channel_api = channels[i]
            assert_equal(channel_api["name"], channel["name"])

    def test_get_all_countries(self):
        """ Test for getting all countries"""
        url = url_for('api.init.init', target="countries")
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        countries = json.loads(response.data)['results']

        countries_fixture = Environment.instance()._load_countries()[:-1]
        items = [{"country_code": code, "country_name": name} for code, name in countries_fixture]
        assert_equal(countries, items)

    def test_get_init(self):
        """ Test for getting all init data"""
        url = url_for('api.init.init', target="all")
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        combo = json.loads(response.data)['result']

        url = url_for('api.init.init', target="locales")
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        locales = json.loads(response.data)['results']

        url = url_for('api.init.init', target="countries")
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        countries = json.loads(response.data)['results']

        url = url_for('api.init.init', target="channels")
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        channels = json.loads(response.data)['results']

        assert_equal(combo["locales"], locales)
        assert_equal(combo["channels"], channels)
        assert_equal(combo["countries"], countries)

    def test_get_unknown(self):
        """ Test for getting unknown init data"""
        url = url_for('api.init.init', target="unknown")
        response = self.client.get(url)
        assert_equal(response.status_code, 404)
