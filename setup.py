from setuptools import setup, find_packages
import os

requires = [
    "Flask==0.10.1",
    "Flask-SQLAlchemy==1.0",
    "Flask-Script==2.0.5",
    "Flask-Migrate==1.2.0",
    "gevent==1.0",
    "gunicorn==18.0",
    "boto==2.32.1",
    "psycopg2==2.5.3",
    "ujson==1.33",
    "jsonschema==2.4.0",
]

if 'MOZ_SPLICE_DEV' in os.environ:
    requires.extend([
        "ipython==2.0.0",
        "nose==1.3.1",
        "flake8==2.1.0",
        "Flask-Testing==0.4.1",
        "Fabric==1.8.1",
        "colorlog==2.0.0",
    ])

setup(
    name="splice",
    version="1.0.0",
    description="Link authoring tool for " +
                "Firefox Directory and Enhanced Tiles",
    author="Mozilla",
    packages=find_packages(),
    include_package_data=True,
    scripts=["scripts/manage.py"],
)
