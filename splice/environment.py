import importlib
import boto
import sys
import os
import logging
from mock import Mock
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.migrate import Migrate
from flask_wtf.csrf import CsrfProtect

CONFIG_PATH_LOCATIONS = ['/etc/splice', os.path.abspath(os.path.dirname(__file__))]


class EnvironmentUninitializedError(Exception):
    pass


def load_config_obj(obj_name):
    module_name, class_name = obj_name.rsplit(".", 1)
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

        self.__s3_conn = None
        self.__fixtures = None
        self.__db = SQLAlchemy()

        for path in CONFIG_PATH_LOCATIONS:
            sys.path.append(path)

        if config is None:
            # None will be passed by manage.py.
            # A default param value will get overwritten, so this is implemented here.
            config = 'splice.default_settings.DefaultConfig'

        if not test:
            # load config from environment if it exists
            config = os.environ.get('SPLICE_SETTINGS', config)

        config_obj = load_config_obj(config)

        if test:
            config_obj.ENVIRONMENT = 'test'
            config_obj.SQLALCHEMY_DATABASE_URI = test_db_uri
            config_obj.SQLALCHEMY_BINDS = {'stats': test_db_uri}
            config_obj.SQLALCHEMY_POOL_SIZE = None
            config_obj.SQLALCHEMY_POOL_TIMEOUT = None
            self.log = Mock()
            self.__s3_conn = Mock()
        else:
            self.__loggers = self.__setup_loggers(config_obj)

        self.config = config_obj
        app = Flask('splice')
        app.config.from_object(config)

        if app.config['ENVIRONMENT'] not in app.config['STATIC_ENABLED_ENVS']:
            app.config['STATIC_FOLDER'] = None
        self.__application = app

        if not test:
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
            if self.config.AWS:
                self.__s3_conn = boto.connect_s3(self.config.AWS["key"],
                                                 self.config.AWS["secret_key"])
            else:
                self.__s3_conn = boto.connect_s3()

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
        data.append(("STAR", "All Countries"))
        return data

    def _load_fixtures(self):
        locales = set(self._load_locales())

        countries = {}
        for iso_code, name in self._load_countries():
            countries[iso_code] = name

        self.__fixtures = {
            "locales": locales,
            "countries": countries,
        }

    def __setup_loggers(self, config):
        """
        Setup and return loggers
        """
        loggers = {}
        for name, settings in config.LOG_HANDLERS.iteritems():
            internal_name = "splice-{0}".format(name)

            handler = settings['handler'](**settings['params'])
            if 'format' in settings:
                handler.setFormatter(logging.Formatter(settings['format']))

            logger = logging.getLogger(internal_name)
            logger.setLevel(settings['level'])
            logger.addHandler(handler)
            loggers[internal_name] = logger

        return loggers

    def log(self, msg, name='console', **kwargs):
        """
        Log messages via defined outputs
        """
        level = kwargs.pop('level', logging.INFO)
        internal_name = "splice-{0}".format(name)
        loggers = {self.__loggers.get(internal_name)}

        if self.is_debug:
            # include the console logger in development mode
            loggers.add(self.__loggers['splice-console'])

        for logger in loggers:
            if logging.handlers.SysLogHandler in logger.handlers:
                # in syslog, message starts after first colon
                logger_msg = ":{0}".format(msg)
            else:
                logger_msg = msg
            logger.log(level, logger_msg, **kwargs)
