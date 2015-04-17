import os
import csv
from splice.environment import Environment
from splice.webapp import create_webapp
from flask.ext.testing import TestCase

db_uri = os.environ.get('TEST_DB_URI') or 'sqlite://'
env = Environment.instance(test=True, test_db_uri=db_uri)


class BaseTestCase(TestCase):

    def __init__(self, methodName='runTest'):
        self.env = env
        super(BaseTestCase, self).__init__(methodName)
        create_webapp(self.env)

    def create_app(self):
        return self.env.application

    def setUp(self):
        self.env.db.drop_all()
        self.create_app()
        self.env.db.create_all()

        def tile_values(fd):
            for line in fd:
                row = [el.decode('utf-8') for el in line.split(',')]
                yield dict(zip(
                    ('target_url', 'bg_color', 'title', 'type', 'image_uri', 'enhanced_image_uri', 'adgroup_id'),
                    row))

        def adgroup_values(fd):
            for line in fd:
                row = [el.decode('utf-8') for el in line.split(',')]
                yield dict(zip(
                    ('id', 'locale'),
                    row))

        from splice.models import Tile, Channel, Adgroup
        session = env.db.session

        with open(self.get_fixture_path('tiles.csv')) as fd:
            for row in tile_values(fd):
                tile = Tile(**row)
                session.add(tile)

        with open(self.get_fixture_path('adgroups.csv')) as fd:
            for row in adgroup_values(fd):
                tile = Adgroup(**row)
                session.add(tile)

        with open(self.get_fixture_path('channels.csv')) as fd:
            reader = csv.DictReader(fd)
            for row in reader:
                channel = Channel(**row)
                session.add(channel)

        session.commit()

        self.channels = (
            env.db.session
            .query(Channel)
            .order_by(Channel.id.asc())
            .all())

    def tearDown(self):
        self.env.db.session.remove()
        self.env.db.drop_all()

    def get_fixture_path(self, name):
        path = os.path.dirname(__file__)
        return os.path.join(path, 'fixtures/{0}'.format(name))
