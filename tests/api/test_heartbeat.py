from flask import url_for
from nose.tools import assert_equal
from tests.base import BaseTestCase
from mock import Mock, PropertyMock


class TestHeartbeat(BaseTestCase):

    def setUp(self):
        import splice.web.api.heartbeat
        super(TestHeartbeat, self).setUp()

        def get_key_mock(*args, **kwargs):
            return self.key_mock
        self.key_mock = Mock()
        splice.web.api.heartbeat.Key = Mock(side_effect=get_key_mock)

        def get_bucket_mock(*args, **kwargs):
            return self.bucket_mock
        self.bucket_mock = Mock()
        self.env.s3.get_bucket = Mock(side_effect=get_bucket_mock)

    def test_heartbeat(self):
        """
        /__heartbeat__
        """
        url = url_for('api.heartbeat.root')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

