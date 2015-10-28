# TODO: FIXME: This import has the side effect of creating the
# test environment. So it needs to be first.
from tests.base import BaseTestCase

from collections import defaultdict

from flask import url_for, json
from nose.tools import assert_equal, assert_true

from splice.queries.campaign import insert_campaign, get_campaign
from splice.queries.common import session_scope
from tests.populate_database import parse_csv


class TestCampaignAPI(BaseTestCase):
    def setUp(self):
        self.campaign_data = {
            'name': 'Test Campaign',
            'paused': False,
            'account_id': 1,
            'channel_id': 1,
            'start_date': '2015-09-30T14:04:55+00:00',
            'end_date': '2015-10-30T14:04:55+00:00',
            'countries': ['CA', 'US'],
        }

        self.campaign_fixture = defaultdict(list)
        for campaign in parse_csv('campaigns.csv'):
            self.campaign_fixture[int(campaign['account_id'])].append(campaign)

        super(TestCampaignAPI, self).setUp()

    def test_cors(self):
        """Test the support for CORS"""
        url = url_for('api.campaign.campaigns')
        data = json.dumps(self.campaign_data)
        res = self.client.post(url,
                               data=data,
                               headers={"Origin": "foo.com"},
                               content_type='application/json')
        assert_equal(res.status_code, 201)
        assert_equal(res.headers['Access-Control-Allow-Origin'], 'foo.com')

        # test CORS gets set properly in failures
        res = self.client.post(url,
                               data=data,
                               headers={"Origin": "foo.com"},
                               content_type='application/json')
        assert_equal(res.status_code, 400)
        assert_equal(res.headers['Access-Control-Allow-Origin'], 'foo.com')

    def test_get_campaigns_by_account_id(self):
        """Test getting the list of campaigns by campaign via API (GET)."""
        # Verify two accounts are returned.
        for account_id, campaigns in self.campaign_fixture.iteritems():
            url = url_for('api.campaign.campaigns')
            url = url + '?account_id=%s&past=True' % account_id
            response = self.client.get(url)
            assert_equal(response.status_code, 200)
            resp = json.loads(response.data)
            assert_equal(len(resp['results']), len(campaigns))

    def test_get_campaigns_by_date(self):
        """Test getting the list of campaigns by campaign via API (GET), constrained to either 'past',
        'in_flight', or 'scheduled'"""

        # testing 'past'
        url = url_for('api.campaign.campaigns')
        past_url = "%s?account_id=1&past=True&in_flight=False&scheduled=False&today=2015-10-24" % url
        response = self.client.get(past_url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)
        assert_equal(len(resp['results']), 1)
        assert_equal(resp['results'][0]['name'], "MozSuggested")

        # testing 'in_flight'
        url = url_for('api.campaign.campaigns')
        past_url = "%s?account_id=1&past=False&in_flight=True&scheduled=False&today=2015-10-24" % url
        response = self.client.get(past_url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)
        assert_equal(len(resp['results']), 1)
        assert_equal(resp['results'][0]['name'], "MozDirectory")

        # testing 'scheduled'
        url = url_for('api.campaign.campaigns')
        past_url = "%s?account_id=1&past=False&in_flight=False&scheduled=True&today=2015-09-01" % url
        response = self.client.get(past_url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)
        assert_equal(len(resp['results']), 2)
        found_dir = False
        found_sug = False
        for res in resp['results']:
            if res['name'] == "MozDirectory":
                found_dir = True
            elif res['name'] == "MozSuggested":
                found_sug = True
        assert_true(found_dir and found_sug)

    def test_post_campaign(self):
        """Test creating an campaign via API (POST)."""
        # Create the campaign via API.
        url = url_for('api.campaign.campaigns')
        data = json.dumps(self.campaign_data)
        response = self.client.post(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 201)
        new_campaign = json.loads(response.data)['result']

        # Verify the right data was stored to DB.
        url = url_for('api.campaign.campaign', campaign_id=new_campaign['id'])
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)
        campaign = resp['result']
        assert_equal(campaign, new_campaign)

        # Posting again with same name should fail with a 400.
        url = url_for('api.campaign.campaigns')
        response = self.client.post(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 400)

    def test_get_campaign_by_id(self):
        """Test getting the details of a specific campaign via API (GET)."""
        # Create a new campaign.
        with session_scope() as session:
            campaign_id = insert_campaign(session, self.campaign_data)['id']

        # Verify the API returns it with the right data.
        url = url_for('api.campaign.campaign', campaign_id=campaign_id)
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)
        campaign = resp['result']
        for field in ['name', 'account_id', 'channel_id', 'countries', 'paused']:
            assert_equal(campaign[field], self.campaign_data[field])

    def test_put_campaign(self):
        """Test updating a campaign via API (PUT)."""
        from flask_restful.inputs import datetime_from_iso8601
        new_campaign_data = {
            'name': 'New Campaign Name',
            'paused': True,
            'account_id': 2,
            'channel_id': 2,
            'countries': ['CA', 'FR'],
            'start_date': '2015-10-30T14:04:55+00:00',
            'end_date': '2015-12-30T14:04:55+00:00',
        }

        # Create a new campaign.
        with session_scope() as session:
            campaign_id = insert_campaign(session, self.campaign_data)['id']

        # Update the campaign with the new data.
        url = url_for('api.campaign.campaign', campaign_id=campaign_id)
        data = json.dumps(new_campaign_data)
        response = self.client.put(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 200)

        # Verify the data.
        campaign = get_campaign(campaign_id)
        for field in ['name', 'account_id', 'channel_id', 'paused', 'countries']:
            assert_equal(campaign[field], new_campaign_data[field])
        for field in ['start_date', 'end_date']:
            assert_equal(campaign[field], datetime_from_iso8601(new_campaign_data[field]))
