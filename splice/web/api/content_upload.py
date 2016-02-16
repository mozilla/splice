import hashlib
import os
import base64
import json
import requests
import zipfile

from furl import furl
from mohawk import Sender
from boto.s3.key import Key
from splice.web.api.s3_common import setup_s3, MIME_EXTENSIONS
from splice.environment import Environment


env = Environment.instance()


def upload_signed_content(content, name, version, freeze=False):
    """Upload the signed content file to S3, return all the urls if succeeds

    Params:
        content: file object of the target creative
        name: name of the content
        version: the target version of the signing content
        freeze: a boolean flag to prevent splice from bumping up the version based on manifest
    """
    urls = []
    bucket, headers = setup_s3(bucket="content")
    if not freeze and _bump_needed(content):
        version += 1
    for asset in _digest_content(content):
        url = upload_content_to_s3(name, version, asset, bucket, headers)
        urls.append(url)
    # also upload the original zip file
    asset = ("original.zip", content.read(), None)
    url = upload_content_to_s3(name, version, asset, bucket, headers)
    urls.append(url)

    urls.sort()
    return urls, version


def _digest_content(content):
    """Digest the content and sign assets in the content based on manifest

    Params:
        content: file object of the target creative
    Return:
        A generator with each element as:

        ("asset name", "content in bytes", ["signature_dict"|None])

        Where signature_dict has two keys: "encrypted key" and "signature".
        If the asset is not in the manifest, signature_dict will be None.
    """
    with zipfile.ZipFile(content, 'r') as zf:
        all_assets = set([n for n in zf.namelist() if n[-1] != '/'])

        # parse the manifest
        try:
            manifest = json.loads(zf.read("manifest.json"))
        except:
            raise Exception("Failed to load manifest.json from the content")
        else:
            sign_list = manifest['signature_required']

        # prepare sign payload, note that the signing service supports multiple files in a single request
        sign_payload = []
        for s in sign_list:
            if s not in all_assets:
                raise Exception("File %s in manifest is not in the content" % s)

            # the content payload reference: https://github.com/mozilla-services/autograph
            hash = hashlib.sha384(zf.read(s)).hexdigest()
            payload = {
                "template": "content-signature",
                "input": "%s" % base64.b64encode(hash)
            }
            sign_payload.append(payload)

        # send to signing server
        signatures = dict(zip(sign_list, _sign_content(sign_payload)))

        for name in all_assets:
            yield name, zf.read(name), signatures.get(name)


def _bump_needed(content):
    with zipfile.ZipFile(content, 'r') as zf:
        # parse the manifest
        try:
            manifest = json.loads(zf.read("manifest.json"))
        except:
            return False
        else:
            return manifest['bump_version']


def _sign_content(sign_payload):
    content_type = 'application/json'
    sender = Sender({'id': 'alice',
                     'key': env.config.SIGNING_HAWK_KEY,
                     'algorithm': 'sha256'},         # credentials
                    env.config.SIGNING_SERVICE_URL,  # url
                    'POST',                          # method
                    content=json.dumps(sign_payload),
                    content_type=content_type)
    try:
        r = requests.post(env.config.SIGNING_SERVICE_URL,
                          json=sign_payload,
                          headers={'Content-Type': content_type,
                                   'Authorization': sender.request_header})
        if r.status_code != 201:
            msg = "signing server returned an error code: %s" % (r.status_code)
            raise Exception(msg)
    except Exception as e:
        msg = "Error when signing: %s" % e
        env.log(msg)
        raise
    else:
        return r.json()


def _extract_entryption_info(signature_dict):
    encrypt_key = signature_dict["certificate"].get("encryptionKey")  # signing server may not return this key
    signature = signature_dict["signatures"][0]["signature"]
    return encrypt_key, signature


def upload_content_to_s3(name, version, asset, bucket, headers):  # pragma: no cover
    headers = dict(headers)  # clone the headers as it's mutable
    asset_name, asset_body, signature = asset
    s3_key = "{0}/v{1}/{2}".format(name, version, asset_name)

    key = Key(bucket)
    key.name = s3_key
    _, ext = os.path.splitext(asset_name)
    headers['Content-Type'] = MIME_EXTENSIONS.get(ext) or 'text/plain'
    if signature:
        encrypt_key, sig = _extract_entryption_info(signature)
        headers['X-amz-meta-content-signature'] = sig
        if encrypt_key:  # as the encrypt key is optional
            headers['X-amz-meta-encryption-key'] = encrypt_key
    key.set_contents_from_string(asset_body, headers=headers)
    key.set_acl("public-read")

    new_url = key.generate_url(expires_in=0, query_auth=False)
    # remove x-amz-security-token, which is inserted even if query_auth=False
    # ref: https://github.com/boto/boto/issues/1477
    url = furl(new_url)
    try:
        url.args.pop('x-amz-security-token')
    except:
        new_url = os.path.join('https://%s.s3.amazonaws.com' % env.config.S3['content'], s3_key)
    else:
        new_url = url.url
    return new_url
