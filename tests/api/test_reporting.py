from tests.base import BaseTestCase

from flask import url_for, json
from nose.tools import assert_equal

BASE_URL = 'api.reporting.stats'


class TestReportingAPI(BaseTestCase):

    def setUp(self):
        super(TestReportingAPI, self).setUp(load_stats=True)

    def helper_test_set(self, filters={}, status_code=200, base_url=BASE_URL, empty=False):
        group_by = filters.get('group_by')
        if type(group_by) is str:
            group_by_fields = [group_by]
        else:
            group_by_fields = group_by or ['date']
        query = {'campaign_id': 1}
        query.update(filters)
        url = url_for(base_url, **query)

        result = self.client.get(url)

        assert_equal(result.status_code, status_code)

        resp = json.loads(result.data)

        if not empty:
            assert(len(resp['results']))
        else:
            assert_equal(len(resp['results']), 0)

        for r in resp['results']:
            for field in group_by_fields:
                assert(r.get(field))

        return resp

    def test_reporting_stats(self):
        """Test reporting stats 200 response"""
        default_resp = self.helper_test_set()
        date_resp = self.helper_test_set(filters={'group_by': 'date'})
        assert_equal(default_resp, date_resp)

    def test_week_month(self):
        """Test group by week, month"""
        self.helper_test_set(filters={'group_by': 'week'})
        self.helper_test_set(filters={'group_by': 'month'})

    def test_locale(self):
        """Test group by locale"""
        self.helper_test_set(filters={'group_by': 'locale'})
        self.helper_test_set(filters={'group_by': 'locale', 'country_code': 'US'})

    def test_country(self):
        """Test group by country_code"""
        self.helper_test_set(filters={'group_by': 'country_code'})
        self.helper_test_set(filters={'group_by': 'country_code', 'locale': 'en-US'})

    def test_category(self):
        """Test group by category"""
        self.helper_test_set(filters={'group_by': 'category'})
        self.helper_test_set(filters={'group_by': 'category', 'channel_id': 1})
        self.helper_test_set(filters={'group_by': 'category', 'start_date': '2015-09-01', 'end_date': '2015-10-30'})

    def test_group_by_multiple(self):
        """Test group by multiple categories"""
        self.helper_test_set(filters={'group_by': ['date', 'category']})
        self.helper_test_set(filters={'group_by': ['category', 'country_code', 'locale']})
        self.helper_test_set(filters={'group_by': ['date', 'category'], 'locale': 'en-US'})

    def test_reporting_stats_empty(self):
        """Test reporting stats empty response"""
        self.helper_test_set({'campaign_id': 1132321}, empty=True)
        self.helper_test_set({'campaign_id': 5}, empty=True)

    def test_reporting_undefined_filter(self):
        """Should return 400 if an invalid filter is passed"""
        url = url_for(BASE_URL, campaiggn_id=1)
        result = self.client.get(url)
        assert_equal(result.status_code, 400)
        resp = json.loads(result.data)
        assert_equal(resp['message'], 'Unknown arguments: campaiggn_id')
