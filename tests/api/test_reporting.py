from StringIO import StringIO
from flask import url_for
from nose.tools import assert_equal
from tests.base import BaseTestCase
import csv


class TestReporting(BaseTestCase):

    def test_tile_summary_weekly(self):
        """
        /tile_summary/weekly/<start_date>
        """
        url = url_for('api.report.path_tile_summary_weekly',
                      start_date='2014-05-15',
                      headers='false')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

        outtext = response.response.next()
        results = csv.reader(StringIO(outtext))

        f1 = False
        f2 = False
        f3 = False
        for row in results:
            id = tuple(int(r) for r in row[:3])
            vals = tuple(int(r) for r in row[4:])
            if id == (2014, 36, 11):
                assert_equal(vals, (1, 0, 0, 0, 0, 0, 0))
                f1 = True
            elif id == (2014, 39, 12):
                assert_equal(vals, (230, 2, 0, 1, 0, 0, 0))
                f2 = True
            elif id == (2014, 40, 15):
                assert_equal(vals, (2162, 2, 0, 12, 0, 0, 0))
                f3 = True

        assert(f1 and f2 and f3)

    def test_tile_summary_daily(self):
        """
        /tile_summary/daily/<start_date>/<country_code>
        """
        url = url_for('api.report.path_tile_summary_daily',
                      start_date='2014-10-15',
                      headers='false',
                      country_code='US')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

        outtext = response.response.next()
        results = csv.reader(StringIO(outtext))

        f1 = False
        f2 = False
        f3 = False
        for row in results:
            id = tuple(row[:3])
            vals = tuple(row[4:])
            if id == ('2014','2014-09-26','15'):
                f1 = True
            elif id == ('2014','2014-10-16','18'):
                assert_equal(vals, ('259','0','0','0','0','0','0'))
                f2 = True
            elif id == ('2014','2014-10-22','19'):
                assert_equal(vals, ('4','0','0','0','0','0','0'))
                f3 = True
            print row

        assert(f2 and f3)
        assert(not f1)

