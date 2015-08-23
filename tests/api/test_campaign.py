# TODO: FIXME: This import has the side effect of creating the
# test environment. So it needs to be first.
from tests.base import BaseTestCase

from collections import defaultdict

from flask import url_for, json
from nose.tools import assert_equal

from splice.queries.campaign import insert_campaign, get_campaign
from splice.queries.common import session_scope
from tests.populate_database import parse_csv


class TestCampaignAPI(BaseTestCase):
    def setUp(self):
        self.campaign_data = {
            'name': 'Test Campaign',
            'status': 'inactive',
            'account_id': 1,
            'channel_id': 1,
        }

        self.campaign_fixture = defaultdict(list)
        for campaign in parse_csv('campaigns.csv'):
            self.campaign_fixture[int(campaign['account_id'])].append(campaign)

        super(TestCampaignAPI, self).setUp()

    def test_get_campaigns_by_account(self):
        """Test getting the list of campaigns by campaign via API (GET)."""
        # Verify two accounts are returned.
        for account_id, campaigns in self.campaign_fixture.iteritems():
            url = url_for('api.campaign.campaigns')
            url = url + '?account_id=%s' % account_id
            response = self.client.get(url)
            assert_equal(response.status_code, 200)
            resp = json.loads(response.data)
            assert_equal(len(resp['results']), len(campaigns))


    def test_post_campaign(self):
        """Test creating an campaign via API (POST)."""
        # Create the campaign via API.
        url = url_for('api.campaign.campaigns')
        data = json.dumps(self.campaign_data)
        response = self.client.post(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 201)
        campaign_id = json.loads(response.data)['result']['id']

        # Verify the right data was stored to DB.
        campaign = get_campaign(campaign_id)
        for field in ['name', 'status', 'account_id', 'channel_id']:
            assert_equal(campaign[field], self.campaign_data[field])

    def test_get_account_by_id(self):
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
        for field in ['name', 'status', 'account_id', 'channel_id']:
            assert_equal(campaign[field], self.campaign_data[field])

    def test_put_account(self):
        """Test updating a campaign via API (PUT)."""
        new_campaign_data = {
            'name': 'New Campaign Name',
            'status': 'active',
            'account_id': 2,
            'channel_id': 2,
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
        for field in ['name', 'status', 'account_id', 'channel_id']:
            assert_equal(campaign[field], new_campaign_data[field])
