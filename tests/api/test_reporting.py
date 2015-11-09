from tests.base import BaseTestCase

from flask import url_for, json
from nose.tools import assert_equal


class TestReportingAPI(BaseTestCase):

    def setUp(self):
        super(TestReportingAPI, self).setUp()

    def test_reporting_stats(self):
        """Test reporting stats 200 response"""
        url = url_for('api.reporting.stats', campaign_id=1)
        res = self.client.get(url)
        assert_equal(res.status_code, 200)
        resp = json.loads(res.data)
        assert(len(resp['results']))

    def test_reporting_stats_404(self):
        """Test reporting stats 404 response"""
        url = url_for('api.reporting.stats', campaign_id=1132321)
        res = self.client.get(url)
        assert_equal(res.status_code, 404)

        url = url_for('api.reporting.stats', campaign_id=4)
        res = self.client.get(url)
        assert_equal(res.status_code, 404)
