import calendar
from datetime import datetime, timedelta
from nose.tools import assert_equal
from flask import url_for
from mock import Mock, PropertyMock
from tests.base import BaseTestCase
import splice.ingest
from splice.queries import get_scheduled_distributions
from splice.environment import Environment

env = Environment.instance()


class TestAuthoring(BaseTestCase):
    def setUp(self):
        self.key_mock = Mock()
        self.key_mock.name = PropertyMock()

        def get_key_mock(*args, **kwargs):
            return self.key_mock
        splice.ingest.Key = Mock(side_effect=get_key_mock)

        self.env.s3.get_bucket = Mock(return_value=Mock())

        with open(self.get_fixture_path("mozilla-tiles.fennec.json"), 'r') as f:
            self.sample_tile_data = f.read()

        super(TestAuthoring, self).setUp()

    def test_publish_no_deploy(self):
        url = "{0}?deploy=0&channelId=1".format(url_for('api.authoring.all_tiles'))
        response = self.client.post(url, data=self.sample_tile_data)
        assert_equal(response.status_code, 200)
        # count is 5: 4 images and one distribution file
        assert_equal(5, self.key_mock.set_contents_from_string.call_count)

    def test_publish_with_deploy(self):
        url = "{0}?deploy=1&channelId=1".format(url_for('api.authoring.all_tiles'))
        response = self.client.post(url, data=self.sample_tile_data)
        assert_equal(response.status_code, 200)
        # count is 7: 4 images, one locale-tile file, one distribution file and one index file
        assert_equal(7, self.key_mock.set_contents_from_string.call_count)

    def test_publish_wrong_channel(self):
        url = "{0}?deploy=1&channelId=500".format(url_for('api.authoring.all_tiles'))
        response = self.client.post(url, data=self.sample_tile_data)
        assert_equal(response.status_code, 404)

    def test_publish_corrupt_payload(self):
        url = "{0}?deploy=1&channelId=1".format(url_for('api.authoring.all_tiles'))
        response = self.client.post(url, data="{")
        assert_equal(response.status_code, 400)

    def test_publish_no_payload(self):
        response = self.client.post(url_for('api.authoring.all_tiles'))
        assert_equal(response.status_code, 400)

    def test_schedule_future(self):
        now = datetime.utcnow() + timedelta(hours=5)
        now_ts = calendar.timegm(now.timetuple())

        url = "{0}?deploy=0&channelId=1&scheduledTS={1}".format(url_for('api.authoring.all_tiles'), now_ts)

        # no scheduled distros
        dists = get_scheduled_distributions(1, now)
        assert_equal(0, len(dists))

        response = self.client.post(url, data=self.sample_tile_data)
        assert_equal(response.status_code, 200)
        # count is 5: 4 images and one distribution file
        assert_equal(5, self.key_mock.set_contents_from_string.call_count)

        # scheduled distros now
        dists = get_scheduled_distributions(1, now)
        assert_equal(1, len(dists))

    def test_schedule_past(self):
        now = datetime.utcnow() - timedelta(hours=5)
        now_ts = calendar.timegm(now.timetuple())

        url = "{0}?deploy=0&channelId=1&scheduledTS={1}".format(url_for('api.authoring.all_tiles'), now_ts)

        response = self.client.post(url, data=self.sample_tile_data)
        assert_equal(response.status_code, 400)

    def test_schedule_bad_data(self):
        url = "{0}?deploy=0&channelId=1&scheduledTS={1}".format(url_for('api.authoring.all_tiles'), "bad_data")

        response = self.client.post(url, data=self.sample_tile_data)
        assert_equal(response.status_code, 400)

    def test_schedule_and_deploy(self):
        now = datetime.utcnow() + timedelta(hours=5)
        now_ts = calendar.timegm(now.timetuple())
        url = "{0}?deploy=1&channelId=1&scheduledTS={1}".format(url_for('api.authoring.all_tiles'), now_ts)

        response = self.client.post(url, data=self.sample_tile_data)
        assert_equal(response.status_code, 400)
