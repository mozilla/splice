import mock
import StringIO

from flask import url_for
from tests.base import BaseTestCase
from splice.web.api import content_upload
from nose.tools import assert_equal


class TestContent(BaseTestCase):
    @mock.patch('requests.post')
    def test_signed_content_payload(self, requestsMock):
        """A dummy test for the purpose of code coverage"""
        ret = mock.Mock()
        ret.json.return_value = [{}]
        ret.status_code = 201
        requestsMock.return_value = ret
        sig, _ = content_upload.sign_content_payload('somecontent', 'test.html')
        assert_equal(sig, {})

        ret.status_code = 403
        requestsMock.return_value = ret
        self.assertRaises(Exception, content_upload.sign_content_payload, 'somecontent', 'test.html')

        requestsMock.side_effect = Exception("Can't reach signing server")
        self.assertRaises(Exception, content_upload.sign_content_payload, 'somecontent', 'test.html')

    @mock.patch('splice.web.api.content_upload.sign_content_payload',
                return_value=({"signatures": [{"signature": "keyid=1;p256ecdsa=MGUCMG73F1go+7AQMa"}]},
                              "JKLFD132FDSAFDSHLLSDFC23"))
    @mock.patch('splice.web.api.content_upload.upload_content_to_s3',
                return_value=("https://tiles-local-dev.s3.amazonaws.com/demo.html"))
    def test_upload_signed_content(self, signMock, uploadMock):
        """Test upload signed content"""
        f = StringIO.StringIO("A testing content")
        url = content_upload.upload_signed_content(f, "test.html")
        assert_equal(url, "https://tiles-local-dev.s3.amazonaws.com/demo.html")

        signMock.side_effect = Exception("Can't reach to the signing server")
        self.assertRaises(Exception, content_upload.upload_signed_content, f, "test.html")

        signMock.return_value = ({"signatures": [{"signature": "keyid=1;p256ecdsa=MGUCMG73F1go+7AQMa"}]},
                                 "JKLFD132FDSAFDSHLLSDFC23")
        uploadMock.side_effect = Exception("Can't reach to the s3 server")

        self.assertRaises(Exception, content_upload.upload_signed_content, f, "test.html")

    @mock.patch('splice.web.api.content_upload.sign_content_payload')
    def test_upload_content_endpoint(self, signMock):
        """Test the API endpoint for the content upload """
        s3_key = "somehash"
        mock_signature = "keyid=1;p256ecdsa=MGUCMG73F1go+7AQMa"
        signMock.return_value = ({"signatures": [{"signature": mock_signature}]}, s3_key)
        url = url_for('api.content.handler_content_upload')
        data = {
            'content': (StringIO.StringIO("<html><html/>"), 'test.html'),
        }
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 200)

    @mock.patch('splice.web.api.content_upload.sign_content_payload')
    def test_upload_content_endpoint_failure(self, signMock):
        """Test the API endpoint for the content upload, the failure case """
        signMock.side_effect = Exception("Upload error")
        url = url_for('api.content.handler_content_upload')

        data = {
            'content': (StringIO.StringIO("<html><html/>"), 'test.html'),
        }
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 400)

    def test_upload_content_endpoint_invalid_ext(self):
        """Test the API endpoint for the content upload, the invalid file extention"""
        url = url_for('api.content.handler_content_upload')

        data = {
            'content': (StringIO.StringIO("<html><html/>"), 'test.txt'),
        }
        response = self.client.post(url, data=data)
        assert_equal(response.status_code, 400)
