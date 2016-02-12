import mock
import StringIO
import json

from flask import url_for
from tests.base import BaseTestCase
from splice.web.api import content_upload
from nose.tools import assert_equal


class TestContent(BaseTestCase):
    def setUp(self):
        self.zip_file = self.get_fixture_path("content-demo.zip")

    @mock.patch('splice.web.api.content_upload._sign_content')
    @mock.patch('splice.web.api.content_upload.upload_content_to_s3')
    def test_upload_content_endpoint(self, s3Mock, signMock):
        """Test the API endpoint for the content upload """
        dummy_signature = {
            "certificate": {"encryptionKey": "somerandomkey"},
            "signatures": [{"signature": "somesignature"}]
        }
        signMock.return_value = [dummy_signature] * 4  # four files in the manifest
        s3Mock.return_value = "http://bucket/content"
        url = url_for('api.content.handler_content_upload', name="foo", version="0")

        with open(self.zip_file) as f:
            data = {
                'content': (f, 'test.zip'),
            }
            response = self.client.post(url, data=data)
            assert_equal(response.status_code, 200)
            urls = json.loads(response.data)['results']
            # (2 unsigned + 4 signed) + (manifest) + (the original zip file)
            assert_equal(len(urls), 8)

    @mock.patch('splice.web.api.content_upload._digest_content')
    def test_upload_content_endpoint_failure(self, signMock):
        """Test the API endpoint for the content upload, the failure case """
        signMock.side_effect = Exception("Upload error")
        url = url_for('api.content.handler_content_upload', name="foo", version="0")

        with open(self.zip_file) as f:
            data = {
                'content': (f, 'test.zip'),
            }
            response = self.client.post(url, data=data)
            assert_equal(response.status_code, 400)

    def test_upload_content_endpoint_missing_name(self):
        """Test the API endpoint for the content upload without posting name"""
        url = url_for('api.content.handler_content_upload')

        data = {
            'content': (StringIO.StringIO("<html><html/>"), 'test.zip'),
        }
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 400)

    def test_upload_content_endpoint_invalid_ext(self):
        """Test the API endpoint for the content upload, the invalid file extention"""
        url = url_for('api.content.handler_content_upload', name="foo")

        data = {
            'content': (StringIO.StringIO("<html><html/>"), 'test.txt'),
        }
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 400)

    def test_upload_content_endpoint_invalid_version(self):
        """Test the API endpoint for the content upload, the invalid version"""
        url = url_for('api.content.handler_content_upload', name="foo", version="-1")

        data = {
            'content': (StringIO.StringIO("<html><html/>"), 'test.zip'),
        }
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 400)

        data = {
            'content': (StringIO.StringIO("<html><html/>"), 'test.zip'),
        }
        url = url_for('api.content.handler_content_upload', name="foo", version="invalid")
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 400)

    @mock.patch('requests.post')
    def test_sign_content_failure(self, requestsMock):
        """Test the failure cases for sign content"""
        ret = mock.Mock()
        ret.status_code = 500
        requestsMock.return_value = ret
        self.assertRaises(Exception, content_upload._sign_content, {"content": "some_content"})

        requestsMock.side_effect = Exception("Connection time out")
        self.assertRaises(Exception, content_upload._sign_content, {"content": "some_content"})
