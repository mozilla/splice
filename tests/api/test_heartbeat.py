from flask import url_for
from nose.tools import assert_equal
from tests.base import BaseTestCase
from mock import Mock


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
        /__heartbeat__  test success path
        """
        url = url_for('api.heartbeat.root')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)

    def test_fail_db_heartbeat(self):
        """
        /__heartbeat__ test for DB Failure
        """
        url = url_for('api.heartbeat.root')

        def get_connect_mock(*args, **kwargs):
            raise Exception()
        connect = self.env.db.engine.connect
        self.env.db.engine.connect = Mock(side_effect=get_connect_mock)
        response = self.client.get(url)
        self.env.db.engine.connect = connect
        assert_equal(response.status_code, 500)

    def test_fail_s3_heartbeat(self):
        import splice.web.api.heartbeat
        """
        /__heartbeat__ test s3 failure
        """
        url = url_for('api.heartbeat.root')

        def get_s3_key_mock(*args, **kwargs):
            raise Exception()
        connect = self.env.db.engine.connect
        key = splice.web.api.heartbeat.Key
        splice.web.api.heartbeat.Key = Mock(side_effect=get_s3_key_mock)
        response = self.client.get(url)
        self.env.db.engine.connect = connect
        splice.web.api.heartbeat.key = key
        assert_equal(response.status_code, 500)
