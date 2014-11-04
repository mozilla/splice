import json
import magic
from mock import Mock
from nose.tools import assert_raises, assert_equal, assert_not_equal, assert_true
from jsonschema.exceptions import ValidationError
from tests.base import BaseTestCase
from splice.ingest import ingest_links, generate_artifacts, IngestError, deploy
from splice.models import Tile


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

        # the biggest ID is 99 - next one should be 100
        assert_equal(100, directory_id)

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
        assert_equal(100, directory_id_star)
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
        assert_equal(100, directory_id)

        data = ingest_links({"STAR/en-US": tiles_star})
        directory_id = data["STAR/en-US"][0]["directoryId"]
        assert_equal(100, directory_id)

    def test_error_mid_ingestion(self):
        """
        Test an error happening mid-ingestion
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
        tile_count_before = self.env.db.session.query(Tile).count()

        import splice.ingest
        insert_function = splice.ingest.insert_tile

        # put counts in a dict to get around python's
        # non-local scope restrictions on variables
        # for access in mock_ingest
        counts = {
            'call': 0,
            'exception_at': 2,
        }

        def mock_ingest(*args, **kwargs):
            counts['call'] += 1
            if counts['call'] < counts['exception_at']:
                insert_function(*args, **kwargs)
            else:
                raise Exception('Boom')

        function_mock = Mock(side_effect=mock_ingest)
        splice.ingest.insert_tile = function_mock

        ingest_links({"STAR/en-US": tiles_star})
        tile_count_after = self.env.db.session.query(Tile).count()

        # only one has been inserted out of two
        assert_equal(1, tile_count_after - tile_count_before)

        # put the module function back to what it was
        splice.ingest.insert_tile = insert_function


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

    def test_image_content(self):
        with open(self.get_fixture_path("valid_tile.json"), 'r') as f:
            tiles = json.load(f)
        data = ingest_links(tiles)
        artifacts = generate_artifacts(data)

        found_image = False
        for file in artifacts:
            if "mime" in file:
                found_image = True
                assert_equal(file["mime"], magic.from_buffer(file["data"], mime=True))

        assert_true(found_image)

    def test_ingest_dbpool(self):
        """
        Test a ingestion of a large number of tiles that could use up connections to the db
        """
        with open(self.get_fixture_path("2014-10-30.ja-pt.json"), 'r') as f:
            tiles = json.load(f)
        ingest_links(tiles)
        num_tiles = self.env.db.session.query(Tile).count()
        assert(num_tiles > 30)

    def test_ingest_no_duplicates(self):
        """
        Test that there is no duplication when ingesting tiles
        """
        with open(self.get_fixture_path("tiles_duplicates.json"), 'r') as f:
            tiles = json.load(f)

        num_tiles = self.env.db.session.query(Tile).count()
        ingest_links(tiles)
        new_num_tiles = self.env.db.session.query(Tile).count()
        assert_equal(num_tiles + 1, new_num_tiles)


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
