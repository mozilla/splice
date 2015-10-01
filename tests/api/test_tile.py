from nose.tools import assert_equal, assert_true
from flask import url_for, json
from tests.base import BaseTestCase
from tests.populate_database import parse_csv
from collections import defaultdict


class TestTile(BaseTestCase):
    def setUp(self):
        self.tile_fixture = defaultdict(list)
        self.new_adgroup_id = 1
        self.new_tile = {
            'title': "New Tile",
            'target_url': "http://www.newtile.com",
            'adgroup_id': self.new_adgroup_id,
            'type': "affiliate",
            'status': "unapproved",
            'paused': False,
            'image_uri': "data:image/image_uri_new_tile",
            'enhanced_image_uri': "data:image/enhanced_image_uri_new_tile",
        }

        for tile in parse_csv("tiles.csv"):
            self.tile_fixture[int(tile["adgroup_id"])].append(tile)
        super(TestTile, self).setUp()

    def test_cors(self):
        """Test the support for CORS"""
        url = url_for('api.tile.tiles')
        data = json.dumps(self.new_tile)
        res = self.client.post(url, data=data, content_type='application/json')
        assert_equal(res.status_code, 201)
        assert_equal(res.headers['Access-Control-Allow-Origin'], '*')
        assert_equal(res.headers['Access-Control-Max-Age'], '21600')
        assert_true('HEAD' in res.headers['Access-Control-Allow-Methods'])
        assert_true('POS' in res.headers['Access-Control-Allow-Methods'])
        assert_true('GET' in res.headers['Access-Control-Allow-Methods'])
        assert_true('OPTIONS' in res.headers['Access-Control-Allow-Methods'])
        assert_true('CONTENT-TYPE' in res.headers['Access-Control-Allow-Headers'])

    def test_get_tiles_by_adgroup_id(self):
        """ Test for getting all tiles for a given adgroup id
        """
        for adgroup_id, tiles in self.tile_fixture.iteritems():
            url = url_for('api.tile.tiles', adgroup_id=adgroup_id)
            response = self.client.get(url)
            assert_equal(response.status_code, 200)
            resp = json.loads(response.data)
            assert_equal(len(resp["results"]), len(tiles))

    def test_get_tiles_404(self):
        """ Test the failure case of HTTP GET
        """
        url = url_for('api.tile.tiles', adgroup_id=10001)
        response = self.client.get(url)
        assert_equal(response.status_code, 404)

    def test_post_and_get(self):
        """ Test for HTTP POST and GET
        """
        url = url_for('api.tile.tiles')
        data = json.dumps(self.new_tile)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new = json.loads(response.data)["result"]

        url = url_for('api.tile.tile', adgroup_id=self.new_adgroup_id, tile_id=new["id"])
        response = self.client.get(url)
        resp = json.loads(response.data)
        assert_equal(new, resp["result"])

    def test_post_400_missing_argument(self):
        """ Test the failure case of HTTP POST
        """
        url = url_for('api.tile.tiles')
        tile = dict(self.new_tile)
        del tile["title"]
        data = json.dumps(tile)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_post_400_invalid_argument(self):
        """ Test the failure case of HTTP POST
        """
        url = url_for('api.tile.tiles')
        tile = dict(self.new_tile)
        tile["target_url"] = "someinsane.site.com.*"
        data = json.dumps(tile)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

        tile = dict(self.new_tile)
        tile["image_uri"] = "invalid_image_code"
        data = json.dumps(tile)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_post_duplicate(self):
        """ Test HTTP POST the same data twice, it should reject the second one as
        invalid arguments
        """
        url = url_for('api.tile.tiles')
        data = json.dumps(self.new_tile)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)

    def test_http_put(self):
        """ Test the success case of HTTP PUT
        """
        url = url_for('api.tile.tiles')
        data = json.dumps(self.new_tile)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new = json.loads(response.data)["result"]

        url = url_for('api.tile.tile', tile_id=new["id"])
        new["status"] = "approved"
        data = json.dumps(new)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 200)
        updated = json.loads(response.data)["result"]

        url = url_for('api.tile.tile', tile_id=new["id"])
        response = self.client.get(url)
        resp = json.loads(response.data)
        assert_equal(updated, resp["result"])

    def test_http_put_404(self):
        """ Test the failure case of HTTP PUT. Editing a missing tile ends up with a 404 error
        """
        url = url_for('api.tile.tiles')
        data = json.dumps(self.new_tile)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)

        url = url_for('api.tile.tile', adgroup_id=1000, tile_id=1001)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 404)

    def test_http_put_400(self):
        """ Test the failure case of HTTP PUT. Sending request without required fileds should
        get a 400 error
        """
        url = url_for('api.tile.tiles')
        data = json.dumps(self.new_tile)
        response = self.client.post(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 201)
        new_tile = json.loads(response.data)["result"]

        url = url_for('api.tile.tile', tile_id=new_tile["id"])
        new_tile["bg_color"] = "invalid_bg_color"
        data = json.dumps(new_tile)
        response = self.client.put(url, data=data, content_type="application/json")
        assert_equal(response.status_code, 400)
