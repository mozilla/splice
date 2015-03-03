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

Next get your postgresql database setup

 * `manage.py db init`
  * ignore 'configuration/connection/logging settings'
 * `manage.py db migrate`
  * may error out on postgres permissions
 * `manage.py db upgrade`
 
## Run

 * `manage.py`
 * `manage.py data --help`: link ingestion command line tools
 * `manage.py runserver`: run a webserver listening on port 5000

## Test

 * `fab test`: run unit tests and code coverage tools
