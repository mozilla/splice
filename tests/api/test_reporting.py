from flask import url_for
from nose.tools import (
    assert_equals,
)
from tests.base import BaseTestCase


class TestReporting(BaseTestCase):
    def test_tile_summary_weekly(self):
        """
        /tile_summary/weekly/<start_date>/<tile_id>
        """
        url = url_for('api.report.path_tile_summary_weekly', start_date='2014-05-15')
        response = self.client.get(url)

        results = response.response
        for row in results:
            print row

        assert_equals(response.status_code, 200)
