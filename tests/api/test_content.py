import mock
import StringIO
import json
import copy

from flask import url_for
from tests.base import BaseTestCase
from splice.web.api import content_upload
from nose.tools import assert_equal


class TestContent(BaseTestCase):
    def setUp(self):
        self.zip_file = self.get_fixture_path("content-demo.zip")
        super(TestContent, self).setUp()

    @mock.patch('splice.web.api.content_upload._sign_content')
    @mock.patch('splice.web.api.content_upload.upload_content_to_s3')
    def test_upload_content_endpoint(self, s3Mock, signMock):
        """Test the API endpoint for the content upload """
        dummy_signature = {
            "public_key": "somerandomkey",
            "content-signature": "somesignature"
        }
        signMock.return_value = [dummy_signature] * 4  # four files in the manifest
        s3Mock.return_value = "http://bucket/content"
        url = url_for('api.content.handler_content_upload', name="foo")

        with open(self.zip_file) as f:
            data = {
                'content': (f, 'test.zip'),
            }
            response = self.client.post(url, data=data)
            assert_equal(response.status_code, 200)
            urls = json.loads(response.data)['results']
            # (2 unsigned + 4 signed) + (manifest) + (the original zip file)
            assert_equal(len(urls), 8)

        # if there is no version specified in the query string, it acts the same as above
        url_without_version = url_for('api.content.handler_content_upload', name="foo")
        with open(self.zip_file) as f:
            data = {
                'content': (f, 'test.zip'),
            }
            response = self.client.post(url_without_version, data=data)
            assert_equal(response.status_code, 200)
            urls_again = json.loads(response.data)['results']
            # (2 unsigned + 4 signed) + (manifest) + (the original zip file)
            assert_equal(len(urls), 8)
        assert_equal(urls, urls_again)

    @mock.patch('splice.web.api.content_upload._sign_content')
    @mock.patch('splice.web.api.content_upload.upload_content_to_s3')
    def test_upload_content_endpoint_resign(self, s3Mock, signMock):
        """Test the API endpoint for the content upload - re-sign a content"""
        dummy_signature = {
            "public_key": "somerandomkey",
            "content-signature": "somesignature"
        }
        signMock.return_value = [dummy_signature] * 4  # four files in the manifest
        s3Mock.return_value = "http://bucket/content"
        url = url_for('api.content.handler_content_upload', name="remote_new_tab", version="0")

        with open(self.zip_file) as f:
            data = {
                'content': (f, 'test.zip'),
            }
            response = self.client.post(url, data=data)
            assert_equal(response.status_code, 200)
            content = json.loads(response.data)['content']
            # re-sign an existing content should not bump up the version
            assert_equal(content['version'], 1)

    @mock.patch('splice.web.api.content_upload._sign_content')
    @mock.patch('splice.web.api.content_upload.upload_content_to_s3')
    def test_upload_content_endpoint_sign_existing(self, s3Mock, signMock):
        """Test the API endpoint for the content upload - sign an existing content"""
        dummy_signature = {
            "public_key": "somerandomkey",
            "content-signature": "somesignature"
        }
        signMock.return_value = [dummy_signature] * 4  # four files in the manifest
        s3Mock.return_value = "http://bucket/content"
        url = url_for('api.content.handler_content_upload', name="remote_new_tab")

        with open(self.zip_file) as f:
            data = {
                'content': (f, 'test.zip'),
            }
            response = self.client.post(url, data=data)
            assert_equal(response.status_code, 200)
            urls = json.loads(response.data)['results']
            # (2 unsigned + 4 signed) + (manifest) + (the original zip file)
            assert_equal(len(urls), 8)
            content = json.loads(response.data)['content']
            # it should bump up the version for the existing content
            assert_equal(content['version'], 2)

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
        response = self.client.post(url, data=copy.deepcopy(data))
        assert_equal(response.status_code, 400)

        url = url_for('api.content.handler_content_upload', name="foo", version="invalid")
        response = self.client.post(url, data=copy.deepcopy(data))
        assert_equal(response.status_code, 400)

        # a new content should be versioned from 0
        url = url_for('api.content.handler_content_upload', name="foo", version=1)
        response = self.client.post(url, data=copy.deepcopy(data))
        assert_equal(response.status_code, 400)

        # the specified version is ahead of the controlled version
        url = url_for('api.content.handler_content_upload', name="remote_new_tab", version=3)
        response = self.client.post(url, data=copy.deepcopy(data))
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

    @mock.patch('splice.web.api.content_upload._sign_content')
    @mock.patch('splice.web.api.content_upload.upload_content_to_s3')
    @mock.patch('splice.web.api.content_upload._get_original_content')
    def test_upload_content_endpoint_resign_all(self, origMock, s3Mock, signMock):
        """Test the API endpoint for the content resign all"""
        dummy_signature = {
            "public_key": "somerandomkey",
            "content-signature": "somesignature"
        }
        signMock.return_value = [dummy_signature] * 4  # four files in the manifest
        s3Mock.return_value = "http://bucket/content"
        # have to open the zip file every time
        origMock.side_effect = lambda a, b, c: open(self.zip_file)
        url = url_for('api.content.handler_content_resign_all')

        response = self.client.post(url)
        assert_equal(response.status_code, 200)
        succeeded = json.loads(response.data)['succeeded']
        failed = json.loads(response.data)['failed']
        assert_equal(len(succeeded), 3)
        assert_equal(len(failed), 0)

    @mock.patch('splice.web.api.content_upload._sign_content')
    def test_upload_content_endpoint_resign_all_failed(self, signMock):
        """Test the API endpoint for the content resign all - failed """
        signMock.side_effect = Exception("Can't reach signing server")
        url = url_for('api.content.handler_content_resign_all')

        response = self.client.post(url)
        assert_equal(response.status_code, 200)
        succeeded = json.loads(response.data)['succeeded']
        failed = json.loads(response.data)['failed']
        assert_equal(len(succeeded), 0)
        assert_equal(len(failed), 3)
