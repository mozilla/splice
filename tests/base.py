import os
import populate_database
from splice.environment import Environment
from splice.webapp import create_webapp
from flask.ext.testing import TestCase

db_uri = os.environ.get('TEST_DB_URI') or "postgres://localhost/splice_test"
env = Environment.instance(test=True, test_db_uri=db_uri)


class BaseTestCase(TestCase):
    load_fixtures = True

    def __init__(self, methodName='runTest'):
        self.env = env
        super(BaseTestCase, self).__init__(methodName)
        create_webapp(self.env)

    def create_app(self):
        return self.env.application

    def setUp(self):
        if self.load_fixtures:
            from splice.models import Channel

            populate_database.insert(env, drop=True)

            self.channels = (
                env.db.session
                .query(Channel)
                .order_by(Channel.id.asc())
                .all())
        else:
            env.db.drop_all()
            env.db.create_all()

    def tearDown(self):
        self.env.db.session.remove()
        self.env.db.drop_all()

    def get_fixture_path(self, name):
        path = os.path.dirname(__file__)
        return os.path.join(path, 'fixtures/{0}'.format(name))
