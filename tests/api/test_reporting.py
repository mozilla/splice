from tests.base import BaseTestCase

from flask import url_for, json
from nose.tools import assert_equal
from splice.web.api.reporting import valid_group_by

BASE_URL = 'api.reporting.stats'

filter_examples = {
    'account_id': 1,
    'campaign_id': 1,
    'adgroup_id': 1,
    'type': 'affiliate',
    'adgroup_type': 'directory',
    'country_code': 'US',
    'locale': 'en-US',
    'channel_id': 1,
    'start_date': '2015-09-01',
    'end_date': '2015-10-30',
    'tile_id': [1, 2, 3]
}


class TestReportingAPI(BaseTestCase):

    def setUp(self):
        super(TestReportingAPI, self).setUp(load_stats=True)

    def helper_test_set(self, filters={}, status_code=200, base_url=BASE_URL, empty=False):
        group_by = filters.get('group_by')
        if type(group_by) is str:
            group_by_fields = [group_by]
        else:
            group_by_fields = group_by or ['date']
        url = url_for(base_url, **filters)

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

    def test_group_by(self):
        """Test all group by options"""
        for column in valid_group_by.keys():
            self.helper_test_set(filters={'group_by': column})
            for k, v in filter_examples.iteritems():
                filters = {'group_by': column}
                filters[k] = v
                self.helper_test_set(filters=filters)

    def test_group_by_multiple(self):
        """Test group by multiple categories"""
        self.helper_test_set({'group_by': ['date', 'category']})
        self.helper_test_set({'group_by': ['category', 'country_code', 'locale']})
        self.helper_test_set({'group_by': ['date', 'category'], 'locale': 'en-US'})

    def test_reporting_stats_empty(self):
        self.helper_test_set({'account_id': 1132321}, empty=True)
        self.helper_test_set({'campaign_id': 1132321}, empty=True)
        self.helper_test_set({'campaign_id': 5}, empty=True)
        self.helper_test_set({'locale': 'foo'}, empty=True)
        self.helper_test_set({'group_by': ['date', 'category'], 'channel_id': 1132321}, empty=True)
        self.helper_test_set({'start_date': '2016-04-01'}, empty=True)

    def test_multiple_cross_db_filter_error(self):
        """Test reporting stats empty response"""
        url = url_for(BASE_URL, group_by=['category', 'adgroup_id'])
        result = self.client.get(url)
        assert_equal(result.status_code, 400)
        resp = json.loads(result.data)
        assert_equal(resp['message'], 'You may only group by ONE of category and adgroup_id')

    def test_reporting_undefined_filter(self):
        """Should return 400 if an invalid filter is passed"""
        url = url_for(BASE_URL, campaiggn_id=1)
        result = self.client.get(url)
        assert_equal(result.status_code, 400)
        resp = json.loads(result.data)
        assert_equal(resp['message'], 'Unknown arguments: campaiggn_id')
