import os
import sys
import csv
from splice.environment import Environment

CONFIG_PATH_LOCATIONS = ['/etc/onyx', os.path.abspath(os.path.dirname(__file__))]

def environment_manager_create(config=None):
    """
    Create and configure application
    If not specified, the default config will be loaded.
    If the SPLICE_SETTINGS is provided, the file location will take precedence
    """

    for path in CONFIG_PATH_LOCATIONS:
        sys.path.append(path)

    if config is None:
        # None will be passed by manage.py.
        # A default param value will get overwritten, so this is implemented here.
        config = 'splice.default_settings.DefaultConfig'

    config = os.environ.get('SPLICE_SETTINGS', config)

    env = Environment.instance(config)
    from splice.webapp import setup_routes
    setup_routes(env.application)

    return env.application

def load_locales(filepath):
    data = None
    with open(filepath, 'r') as infile:
        data = [line.strip() for line in infile.readlines()]
    return data

def load_countries(filepath):
    data = None
    import csv
    with open(filepath, 'rb') as f:
        reader = csv.reader(f)
        data = [line for line in reader]
    data.append(("ERROR", "ERROR"))
    return data

def load_fixtures(env):
    locales = set(load_locales(env.config.LOCALE_FIXTURE_PATH))

    countries = {}
    for iso_code, name in load_countries(env.config.COUNTRY_FIXTURE_PATH):
        countries[iso_code] = name

    return {
        "locales": locales,
        "countries": countries,
    }

