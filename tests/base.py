import os
from flask.ext.testing import TestCase
from splice.environment import Environment
from splice.webapp import create_webapp


class BaseTestCase(TestCase):

    def __init__(self, methodName='runTest'):
        super(BaseTestCase, self).__init__(methodName)
        self.env = Environment.instance(test=True)
        create_webapp(self.env)

    def create_app(self):
        return self.env.application

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
        path = os.path.dirname(__file__)
        return os.path.join(path, 'fixtures/{0}'.format(name))
