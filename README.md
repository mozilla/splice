# splice

[![Build Status](https://travis-ci.org/oyiptong/splice.svg?branch=master)](https://travis-ci.org/oyiptong/splice)
[![Coverage Status](https://coveralls.io/repos/oyiptong/splice/badge.png?branch=master)](https://coveralls.io/r/oyiptong/splice?branch=master)

Ingestion, validation and authoring tool for the Firefox Directory and Enhanced
Tiles project

## Requirements

 * python
  * pip
  * virtualenv
 * postgres
 * libmagic

## Setup

Get your virtualenv environment setup.

 * `./setup-project.sh`
 * `source ./splice-env/bin/activate`

Create databases in postgres.

```
psql postgres
create database mozsplice;
create database mozsplice_campaigns;
```

Next get your postgresql database setup

 * `manage.py db upgrade`

## Configuration

To be able to fully use Splice, you will need to use custom S3 credentials, you might want to use
your own database settings, etc.

### Boto Setup

#### Config file setup

The boto configuration file looks like this:

```
[Credentials]
aws_access_key_id = SOME_ACCESS_KEY
aws_secret_access_key = SOME_SECRET_KEY

[Boto]
debug = 0
```

Place it anywhere by using the `BOTO_CONFIG` environment variable, put it in a global location, `/etc/boto.cfg`,
or put it in a user-specific location, `$HOME/.boto`. 

More on boto config at the [documentation page](http://boto.readthedocs.org/en/latest/boto_config_tut.html).

#### Environment variable setup

As an alternative to the boto config, you can set AWS environment variables and boto will automatically
pick up the credentials.

i.e. you can set your credentials to the respective environment variables:
* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_SECURITY_TOKEN` (optional)

#### Via Splice config file

Finally, you can setup your AWS credentials via an overriden splice config file. See below.

### Splice

To override the default configuration in splice, you will want to create a custom configuration file.
Here's an example file:

```python
from splice.default_settings import DefaultConfig

class SpliceConfig(DefaultConfig):
    ENVIRONMENT = 'dev'
    DEBUG = True

    # overriding the default DB config with creds
    SQLALCHEMY_DATABASE_URI = 'postgres://user:password@localhost/mozsplice'
    SQLALCHEMY_BINDS = {
        'stats': 'postgres://user:password@localhost/mozsplice_campaigns',
    }

    AWS = None # To let boto figure out its configuration
    """
    To tell boto what creds to use
    AWS = {
        "key": "development_key",
        "secret_key": "government_secret"
    }
    """

    S3 = {
        'bucket': 'moz-tiles-mybucket',
        'tile_index_key': 'tile_index_v3.json',
    }

    # do not use a CDN, instead, use S3 url for the above defined bucket
    CLOUDFRONT_BASE_URL = 'https://moz-tiles-mybucket.s3.amazonaws.com'
```

A few things to note:
* The configuration file is a python module
* It subclasses the default config, and allows overriding the default
* For development, you want the `CLOUDFRONT_BASE_URL` parameter to be the S3 bucket probably
* You might want to use your own bucket
* `AWS = None` tells splice to let boto decide where to get credentials. Alternatively, you can configure it here.

You will want to place the configuration file somewhere in your `PYTHON_PATH`. The root of the splice repository will do.
If you name this file `splice_config.py`, you can make splice use it with the command below:

```
$ SPLICE_SETTINGS=splice_config.SpliceConfig manage.py runserver_gunicorn
```
 
## Run

 * `manage.py`
 * `manage.py data --help`: link ingestion command line tools
 * `manage.py runserver_gunicorn`: run a webserver listening on port 5000
 * `SPLICE_SETTINGS=my_config.MyConfig manage.py runserver_gunicorn`: run a webserver listening on port 5000, using custom configuration

## Test

Create test database in postgres.

```
psql postgres
create database splice_test;
```

 * `fab test`: run unit tests and code coverage tools
