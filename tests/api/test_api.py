"""
import ujson
from flask import url_for
from nose.tools import (
    assert_equals,
    assert_is_none,
)
"""
from tests.base import BaseTestCase


class TestApi(BaseTestCase):
    pass
    # def test_tile_weekly(self):
    #     """
    #     /tile_stats/weekly/<start_date>/<tile_id>
    #     """
    #     url = url_for('api.report.path_tile_stats_weekly', start_date='2014-05-15', tile_id='2')
    #     response = self.client.get(url)
    #
    #     assert_equals(response.status_code, 200)
