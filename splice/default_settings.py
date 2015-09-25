import sys
import os
import logging
import socket


class DefaultConfig(object):
    """
    Configuration suitable for use for development
    """
    DEBUG = True
    APPLICATION_ROOT = None
    JSONIFY_PRETTYPRINT_REGULAR = True

    STATIC_ENABLED_ENVS = {"dev", "test"}
    ENVIRONMENT = "dev"

    SECRET_KEY = "moz-splice-development-key"

    TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
    STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
    FIXTURES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")

    COUNTRY_FIXTURE_PATH = os.path.join(FIXTURES_DIR, "iso3166.csv")
    LOCALE_FIXTURE_PATH = os.path.join(FIXTURES_DIR, "all-locales.mozilla-aurora")

    SQLALCHEMY_DATABASE_URI = "postgres://localhost/mozsplice_campaigns"
    SQLALCHEMY_BINDS = {
        'stats': 'postgres://localhost/mozsplice'
    }
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_POOL_SIZE = 5
    SQLALCHEMY_POOL_TIMEOUT = 10

    # set AWS to None to use boto defaults
    AWS = {
        "key": "development_key",
        "secret_key": "government_secret"
    }

    S3 = {
        "bucket": "moz-tiles-local",
        "tile_index_key": "tile_index.v3.json"
    }

    CLOUDFRONT_BASE_URL = "https://d3bhweee2a5al5.cloudfront.net"

    LOG_HANDLERS = {
        'application': {
            'handler': logging.handlers.SysLogHandler,
            'level': logging.INFO,
            'params': {
                'address': ('localhost', 514),
                'facility': logging.handlers.SysLogHandler.LOG_LOCAL0,
                'socktype': socket.SOCK_DGRAM,
            }
        },
        'client_error': {
            'handler': logging.handlers.SysLogHandler,
            'level': logging.INFO,
            'params': {
                'address': ('localhost', 514),
                'facility': logging.handlers.SysLogHandler.LOG_LOCAL1,
                'socktype': socket.SOCK_DGRAM,
            }
        },
        'user_event': {
            'handler': logging.handlers.SysLogHandler,
            'format': '%(message)s',
            'level': logging.INFO,
            'params': {
                'address': ('localhost', 514),
                'facility': logging.handlers.SysLogHandler.LOG_LOCAL2,
                'socktype': socket.SOCK_DGRAM,
            }
        },
        'console': {
            'handler': logging.StreamHandler,
            'format': '%(asctime)s\t%(levelname)s\t%(message)s',
            'level': logging.INFO,
            'params': {
                'stream': sys.stdout
            }
        }
    }
