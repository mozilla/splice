import os
import sys
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
