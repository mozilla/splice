from nose.tools import assert_equal
from flask import url_for, json
from tests.base import BaseTestCase
from tests.populate_database import parse_csv
from collections import defaultdict


class TestAdgroup(BaseTestCase):
    def setUp(self):
        self.adgroup_fixture = defaultdict(list)
        self.new_campaign_id = 1
        self.new_adgroup = {
            "name": "Testing",
            "locale": "en-US",
            "type": "directory",
            "channel_id": 1,
            "campaign_id": self.new_campaign_id,
            "frequency_cap_daily": 3,
            "frequency_cap_total": 10,
        }

        for adgroup in parse_csv("adgroups.csv"):
            self.adgroup_fixture[int(adgroup["campaign_id"])].append(adgroup)
        super(TestAdgroup, self).setUp()

    def test_get_adgroups_by_campaign_id(self):
        for campaign_id, adgroups in self.adgroup_fixture.iteritems():
            url = url_for('api.adgroup.adgroups', campaign_id=campaign_id)
            response = self.client.get(url)
            assert_equal(response.status_code, 200)
            resp = json.loads(response.data)
            assert_equal(len(resp["message"]), len(adgroups))

    def test_post(self):
        url = url_for('api.adgroup.adgroups', campaign_id=self.new_campaign_id)
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)

    def test_post_duplicate(self):
        url = url_for('api.adgroup.adgroups', campaign_id=self.new_campaign_id)
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_post_suggested_tile(self):
        url = url_for('api.adgroup.adgroups', campaign_id=self.new_campaign_id)
        adgroup = dict(self.new_adgroup)
        adgroup["type"] = "suggested"
        adgroup["category"] = "Technology_General"
        data = json.dumps(adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)

    def test_post_with_missing_category(self):
        url = url_for('api.adgroup.adgroups', campaign_id=self.new_campaign_id)
        invalid_adgroup = dict(self.new_adgroup)
        invalid_adgroup["type"] = "suggested"
        data = json.dumps(invalid_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_http_put(self):
        url = url_for('api.adgroup.adgroups', campaign_id=self.new_campaign_id)
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new = json.loads(response.data)["message"]

        url = url_for('api.adgroup.adgroup', campaign_id=self.new_campaign_id, adgroup_id=new["id"])
        new["name"] = "new_name"
        new["frequency_cap_daily"] = 5
        new["frequency_cap_total"] = 20
        data = json.dumps(new)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 200)

    def test_http_put_404(self):
        url = url_for('api.adgroup.adgroups', campaign_id=self.new_campaign_id)
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)

        url = url_for('api.adgroup.adgroup', campaign_id=1000, adgroup_id=1001)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 404)

    def test_http_put_400(self):
        url = url_for('api.adgroup.adgroups', campaign_id=self.new_campaign_id)
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new_adgroup = json.loads(response.data)["message"]

        url = url_for('api.adgroup.adgroup', campaign_id=self.new_campaign_id, adgroup_id=new_adgroup["id"])
        new_adgroup["type"] = "suggested"
        data = json.dumps(new_adgroup)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_http_get_by_adgroup_id(self):
        url = url_for('api.adgroup.adgroups', campaign_id=self.new_campaign_id)
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new = json.loads(response.data)["message"]

        url = url_for('api.adgroup.adgroup', campaign_id=self.new_campaign_id, adgroup_id=new["id"])
        response = self.client.get(url)
        resp = json.loads(response.data)
        assert_equal(new, resp["message"])
