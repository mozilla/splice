import os


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

    SQLALCHEMY_DATABASE_URI = "postgres://postgres:p@ssw0rd66@localhost/mozsplice"
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_POOL_SIZE = 5
    SQLALCHEMY_POOL_TIMEOUT = 10
