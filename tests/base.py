import os
import csv
from splice.environment import Environment
from splice.webapp import create_webapp
from flask.ext.testing import TestCase

env = Environment.instance(test=True)


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

        def tile_values(fd):
            for line in fd:
                row = [el.decode('utf-8') for el in line.split(',')]
                yield dict(zip(
                    ('id', 'target_url', 'bg_color', 'title', 'type', 'image_uri', 'enhanced_image_uri', 'locale'),
                    row))

        from splice.models import Tile, Channel
        session = env.db.session

        with open(self.get_fixture_path('tiles.csv')) as fd:
            for row in tile_values(fd):
                tile = Tile(**row)
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
