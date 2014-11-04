# This file uses coding: utf-8
from StringIO import StringIO
from flask import url_for
from nose.tools import assert_equal
from tests.base import BaseTestCase
import csv
from splice.environment import Environment
from datetime import datetime


class TestReporting(BaseTestCase):

    def setUp(self):
        super(TestReporting, self).setUp()

        def values(fd, date_index=0):
            for line in fd:
                row = [el.decode('utf-8') for el in line.split(',')]
                # sqlalchemy doesn't like date strings....
                row[date_index] = datetime.strptime(row[date_index], "%Y-%m-%d")
                yield row

        # load db
        from splice.models import impression_stats_daily, newtab_stats_daily
        conn = Environment.instance().db.engine.connect()

        with open(self.get_fixture_path('impression_stats.csv')) as fd:
            for row in values(fd, 1):
                ins = impression_stats_daily.insert().values(row)
                conn.execute(ins)

        with open(self.get_fixture_path('newtabs.csv')) as fd:
            for row in values(fd):
                ins = newtab_stats_daily.insert().values(row)
                conn.execute(ins)

    def test_tile_summary_weekly(self):
        """
        /tile_summary/weekly/<start_date>
        """
        url = url_for('api.report.path_summary',
                      start_date='2014-05-15',
                      headers='false',
                      summary='tile',
                      period='weekly')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

        outtext = response.response.next()
        results = csv.reader(StringIO(outtext))

        f1 = False
        f2 = False
        f3 = False
        f4 = False
        for row in results:
            id = tuple(int(r) for r in row[:3])
            vals = tuple(int(r) for r in row[4:])
            if id == (2014, 36, 11):
                assert_equal(vals, (1, 0, 0, 0, 0, 0))
                f1 = True
            elif id == (2014, 39, 12):
                assert_equal(vals, (230, 2, 0, 1, 0, 0))
                f2 = True
            elif id == (2014, 40, 15):
                assert_equal(vals, (2162, 2, 0, 12, 0, 0))
                f3 = True
            elif id == (2014, 41, 99):
                assert_equal(row[3].decode('utf-8'), u'Firefox のカスタマイズ')
                f4 = True

        assert(f1 and f2 and f3 and f4)

    def test_tile_summary_daily(self):
        """
        /tile_summary/daily/<start_date>/<country_code>
        """
        url = url_for('api.report.path_summary',
                      start_date='2014-10-15',
                      headers='false',
                      country_code='US',
                      period='daily',
                      summary='tile')
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
            if id == ('2014', '2014-09-26', '15'):
                f1 = True
            elif id == ('2014', '2014-10-16', '18'):
                assert_equal(vals, ('259', '0', '0', '0', '0', '0'))
                f2 = True
            elif id == ('2014', '2014-10-22', '19'):
                assert_equal(vals, ('4', '0', '0', '0', '0', '0'))
                f3 = True

        assert(f2 and f3)
        assert(not f1)

    def test_slot_summary_weekly(self):
        """
        /tile_summary/daily/<start_date>/<country_code>
        """
        url = url_for('api.report.path_summary',
                      start_date='2014-10-10',
                      headers='false',
                      locale='en-US',
                      summary='slot',
                      period='weekly')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

        outtext = response.response.next()
        results = csv.reader(StringIO(outtext))

        f1 = False
        f2 = False
        f3 = False
        for row in results:
            id = tuple(row[:3])
            vals = tuple(row[3:])
            if id == ('2014', '40', '12'):
                f1 = True
            elif id == ('2014', '42', '5'):
                assert_equal(vals, ('126', '0', '0', '1', '0', '0'))
                f2 = True
            elif id == ('2014', '43', '1'):
                assert_equal(vals, ('81', '0', '0', '5', '0', '0'))
                f3 = True

        assert(f2 and f3)
        assert(not f1)

    def test_tile_stats_daily(self):
        """
        /tile_stats/daily/<start_date>/<tile_id>
        """
        url = url_for('api.report.path_tile_stats',
                      start_date='2014-10-20',
                      headers='false',
                      locale='en-US',
                      country_code='US',
                      tile_id=19,
                      period='daily')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

        outtext = response.response.next()
        results = csv.reader(StringIO(outtext))

        f1 = False
        f2 = False
        f3 = False
        for row in results:
            id = tuple(row[:6])
            vals = tuple(row[6:])
            assert id[4] == 'US' and id[5] == 'en-US'
            if id == ('2014', '2014-09-20', '19', "Firefox Marketplace", 'US', 'en-US'):
                f1 = True
            elif id == ('2014', '2014-10-20', '19', "Firefox Marketplace", 'US', 'en-US'):
                assert_equal(vals, ('20', '0', '0', '0', '0', '0'))
                f2 = True
            elif id == ('2014', '2014-10-22', '19', "Firefox Marketplace", 'US', 'en-US'):
                assert_equal(vals, ('4', '0', '0', '0', '0', '0'))
                f3 = True

        assert(f2 and f3)
        assert(not f1)

    def test_tile_stats_monthly(self):
        """
        /tile_stats/monthly/<start_date>/<tile_id>/<country_code>
        """
        url = url_for('api.report.path_tile_stats',
                      start_date='2014-09-20',
                      headers='false',
                      country_code='PH',
                      tile_id=15,
                      period='monthly')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

        outtext = response.response.next()
        results = csv.reader(StringIO(outtext))

        f1 = False
        f2 = False
        for row in results:
            id = tuple(row[:6])
            vals = tuple(row[6:])
            if id == ('2014', '9', '15', "Firefox for Android", 'PH', 'en-US'):
                assert_equal(vals, ('1651', '1', '0', '14', '0', '0'))
                f1 = True
            elif id == ('2014', '10', '15', "Firefox for Android", 'PH', 'en-US'):
                f2 = True

        assert(f1)
        assert(f2)

    def test_newtab_stats_daily(self):
        """
        /newtab_stats/daily/<start_date>/
        """
        url = url_for('api.report.path_summary',
                      summary='newtab',
                      start_date='2014-10-20',
                      headers='false',
                      period='daily')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

        outtext = response.response.next()
        results = csv.reader(StringIO(outtext))

        f1 = False
        f2 = False
        f3 = False
        for row in results:
            id = tuple(row[:4])
            val = row[4]
            if id == ('2014', '2014-10-19', 'LT', 'lt'):
                f1 = True
            elif id == ('2014', '2014-10-21', 'PH', 'en-US'):
                assert_equal(val, '3')
                f2 = True
            elif id == ('2014', '2014-10-23', 'LB', 'en-US'):
                assert_equal(val, '2')
                f3 = True
        assert(f2 and f3)
        assert(not f1)

    def test_newtab_stats_monthly(self):
        """
        /newtab_stats/monthly/<start_date>/<country_code>
        """
        url = url_for('api.report.path_summary',
                      summary='newtab',
                      start_date='2014-09-20',
                      headers='false',
                      country_code='US',
                      period='monthly')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

        outtext = response.response.next()
        results = csv.reader(StringIO(outtext))

        f1 = False
        f2 = False
        for row in results:
            id = tuple(row[:4])
            val = row[4]
            if id == ('2014', '10', 'US', 'en-US'):
                assert_equal(val, '51')
                f1 = True
            elif id == ('2014', '10', 'US', 'ja'):
                assert_equal(val, '116')
                f2 = True
        assert(f1 and f2)
