from nose.tools import assert_equal, assert_true
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
            "campaign_id": self.new_campaign_id,
            "frequency_cap_daily": 3,
            "frequency_cap_total": 10,
            "paused": 'false',
        }

        for adgroup in parse_csv("adgroups.csv"):
            self.adgroup_fixture[int(adgroup["campaign_id"])].append(adgroup)
        super(TestAdgroup, self).setUp()

    def test_cors(self):
        """Test the support for CORS"""
        url = url_for('api.adgroup.adgroups')
        data = json.dumps(self.new_adgroup)
        res = self.client.post(url, data=data, content_type='application/json')
        assert_equal(res.status_code, 201)
        assert_equal(res.headers['Access-Control-Allow-Origin'], '*')
        assert_equal(res.headers['Access-Control-Max-Age'], '21600')
        assert_true('HEAD' in res.headers['Access-Control-Allow-Methods'])
        assert_true('POS' in res.headers['Access-Control-Allow-Methods'])
        assert_true('GET' in res.headers['Access-Control-Allow-Methods'])
        assert_true('OPTIONS' in res.headers['Access-Control-Allow-Methods'])
        assert_true('CONTENT-TYPE' in res.headers['Access-Control-Allow-Headers'])

    def test_get_adgroups_by_campaign_id(self):
        """ Test for getting all adgroups for a given campaign id
        """
        for campaign_id, adgroups in self.adgroup_fixture.iteritems():
            url = url_for('api.adgroup.adgroups', campaign_id=campaign_id)
            response = self.client.get(url)
            assert_equal(response.status_code, 200)
            resp = json.loads(response.data)
            assert_equal(len(resp["results"]), len(adgroups))

    def test_post_and_get(self):
        """ Test for HTTP POST and GET
        """
        url = url_for('api.adgroup.adgroups')
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new = json.loads(response.data)["result"]

        url = url_for('api.adgroup.adgroup', adgroup_id=new["id"])
        response = self.client.get(url)
        resp = json.loads(response.data)
        assert_equal(new, resp["result"])

    def test_post_duplicate(self):
        """ Test HTTP POST the same data twice, it should reject the second one as
        invalid arguments
        """
        url = url_for('api.adgroup.adgroups')
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_post_suggested_tile(self):
        """ Test the success case of HTTP POST for suggested tiles
        """
        url = url_for('api.adgroup.adgroups')
        adgroup = dict(self.new_adgroup)
        adgroup["type"] = "suggested"
        adgroup["categories"] = ["Technology_General"]
        data = json.dumps(adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new = json.loads(response.data)["result"]

        url = url_for('api.adgroup.adgroup', adgroup_id=new["id"])
        response = self.client.get(url)
        resp = json.loads(response.data)
        assert_equal(new, resp["result"])

    def test_update_category_suggested_tile(self):
        """ Test updating category info for a suggested tile
        """
        url = url_for('api.adgroup.adgroups')
        adgroup = dict(self.new_adgroup)
        adgroup["type"] = "suggested"
        adgroup["categories"] = ["Technology_General"]
        data = json.dumps(adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new = json.loads(response.data)["result"]

        url = url_for('api.adgroup.adgroup', adgroup_id=new["id"])
        new['categories'] = ["Technology_Mobile", "Technology_News"]
        data = json.dumps(new)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 200)
        updated = json.loads(response.data)["result"]

        response = self.client.get(url)
        resp = json.loads(response.data)
        assert_equal(updated, resp["result"])

        # emptying categories for a suggested tile should get a 400 error
        new['categories'] = []
        data = json.dumps(new)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_post_with_missing_category(self):
        """ Test the failure case of HTTP POST for suggested tiles. If not specify
        category of adgroup, it should respond a 400 error
        """
        url = url_for('api.adgroup.adgroups')
        invalid_adgroup = dict(self.new_adgroup)
        invalid_adgroup["type"] = "suggested"
        data = json.dumps(invalid_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_http_put(self):
        """ Test the success case of HTTP PUT
        """
        url = url_for('api.adgroup.adgroups')
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new = json.loads(response.data)["result"]

        url = url_for('api.adgroup.adgroup', adgroup_id=new["id"])
        new["name"] = "new_name"
        new["paused"] = True
        new["frequency_cap_daily"] = 5
        new["frequency_cap_total"] = 20
        data = json.dumps(new)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 200)
        updated = json.loads(response.data)["result"]

        url = url_for('api.adgroup.adgroup', adgroup_id=new["id"])
        response = self.client.get(url)
        resp = json.loads(response.data)
        assert_equal(updated, resp["result"])

    def test_http_put_404(self):
        """ Test the failure case of HTTP PUT. Editing a missing adgroup ends up with a 404 error
        """
        url = url_for('api.adgroup.adgroups')
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)

        url = url_for('api.adgroup.adgroup', adgroup_id=1001)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 404)

    def test_http_put_400(self):
        """ Test the failure case of HTTP PUT. Changing the type of adgroup to 'suggest' without specifying
        category ends up with a 400 error
        """
        url = url_for('api.adgroup.adgroups')
        data = json.dumps(self.new_adgroup)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new_adgroup = json.loads(response.data)["result"]

        url = url_for('api.adgroup.adgroup', adgroup_id=new_adgroup["id"])
        new_adgroup["type"] = "suggested"
        data = json.dumps(new_adgroup)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)
