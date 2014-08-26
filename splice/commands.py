import os
from flask.ext.script import Command, Option, Manager
from flask.ext.script.commands import InvalidCommand
from gunicorn.app.base import Application as GunicornApplication
from gunicorn.config import Config as GunicornConfig
from splice.utils import environment_manager_create


class GunicornServerCommand(Command):
    """
    Run the splice Server using gunicorn
    """
    def __init__(self, host='127.0.0.1', port=5000, workers=1,
                 access_logfile='-', max_requests=0, debug=True):
        self.options = {
            "host": host,
            "port": port,
            "workers": workers,
            "access_logfile": access_logfile,
            "max_requests": max_requests,
            "debug": debug,
        }

    def get_options(self):
        options = (
            Option('-H', '--host',
                   dest='host',
                   type=str,
                   default=self.options['host'],
                   help="hostname to bind server to"),
            Option('-p', '--port',
                   dest='port',
                   type=int,
                   default=self.options['port'],
                   help="port to bind server to"),
            Option('-w', '--workers',
                   dest='workers',
                   type=int,
                   default=self.options['workers'],
                   help="set the number of workers"),
            Option('--access-logfile',
                   dest='access_logfile',
                   type=str,
                   default=self.options['access_logfile'],
                   help="set the access log output location"),
            Option('--max-requests',
                   dest='max_requests',
                   type=int,
                   default=self.options['max_requests'],
                   help="set the maximum number of requests " +
                        "to serve before reloading"),
            Option('--no-debug',
                   dest='debug',
                   action='store_false',
                   default=self.options['debug'],
                   help="turn off debug mode"),
        )
        return options

    def run(self, **kwargs):
        self.options.update(kwargs)
        if not kwargs.get('debug'):
            self.options['workers'] = multiprocessing.cpu_count() * 2 + 1

        options = self.options

        class GunicornServer(GunicornApplication):
            def init(self, **kwargs):
                config = {
                    'bind': '{0}:{1}'.format(
                        options['host'],
                        options['port']
                    ),
                    'workers': options['workers'],
                    'worker_class': 'gevent',
                    'accesslog': options['access_logfile'],
                    'max_requests': options['max_requests'],
                }
                return config

            def load(self):
                # Step needed to get around flask's import time side-effects
                app = environment_manager_create()
                return app

            def load_config(self):
                # Overriding to prevent Gunicorn from reading
                # the command-line arguments
                self.cfg = GunicornConfig(self.usage, prog=self.prog)
                cfg = self.init()
                if cfg and cfg is not None:
                    for k, v in cfg.items():
                        self.cfg.set(k.lower(), v)

        GunicornServer().run()

DataCommand = Manager(usage="database import/export utility")

@DataCommand.option("out_dir", type=str, help="Path to dump produced json")
@DataCommand.option("in_file", type=str, help="Path to directoryLinks.json file")
@DataCommand.option("country_code", type=str, help="ISO3166 country code for the file")
def import_tiles(in_file, country_code, out_dir, *args, **kwargs):
    """
    From a directoryLinks.json file and a country, load into datawarehouse for reporting
    """
    import json
    from splice.models import Tile
    from splice.queries import tile_exists
    from splice.environment import Environment
    env = Environment.instance()

    country_code = country_code.upper()
    if country_code not in env.fixtures["countries"]:
        raise InvalidCommand("ERROR: country_code '{0}' is invalid\n\nvalid countries: {1}".format(country_code, json.dumps(env.fixtures["countries"], indent=2)))

    data = None
    with open(in_file, 'r') as f:
        data = json.load(f)


    for locale, tiles in data.iteritems():

        if locale not in  env.fixtures["locales"]:
            raise InvalidCommand("ERROR: locale '{0}' is invalid\n\nvalid locales: {1}".format(locale, json.dumps(list(env.fixtures["locales"]), indent=2)))

        new_tiles_data = {}
        new_tiles_list = []

        for t in tiles:
            columns = dict(
                target_url = t["url"],
                bg_color = t["bgColor"],
                title = t["title"],
                type = t["type"],
                image_uri = t["imageURI"],
                enhanced_image_uri = t.get("enhancedImageURI"),
                locale = locale,
                country_code = country_code,
            )

            db_tile_id = tile_exists(**columns)
            f_tile_id = t.get("directoryId")


            if not db_tile_id or not f_tile_id:
                """
                Will generate a new id if not found in db
                """
                obj = Tile(**columns)
                env.db.session.add(obj)
                env.db.session.flush()
                t["directoryId"] = obj.id

            elif db_tile_id == f_tile_id:
                print "tile {0} already exists".format(t["directoryId"])
                new_tiles_list.append(t)

            else:
                print "tile already exists with another id. discarding new id"
                t["directoryId"] = db_tile_id
                new_tiles_list.append(t)

        env.db.session.commit()
        new_tiles_data[locale] = {locale: new_tiles_list}

        out_file = os.path.join(out_dir, "{0}-{1}-directoryLinks.json".format(country_code, locale))
        with open(out_file, "w") as f:
            json.dump(new_tiles_data, f)
            print "wrote {0}".format(out_file)
