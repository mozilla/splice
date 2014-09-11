import importlib
import boto
import sys
import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.migrate import Migrate
from flask_wtf.csrf import CsrfProtect

CONFIG_PATH_LOCATIONS = ['/etc/onyx', os.path.abspath(os.path.dirname(__file__))]


class EnvironmentUninitializedError(Exception):
    pass


def load_config_obj(obj_name):
    tokens = obj_name.split(".")
    module_name = ".".join(tokens[:-1])
    class_name = tokens[-1]
    module = importlib.import_module(module_name)
    return getattr(module, class_name)


class Environment(object):
    _instance = None

    @classmethod
    def instance(cls, config=None, test=False, test_db_uri="sqlite://"):
        if cls._instance is None:
            cls._instance = cls(config, test, test_db_uri)
        return cls._instance

    def __init__(self, config, test, test_db_uri):
        if self.__class__._instance is not None:
            raise EnvironmentUninitializedError()

        self.config = config
        self.__s3_conn = None
        self.__fixtures = None
        self.__db = SQLAlchemy()

        for path in CONFIG_PATH_LOCATIONS:
            sys.path.append(path)

        if config is None:
            # None will be passed by manage.py.
            # A default param value will get overwritten, so this is implemented here.
            config = 'splice.default_settings.DefaultConfig'

        config = os.environ.get('SPLICE_SETTINGS', config)

        config_obj = load_config_obj(config)

        if test:
            config_obj.ENVIRONMENT = 'test'
            config_obj.SQLALCHEMY_DATABASE_URI = test_db_uri
            config_obj.SQLALCHEMY_POOL_SIZE = None
            config_obj.SQLALCHEMY_POOL_TIMEOUT = None

        app = Flask('splice')
        app.config.from_object(config)

        if app.config['ENVIRONMENT'] not in app.config['STATIC_ENABLED_ENVS']:
            app.config['STATIC_FOLDER'] = None
        self.__application = app
        self.csrf = CsrfProtect()
        self.csrf.init_app(app)

        # A hack to keep the sqlalchemy binds state. Flask-SQLAlchemy strips it out
        sqlalchemy_binds = app.config.get('SQLALCHEMY_BINDS')
        self.db.init_app(self.__application)
        app.config.SQLALCHEMY_BINDS = sqlalchemy_binds
        Migrate(self.__application, self.db)

    @property
    def is_debug(self):
        return self.config.DEBUG

    @property
    def is_test(self):
        return self.config.ENVIRONMENT == "test"

    @property
    def is_development(self):
        return self.config.ENVIRONMENT == "dev"

    @property
    def is_production(self):
        return self.config.ENVIRONMENT == "prod"

    @property
    def application(self):
        return self.__application

    @property
    def db(self):
        return self.__db

    @property
    def s3(self):
        if not self.__s3_conn:
            self.__s3_conn = boto.connect_s3(self.config.AWS["key"],
                                             self.config.AWS["secret"])
        return self.__s3_conn

    @property
    def fixtures(self):
        if not self.__fixtures:
            self._load_fixtures()
        return self.__fixtures

    def _load_locales(self):
        with open(self.config.LOCALE_FIXTURE_PATH, 'r') as infile:
            data = [line.strip() for line in infile]
        data.extend(["en-US", "ERROR"])
        return data

    def _load_countries(self):
        import csv
        with open(self.config.COUNTRY_FIXTURE_PATH, 'rb') as f:
            reader = csv.reader(f)
            data = [line for line in reader]
        data.append(("ERROR", "ERROR"))
        return data

    def _load_fixtures(self):
        locales = set(self._load_locales())

        countries = {}
        for iso_code, name in self._load_countries():
            countries[iso_code] = name

        self.__fixtures =  {
            "locales": locales,
            "countries": countries,
        }