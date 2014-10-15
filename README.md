# splice


Ingestion, validation and authoring tool for the Firefox Directory and Enhanced
Tiles project

## Requirements

 * python
  * pip
  * virtualenv
 * postgres

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
