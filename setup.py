import os
from setuptools import setup, find_packages


requires = [
    "Flask==0.10.1",
    "Flask-SQLAlchemy==1.0",
    "Flask-Script==0.6.7",
    "Flask-Migrate==1.2.0",
    "Flask-Security==1.7.3",
    "Flask-Uploads==0.1.3",
    "gevent==1.0",
    "gunicorn==18.0",
    "celery==3.1.13",
    "boto==2.32.1",
    "py-bcrypt==0.4",
    "psycopg2==2.5.3",
    "redshift-sqlalchemy==0.4.1",
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
    version="1.0",
    description="Link authoring tool for " +
                "Firefox Directory and Enhanced Tiles",
    author="Mozilla",
    packages=find_packages(),
    package_data={"": ["*.js", "*.html", "*.css", "*.jinja2", "*.png", "*.gif", "*.woff", "*.eot", "*.ttf", "*.svg"]},
    include_package_data=True,
    install_requires=requires,
    scripts=["scripts/manage.py"],
)
