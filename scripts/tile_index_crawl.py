#!/usr/bin/env python

from optparse import OptionParser
import grequests
import requests
requests.packages.urllib3.disable_warnings()


def validate(results, verbose):
    for r in results:
        try:
            if r.status_code != 200:
                print('ERROR: %s %s' % (r.url, r.status_code))
                continue
            elif verbose:
                print('SUCCESS: %s %s' % (r.url, r.status_code))
            yield r
        except Exception as e:
            print('ERROR: %s' % e)


def main():
    # get argument
    parser = OptionParser(
        usage='Usage: %prog [<CDN_URL>]'
        '\n\nArguments:'
        '\n  CDN_URL    Of the format "<scheme>://<fqdn>".'
        ' Trailing "/" not allowed.'
        '\n\nExamples:'
        '\n  %prog https://tiles.cdn.mozilla.net'
    )
    parser.set_defaults(
        quiet=False,
        verbose=False,
    )
    parser.add_option(
        '-q', '--quiet',
        action='store_true',
        dest='quiet',
        help="Don't report NOTICE",
    )
    parser.add_option(
        '-v', '--verbose',
        action='store_true',
        dest='verbose',
        help='Report SUCCESS',
    )
    options, args = parser.parse_args()

    try:
        from splice.environment import Environment
        config = Environment.instance().config
        cdn = config.CLOUDFRONT_BASE_URL
        tile_index_key = config.S3['tile_index_key']
    except Exception:
        cdn = 'https://tiles.cdn.mozilla.net'
        tile_index_key = 'tile_index_v3.json'

    channels = ['desktop', 'android']

    if len(args) == 1:
        cdn = args.pop()
    elif len(args) > 1:
        parser.parse_args(['-h'])

    if not options.quiet:
        print(
            'NOTICE: crawling: %s/%s_%s' %
            (cdn, tuple(channels), tile_index_key)
        )
        print('NOTICE: calculating tiles urls')

    # extract tiles urls from tile index
    tiles_urls = set([
        tiles_url
        for index in validate(
            grequests.map(
                grequests.get(
                    '%s/%s_%s' %
                    (cdn, channel, tile_index_key),
                    allow_redirects=False,
                )
                for channel in channels
            ),
            options.verbose,
        )
        for key, value in index.json().iteritems()
        if '/' in key
        for tiles_url in value.values()
    ])

    if not options.quiet:
        print('NOTICE: tiles urls extracted: %s' % len(tiles_urls))
        print('NOTICE: calculating image urls')

    # extract image urls from tiles
    image_urls = set([
        image_url
        for tiles in validate(
            grequests.map(
                grequests.get(tiles_url, allow_redirects=False)
                for tiles_url in tiles_urls
            ),
            options.verbose,
        )
        for value_x in tiles.json().values()
        for value_y in value_x
        for key, image_url in value_y.iteritems()
        if key in ['imageURI', 'enhancedImageURI']
    ])

    if not options.quiet:
        print('NOTICE: image urls extracted: %s' % len(image_urls))
        print('NOTICE: validating image urls')

    # Two things to notice here:
    # 1. expanding the list comprehension is necessary to get the 'validate'
    #    step above to actually evaluate (it's lazy.)
    # 2. the actual value of the list comprehension is dropped, not returned.
    [
        valid.url
        for valid in validate(
            grequests.map(
                grequests.head(image_url, allow_redirects=False)
                for image_url in image_urls
            ),
            options.verbose,
        )
    ]


if __name__ == '__main__':
    main()
