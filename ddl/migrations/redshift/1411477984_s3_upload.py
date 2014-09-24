#!/usr/bin/env python
import sys
import os
import argparse
import urllib2
import logging
from datetime import datetime
import boto
from boto.s3.key import Key

FILES = ['1411477984.tiles.tsv', '1411477984.distributions.tsv']


def main():
    desc = """
    This script will upload the migration files for 1411477984 to S3 for bulk import
    """

    parser = argparse.ArgumentParser(description=desc)
    parser.add_argument('bucket', metavar='S3_BUCKET', type=str,
                       help='s3 bucket that contains the migration data')
    args = parser.parse_args()

    logging.info('upload to bucket: {0}'.format(args.bucket))
    try:
        s3 = boto.connect_s3()
        bucket = s3.get_bucket(args.bucket)

        for filename in FILES:
            key = Key(bucket)
            key.name = os.path.join("migrations", filename)
            with open(filename, 'r') as f:
                key.set_contents_from_file(f)
            key.set_acl("public-read")
            key.content_type = "text/tab-separated-values"
            key.content_disposition = "inline"
            logging.info('wrote key: {0}'.format(key.name))
    except Exception, e:
        logging.exception(e)
        sys.exit(1)


if __name__ == "__main__":
    logging.basicConfig(format='%(asctime)s\t%(levelname)s\t%(message)s', level=logging.INFO)
    main()
