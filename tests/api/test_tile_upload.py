import mock
import os
import StringIO
import zipfile

from flask import url_for, json
from tests.base import BaseTestCase
from nose.tools import assert_equal
from splice.web.api import tile_upload
from splice.queries.adgroup import get_adgroups_by_campaign_id


class TestTileUpload(BaseTestCase):
    def setUp(self):
        self.bucketer = tile_upload.load_bucketer()
        self.zip_file = self.get_fixture_path("creative-samples.zip")
        self.assets_file = self.get_fixture_path("asset-samples.tsv")
        self.creative_file = self.get_fixture_path("creative-sample.png")
        self.asset = {
            "Locales Served": "en-US",
            "Category  (As per Bucketer)": "Technology_News",
            "Daily Frequency Cap": 1,
            "Total Frequency Cap": 2,
            "Clickthrough URL": "https://www.mozilla.org",
            "Tile Title": "Mozilla",
            "Asset Name: Root": "mozilla_creative",
            "Targeting Explanation": "A Mozilla fans site"
        }

        super(TestTileUpload, self).setUp()

    def test_ingest_assets(self):
        """Test ingest_assets function with zip file and assets file"""
        ingested_assets = tile_upload.ingest_assets(self.zip_file, self.assets_file, self.bucketer)
        # based on the fixture, we should get 4 different adgroups
        # reference the document in the ingest_assets for more details
        assert_equal(len(ingested_assets.keys()), 4)

        # note that the first element of value list is the adgroup, followed by all the tiles
        assert_equal(len(ingested_assets[('Technology_News', 'en-US', 'suggested', 1, 2)]), 3)
        assert_equal(len(ingested_assets[('Technology_News', 'en-US', 'suggested', 1, 1)]), 2)
        assert_equal(len(ingested_assets[('Technology_General', 'en-US', 'suggested', 1, 2)]), 2)
        assert_equal(len(ingested_assets[('Technology_Mozilla Sites', 'en-US', 'suggested', 1, 2)]), 2)

    @mock.patch('splice.web.api.tile_upload.ingest_asset')
    def test_ingest_assets_failure(self, ingest_assetMock):
        ingest_assetMock.side_effect = ValueError()
        self.assertRaises(ValueError, tile_upload.ingest_assets, self.zip_file,
                          self.assets_file, self.bucketer)

    def test_ingest_asset(self):
        """Test ingesting invalid asset"""
        locale_set = set(["en-US"])
        image_set = set(["mozilla_creative_a", "mozilla_creative_b"])

        # success case
        adgroup, tile = tile_upload.ingest_asset(self.asset, image_set, self.bucketer, locale_set)
        # only check the fields that are not copied from asset
        assert_equal(adgroup["categories"], [self.asset["Category  (As per Bucketer)"]])
        assert_equal(tile["image_uri"], self.asset["Asset Name: Root"] + "_b")
        assert_equal(tile["enhanced_image_uri"], self.asset["Asset Name: Root"] + "_a")

        # raise ValueError for unknown locales
        asset = self.asset.copy()
        asset["Locales Served"] = "en_US"
        self.assertRaises(ValueError, tile_upload.ingest_asset, asset, image_set,
                          self.bucketer, locale_set)

        # raise ValueError for unknown categories
        asset = self.asset.copy()
        asset["Category  (As per Bucketer)"] = "Unknown Category"
        self.assertRaises(ValueError, tile_upload.ingest_asset, asset, image_set,
                          self.bucketer, locale_set)

        # raise ValueError for missing creatives - case 1, all creatives missing
        asset = self.asset.copy()
        asset["Asset Name: Root"] = "missing creative"
        self.assertRaises(ValueError, tile_upload.ingest_asset, asset, image_set,
                          self.bucketer, locale_set)

        # raise ValueError for missing creatives - case 2, only one is missing
        asset = self.asset.copy()
        self.assertRaises(ValueError, tile_upload.ingest_asset, asset, set(["mozilla_creative_a"]),
                          self.bucketer, locale_set)
        asset = self.asset.copy()
        self.assertRaises(ValueError, tile_upload.ingest_asset, asset, set(["mozilla_creative_b"]),
                          self.bucketer, locale_set)

    def test_load_creatives_to_memory(self):
        creatives_map = tile_upload.load_creatives_to_memory(self.zip_file)
        assert_equal(len(creatives_map.keys()), 10)

        assert_equal(set(creatives_map.keys()), tile_upload.zip_list(self.zip_file))

    def test_bulk_upload_endpoint(self):
        """Test the API endpoint for bulk upload

        Note that we only need to check the total number of new adgroups as the
        correctness of database insertion and ingestion have been tested separately.
        """
        before = len(get_adgroups_by_campaign_id(1))
        url = url_for('api.campaign.handler_bulk_upload', campaign_id=1)
        with open(self.assets_file) as f1:
            with open(self.zip_file) as f2:
                data = {
                    'creatives': (f2, 'creatives.zip'),
                    'assets': (f1, 'assets.tsv'),
                }
                response = self.client.post(url, data=data)
                assert_equal(response.status_code, 200)
        after = len(get_adgroups_by_campaign_id(1))
        ingested_assets = tile_upload.ingest_assets(self.zip_file, self.assets_file, self.bucketer)
        assert_equal(before + len(ingested_assets), after)

    @mock.patch('splice.web.api.tile_upload.ingest_assets')
    def test_bulk_upload_endpoint_failure(self, ingest_assetsMock):
        """Test the API endpoint for bulk upload - the ingestion failure cases"""
        ingest_assetsMock.side_effect = ValueError()
        url = url_for('api.campaign.handler_bulk_upload', campaign_id=1)
        with open(self.assets_file) as f1:
            with open(self.zip_file) as f2:
                data = {
                    'creatives': (f2, 'creatives.zip'),
                    'assets': (f1, 'assets.tsv'),
                }
                response = self.client.post(url, data=data)
                assert_equal(response.status_code, 400)

    def test_bulk_upload_endpoint_failure_404(self):
        """Test the API endpoint for bulk upload - the 404 failure cases"""
        url = url_for('api.campaign.handler_bulk_upload', campaign_id=1000)
        data = {
            'creatives': (StringIO.StringIO(''), 'creatives.zip'),
            'assets': (StringIO.StringIO(''), 'assets.tsv'),
        }
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 404)

    def test_single_creative_upload_endpoint(self):
        """Test the API endpoint for the single creative upload"""
        from splice.environment import Environment

        env = Environment.instance()
        url = url_for('api.tile.handler_creative_upload')
        with zipfile.ZipFile(self.zip_file, "r") as zf:
            f = zf.getinfo("samples/firefox_mdn_a.png")
            data = {'creative': (StringIO.StringIO(zf.read(f)), 'creative.png')}
            response = self.client.post(url, data=data)
            assert_equal(response.status_code, 200)
            creative_url = json.loads(response.data)['result']
            bucket = env.s3.get_bucket(env.config.S3["bucket"])
            s3_key = os.path.basename(creative_url)
            key = bucket.get_key(s3_key)
            self.assertIsNotNone(key)

    @mock.patch('splice.web.api.tile_upload.resize_image')
    def test_single_creative_upload_endpoint_failure(self, resize_imageMock):
        """Test the API endpoint for the single creative upload - failure case"""
        resize_imageMock.side_effect = ValueError("failed to resize the image")
        url = url_for('api.tile.handler_creative_upload')
        data = {'creative': (StringIO.StringIO(''), 'creative.png')}
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 400)

    def test_single_creative_upload_endpoint_invalid_ext(self):
        """Test the API endpoint for the single creative upload - invalid ext"""
        url = url_for('api.tile.handler_creative_upload')
        data = {'creative': (StringIO.StringIO(''), 'creative.txt')}
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 400)
