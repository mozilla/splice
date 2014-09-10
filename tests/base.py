import os
from splice.utils import environment_manager_create
from flask.ext.testing import TestCase


class BaseTestCase(TestCase):

    def create_app(self):
        self.app = environment_manager_create(test=True)
        return self.app

    def setUp(self):
        self.create_app()
        self.env.db.create_all()

        def values(fd):
            for line in fd:
                yield line.split(',')

        # load db
        from splice.models import impression_stats_daily
        with open(self.get_fixture_path('impression_stats.csv')) as fd:
            impression_stats_daily.insert().values(values(fd))

    def tearDown(self):
        self.env.db.session.remove()
        self.env.db.drop_all()

    def get_fixture_path(self, name):
        return os.path.join(os.path.dirname(__file__), '/fixtures/{0}'.format(name))

    @property
    def env(self):
        from splice.environment import Environment
        return Environment.instance()