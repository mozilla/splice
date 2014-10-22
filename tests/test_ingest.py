from mock import Mock
from nose.tools import assert_raises, assert_equal, assert_not_equal
from jsonschema.exceptions import ValidationError
from splice.ingest import ingest_links, generate_artifacts, IngestError, deploy
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
                "imageURI": "data:image/png;base64,somedata",
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
                "imageURI": "data:image/png;base64,somedata",
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
            "imageURI": "data:image/png;base64,somedata",
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
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            },
            {
                "imageURI": "data:image/png;base64,someotherdata",
                "url": "https://somewhereelse.com",
                "title": "Some Other Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            },
        ]

        tiles_ca = [
            {
                "imageURI": "data:image/png;base64,somedata",
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

    def test_id_not_overwritten(self):
        """
        Test an id is created for a valid tile
        """
        tiles_star = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star})
        directory_id = data["STAR/en-US"][0]["directoryId"]
        assert_equal(1, directory_id)

        data = ingest_links({"STAR/en-US": tiles_star})
        directory_id = data["STAR/en-US"][0]["directoryId"]
        assert_equal(1, directory_id)


class TestGenerateArtifacts(BaseTestCase):

    def test_generate_artifacts(self):
        """
        Tests that the correct number of artifacts are generated
        """
        tiles_star = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        tiles_ca = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star})
        artifacts = generate_artifacts(data)
        # tile index, distribution and image files are generated
        assert_equal(4, len(artifacts))

        data = ingest_links({
            "STAR/en-US": tiles_star,
            "CA/en-US": tiles_ca,
        })
        artifacts = generate_artifacts(data)
        # includes one more file: the locale data payload
        assert_equal(5, len(artifacts))

    def test_unknown_mime_type(self):
        """
        Tests that an unknown mime type is rejected
        """
        tiles_star = [
            {
                "imageURI": "data:image/weirdimage;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star})
        assert_raises(IngestError, generate_artifacts, data)

    def test_malformed_data_uri_meta(self):
        """
        Tests that a malformed data uri declaration is rejected
        """
        tiles_star = [
            {
                "imageURI": "data:image/somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star})
        assert_raises(IngestError, generate_artifacts, data)

class TestDeploy(BaseTestCase):

    def setUp(self):
        import splice.ingest

        self.key_mock = Mock()

        def get_key_mock(*args, **kwargs):
            return self.key_mock
        splice.ingest.Key = Mock(side_effect=get_key_mock)

        self.env.s3.get_bucket = Mock(return_value=Mock())
        super(TestDeploy, self).setUp()

    def test_deploy(self):
        tiles_star = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "enhancedImageURI": "data:image/png;base64,somemoredata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        tiles_ca = [
            {
                "imageURI": "data:image/png;base64,somedata",
                "url": "https://somewhere.com",
                "title": "Some Title",
                "type": "organic",
                "bgColor": "#FFFFFF"
            }
        ]

        data = ingest_links({"STAR/en-US": tiles_star})
        deploy(data)
        # 5 files are uploaded, mirrors generate artifactes
        assert_equal(5, self.key_mock.set_contents_from_string.call_count)

        self.key_mock.set_contents_from_string = Mock()
        data = ingest_links({
            "STAR/en-US": tiles_star,
            "CA/en-US": tiles_ca,
        })
        deploy(data)
        #  includes one more upload: the locate data payload
        assert_equal(6, self.key_mock.set_contents_from_string.call_count)
