import os
from splice.environment import Environment
from splice.webapp import create_webapp
from datetime import datetime
env = Environment.instance(test=True)

from flask.ext.testing import TestCase


class BaseTestCase(TestCase):

    def __init__(self, methodName='runTest'):
        self.env = env
        super(BaseTestCase, self).__init__(methodName)
        create_webapp(self.env)

    def create_app(self):
        return self.env.application

    def setUp(self):
        self.create_app()
        self.env.db.create_all()

        def values(fd):
            for line in fd:
                row = line.split(',')
                # sqlalchemy doesn't like date strings....
                row[1] = datetime.strptime(row[1], "%Y-%m-%d").date()
                yield row

        # load db
        from splice.models import impression_stats_daily
        conn = Environment.instance().db.engine.connect()
        with open(self.get_fixture_path('impression_stats.csv')) as fd:
            for row in values(fd):
                ins = impression_stats_daily.insert().values(row)
                conn.execute(ins)

    def tearDown(self):
        self.env.db.session.remove()
        self.env.db.drop_all()

    def get_fixture_path(self, name):
        path = os.path.dirname(__file__)
        return os.path.join(path, 'fixtures/{0}'.format(name))
