from nose.tools import assert_raises, assert_equal, assert_not_equal
from jsonschema.exceptions import ValidationError
from splice.ingest import ingest_links, IngestError
from tests.base import BaseTestCase


class TestIngestLinks(BaseTestCase):

    def test_invalid_data(self):
        """
        Invalid data is sent for ingestion
        """
        assert_raises(ValidationError, ingest_links, {"invalid": {"data": 1}})

    def test_empty_data(self):
        """
        Empty data input is not processed
        """
        data = ingest_links({})
        assert_equal(data, {})

    def test_invalid_country_code(self):
        """
        Invalid country code is rejected
        """
        assert_raises(IngestError, ingest_links, {"INVALID/en-US": [
            {
                "imageURI": "https://somewhere.com/image.png",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]})

    def test_invalid_locale(self):
        """
        Invalid locale is rejected
        """
        assert_raises(IngestError, ingest_links, {"US/en-DE": [
            {
                "imageURI": "https://somewhere.com/image.png",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]})

    def test_id_creation(self):
        """
        Test an id is created for a valid tile
        """
        tile = {
            "imageURI": "https://somewhere.com/image.png",
            "url": "https://somewhere.com",
            "title": "Some Title",
            "type": "organic",
            "bgColor": "#FFFFFF"
        }
        data = ingest_links({"STAR/en-US": [tile]})
        directory_id = data["STAR/en-US"][0]["directoryId"]
        assert_equal(1, directory_id)

    def test_id_not_duplicated(self):
        """
        Test an id is created for a valid tile
        """
        tiles_star = [
            {
                "imageURI": "https://somewhere.com/image.png",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            },
            {
                "imageURI": "https://somewhereelse.com/image.png",
                "url": "https://somewhereelse.com",
                "title": "Some Other Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            },
        ]

        tiles_ca = [
            {
                "imageURI": "https://somewhere.com/image.png",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]
        data = ingest_links({
            "STAR/en-US": tiles_star,
            "CA/en-US": tiles_ca,
        })
        directory_id_star = data["STAR/en-US"][0]["directoryId"]
        directory_id_ca = data["CA/en-US"][0]["directoryId"]
        assert_equal(1, directory_id_star)
        assert_not_equal(data["STAR/en-US"][1]["directoryId"], directory_id_star)
        assert_equal(directory_id_ca, directory_id_star)
