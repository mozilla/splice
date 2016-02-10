MIME_EXTENSIONS = {
    "png": "image/png",
    "gif": "image/gif",
    "jpeg": "image/jpg",
    "svg": "image/svg+xml",
    "html": "text/html",
    "zip": "application/zip",
    "xpi": "application/x-xpinstall"
}


def setup_s3():
    from splice.environment import Environment
    from boto.s3.cors import CORSConfiguration

    env = Environment.instance()
    bucket = env.s3.get_bucket(env.config.S3["bucket"])
    cors = CORSConfiguration()
    cors.add_rule("GET", "*", allowed_header="*")
    bucket.set_cors(cors)
    headers = {
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': 'inline',
    }
    return bucket, headers
