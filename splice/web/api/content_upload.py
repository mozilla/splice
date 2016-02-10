import hashlib
import os
import base64
import json
import requests

from mohawk import Sender
from boto.s3.key import Key
from splice.web.api.s3_common import setup_s3, MIME_EXTENSIONS
from splice.environment import Environment


env = Environment.instance()


def upload_signed_content(content, name):
    """Upload a signed content file to S3, return the url if succeeds

    Params:
        content: file object of the target creative
        ext: file name
    """
    try:
        buf = content.read()
        signature, hash = sign_content_payload(buf, name)
        bucket, headers = setup_s3()
        ext = name.rsplit('.', 1)[1].lower()
        url = upload_content_to_s3(buf, hash, signature['signatures'][0]['signature'], ext, bucket, headers)
    except Exception as e:
        raise Exception("Failed to upload content: %s" % e)

    return url


def sign_content_payload(content, name):
    hash = hashlib.sha384(content).hexdigest()
    # pass the following header along for the hawk authorization

    # see the content payload reference: https://github.com/mozilla-services/autograph
    content_payload = [
        {
            "template": "content-signature",
            "input": "%s" % base64.b64encode(hash)
        }
    ]
    content_type = 'application/json'
    sender = Sender({'id': 'alice',
                     'key': env.config.SIGNING_HAWK_KEY,
                     'algorithm': 'sha256'},         # credentials
                    env.config.SIGNING_SERVICE_URL,  # url
                    'POST',                          # method
                    content=json.dumps(content_payload),
                    content_type=content_type)
    try:
        r = requests.post(env.config.SIGNING_SERVICE_URL,
                          json=content_payload,
                          headers={'Content-Type': content_type,
                                   'Authorization': sender.request_header})
        if r.status_code != 201:
            msg = "error_code: %s" % (name, r.status_code)
            raise Exception(msg)
    except Exception as e:
        msg = "Error when signing file: %s, %s" % (name, e)
        env.log(msg)
        raise
    else:
        return r.json()[0], hash


def upload_content_to_s3(content, hash, signature, ext, bucket, headers):
    s3_key = "content/{0}.{1}".format(hash, ext)

    key = bucket.get_key(s3_key)
    if key is None:  # pragma: no cover
        key = Key(bucket)
        key.name = s3_key
        headers['Content-Type'] = MIME_EXTENSIONS[ext]
        headers['X-amz-meta-content-signature'] = signature
        key.set_contents_from_string(content, headers=headers)
        key.set_acl("public-read")

    url = os.path.join('https://%s.s3.amazonaws.com' % env.config.S3['bucket'], s3_key)
    return url
