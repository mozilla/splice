import calendar
from datetime import datetime, timedelta
from nose.tools import assert_equal
from flask import url_for, json
from mock import Mock, PropertyMock
from tests.base import BaseTestCase
from tests.test_scheduling import ScheduleTest
import splice.ingest
from splice.queries import get_scheduled_distributions, get_upcoming_distributions, get_channels
from splice.environment import Environment

env = Environment.instance()


class TestUpcomingUnschedule(BaseTestCase):
    def setUp(self):
        self.key_mock = Mock()
        self.key_mock.name = PropertyMock()

        def get_key_mock(*args, **kwargs):
            return self.key_mock
        splice.ingest.Key = Mock(side_effect=get_key_mock)

        self.env.s3.get_bucket = Mock(return_value=Mock())

        with open(self.get_fixture_path("mozilla-tiles.fennec.json"), 'r') as f:
            self.sample_tile_data = f.read()

        super(TestUpcomingUnschedule, self).setUp()

    def test_unschedule(self):
        now = datetime.utcnow() + timedelta(minutes=5)
        now_ts = calendar.timegm(now.timetuple())

        url = "{0}?deploy=0&channelId=1&scheduledTS={1}".format(url_for('api.authoring.all_tiles'), now_ts)

        self.client.post(url, data=self.sample_tile_data)
        dist = get_scheduled_distributions(1, now)[0]

        url = "{0}?distId={1}".format(url_for('api.upcoming.unschedule'), dist.id)
        response = self.client.post(url)
        assert_equal(response.status_code, 204)
        dists = get_scheduled_distributions(1, now)
        assert_equal(len(dists), 0)

    def test_dist_id_not_found(self):
        url = "{0}?distId={1}".format(url_for('api.upcoming.unschedule'), 2000)
        response = self.client.post(url)
        assert_equal(response.status_code, 404)

    def test_dist_id_invalid(self):
        url = "{0}?distId={1}".format(url_for('api.upcoming.unschedule'), 'bad_data')
        response = self.client.post(url)
        assert_equal(response.status_code, 404)

    def test_no_dist_id(self):
        response = self.client.post(url_for('api.upcoming.unschedule'), 'bad_data')
        assert_equal(response.status_code, 400)


class TestUpcomingDistributions(ScheduleTest):

    def test_distributions(self):
        self.insert_distro()

        response = self.client.get(url_for('api.upcoming.distributions'))
        dists = get_upcoming_distributions()
        chans = get_channels()

        # need to dump using the Flask json serializer to match types
        # for datetime etc
        expected = json.loads(json.dumps({
            'd': {
                'dists': dists,
                'chans': chans,
            }
        }))
        assert_equal(expected, response.json)
