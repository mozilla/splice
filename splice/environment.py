import importlib
import boto
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.migrate import Migrate


class EnvironmentUninitializedError(Exception):
    pass


class Environment(object):

    @classmethod
    def instance(cls, config=None):
        if hasattr(Environment, "_instance") and config is None:
            return Environment._instance
        elif config is not None:
            return Environment(config)

        raise EnvironmentUninitializedError("Cannot obtain instance if uninitialized")

    def __init__(self, config_filename):
        self.__application = None
        self.__db = None
        self.__s3_conn = None

        self.__config_filename = config_filename

        self.config = self.load_config_obj(config_filename)

        self.__fixtures = None
        self.init()
        if not hasattr(Environment, "_instance"):
            Environment._instance = self

    def load_config_obj(self, obj_name):
        tokens = obj_name.split(".")
        module_name = ".".join(tokens[:-1])
        class_name = tokens[-1]
        module = importlib.import_module(module_name)
        return getattr(module, class_name)

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
        if not self.__application:
            raise EnvironmentUninitializedError("Cannot obtain application without initializing environment")
        return self.__application

    @property
    def db(self):
        self.application  # raise if application is not initted
        if not self.__db:
            self.__db = SQLAlchemy()
        return self.__db

    @property
    def s3(self):
        if not self.__s3_conn:
            self.__s3_conn = boto.connect_s3(self.config.AWS["key"], self.config.AWS["secret"])
        return self.__s3_conn

    @property
    def fixtures(self):
        from splice.utils import load_fixtures
        if not self.__fixtures:
            self.__fixtures = load_fixtures(self)
        return self.__fixtures

    def init(self):
        app = Flask('splice')
        app.config.from_object(self.__config_filename)

        if app.config['ENVIRONMENT'] not in app.config['STATIC_ENABLED_ENVS']:
            app.config['STATIC_FOLDER'] = None
        self.__application = app

        # A hack to keep the sqlalchemy binds state. Flask-SQLAlchemy strips it out
        sqlalchemy_binds = app.config.get('SQLALCHEMY_BINDS')
        self.db.init_app(self.__application)
        app.config.SQLALCHEMY_BINDS = sqlalchemy_binds
        Migrate(self.__application, self.db)

        return app
