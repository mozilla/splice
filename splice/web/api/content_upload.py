import hashlib
import os
import base64
import json
import requests
import zipfile
import tempfile
import ecdsa

from furl import furl
from mohawk import Sender
from boto.s3.key import Key
from splice.web.api.s3_common import setup_s3, MIME_EXTENSIONS
from splice.environment import Environment


env = Environment.instance()
_ORIGINAL_NAME = "original.zip"


def _get_original_content(name, version, bucket, url):
    """Retrieve the original content

    It tries to download from the S3 bucket first, upon failure it will
    retry downloading from the original url. Return None if none of retrieval
    works.
    """
    original = tempfile.NamedTemporaryFile(prefix='splice', suffix='.zip')
    s3_key = "{0}/v{1}/{2}".format(name, version, _ORIGINAL_NAME)
    k = Key(bucket)
    k.key = s3_key
    try:
        k.get_file(original)
    except:
        env.log("Failed to download %s from S3" % s3_key)
    else:
        return original

    try:
        r = requests.get(url)
        original.write(r.content)
    except:
        env.log("Failed to download content from %s" % url)
        original.close()
        return None
    else:
        return original


def _check_content_integrity(content_file, checksum):
    content_file.seek(0)
    raw = content_file.read()
    return hashlib.sha256(raw).hexdigest() == checksum


def resign_content(content):
    """Re-sign a content till the given version

    It downloads the original content file first, then re-signs the assets according to
    the manifest. Also, it won't change the version of the content.
    """
    new_pub_key = None
    bucket, headers = setup_s3(bucket="content-original")
    for version in content["versions"]:
        name, v, url = content["name"], version["version"], version["original_url"]
        original = _get_original_content(name, v, bucket, url)
        if original is None:  # pragma: no cover
            raise Exception("Can not find original content on S3")
        if not _check_content_integrity(original, version["original_hash"]):
            raise Exception("Content integrity check failed, the original file may have modified")

        try:
            manifest = extract_manifest(original)
            for asset in _digest_content(original, manifest):
                if asset[2] is None:  # skip it if it's not signed
                    continue
                if new_pub_key is None:
                    new_pub_key = asset[2].get("public_key")
                upload_content_to_s3(name, v, asset, bucket, headers)
        except:
            raise
        finally:
            original.close()
    return new_pub_key


def handle_content(content, manifest, name, version, freeze=False):
    """Content signing and uploading. The content is a zip file with a manifest file
    that in turn specifies the to-be-signed files and the version control flag.
    Once all signatures get verified locally, all the files, including the content
    itself will be uploaded to S3

    Params:
        content: a file object of the target content
        manifest: the manifest structure, already parsed as a dict
        name: name of the content
        version: the target version
        freeze: a boolean flag to prevent splice from bumping up the version based on manifest
    returns:
        urls: a list of of ulrs for uploaded assets. The last url is for the original content

        version: the signed content version. It could be an old version for re-signing, or a
        new version if the version gets bumped

        original_hash: sha1 digest of the original content formatted as hex string

        pub_key: the public signing key returned from the signing server
    """
    urls = []
    bucket, headers = setup_s3(bucket="content")
    pub_key = None
    if not freeze and manifest["bump_version"]:
        version += 1
    if version == 0:  # pragma: no cover
        version = 1  # version always starts from 1
    for asset in _digest_content(content, manifest):
        url = upload_content_to_s3(name, version, asset, bucket, headers)
        urls.append(url)
        if asset[2] and pub_key is None:
            pub_key = asset[2].get("public_key")
    urls.sort()

    # upload the original content to its bucket
    bucket_original, _ = setup_s3(bucket="content-original")
    content.seek(0)  # rewind the file offset to read the whole content
    raw = content.read()
    asset = (_ORIGINAL_NAME, raw, None)
    url = upload_content_to_s3(name, version, asset, bucket_original, headers)
    urls.append(url)
    original_hash = hashlib.sha256(raw).hexdigest()

    return urls, version, original_hash, pub_key


def _digest_content(content, manifest):
    """Digest the content and sign assets in the content based on manifest

    Params:
        content: file object of the target creative
        manifest: the manifest dict
    Return:
        A generator with each element as:

        ("asset name", "content in bytes", ["signature_dict"|None])

        Where signature_dict has two keys: "encrypted key" and "signature".
        If the asset is not in the manifest, signature_dict will be None.
    """
    def _prepend_template(content):
        return "%s%s" % (env.config.SIGNING_TEMPLATE, content)

    with zipfile.ZipFile(content, 'r') as zf:
        all_assets = set([n for n in zf.namelist() if n[-1] != '/'])
        sign_list = manifest['signature_required']

        # prepare sign payload, note that the signing service supports multiple files in a single request
        sign_payload = []
        for s in sign_list:
            if s not in all_assets:
                raise Exception("File %s in manifest is not in the content" % s)

            # the content payload reference: https://github.com/mozilla-services/autograph
            # digest() is intentionally used for signature verifying
            hash = hashlib.sha384(_prepend_template(zf.read(s))).digest()
            payload = {
                "input": "%s" % base64.b64encode(hash),
            }
            # signing key_id is optional, we need it for dev and test
            if env.config.SIGNING_KEY_ID:
                payload["keyid"] = env.config.SIGNING_KEY_ID
            sign_payload.append(payload)

        # send to signing server
        signatures = _sign_content(sign_payload)

        # verify the signatures
        assert len(signatures) == len(sign_payload), \
            "Expecting %d signtures, received %d from the server" % (len(sign_payload), len(signatures))
        for i, payload in enumerate(sign_payload):
            if not _verify_signature(payload, signatures[i]):
                raise Exception("Failed to verify the signature for file: %s" % sign_list[i])

        signatures = dict(zip(sign_list, signatures))
        for name in all_assets:
            yield name, zf.read(name), signatures.get(name)


def extract_manifest(content):
    with zipfile.ZipFile(content, 'r') as zf:
        try:
            manifest = json.loads(zf.read("manifest.json"))
        except:  # pragma: no cover
            raise
        else:
            for field in ["bump_version", "signature_required"]:
                if field not in manifest:
                    raise Exception("Missing required field %s in manifest.json" % field)
            if not isinstance(manifest["bump_version"], bool):
                raise Exception("Expect a bool value for bump_version in manifest.json")
            if not isinstance(manifest["signature_required"], list):
                raise Exception("Expect an array value for signature_required in manifest.json")
            return manifest


def _sign_content(sign_payload):
    # if the list is empty, return an empty signature list
    if len(sign_payload) == 0:
        return []

    content_type = 'application/json'
    sender = Sender({'id': env.config.SIGNING_HAWK_ID,
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


def _verify_signature(sign_payload, signature_dict):
    """Verify the signature generated by the signing server

    This function was implemented as part of Autograph.
    https://github.com/mozilla-services/autograph/blob/master/tools/client/client.py
    """
    def un_urlsafe(input):
        input = str(input).replace("_", "/")
        input = str(input).replace("-", "+")
        if len(input) % 4 > 0:  # pragma: no cover
            input += "=" * (4 - len(input) % 4)
        return input

    pub_key = un_urlsafe(signature_dict["public_key"])
    vk = ecdsa.VerifyingKey.from_pem(pub_key)
    signature = base64.b64decode(un_urlsafe(signature_dict["signature"]))

    try:
        ret = vk.verify_digest(signature, base64.b64decode(sign_payload["input"]))
    except Exception as e:
        env.log("Fail to verify signature: %s" % e)
        ret = False

    return ret


def _extract_entryption_info(signature_dict):
    """Extract key and signature from the signing payload

    This function might change over time as the signing service evolves
    Reference: https://github.com/mozilla-services/autograph
    """
    encrypt_key = signature_dict.get("public_key")  # signing server might not send pub key
    signature = signature_dict["signature"]
    x5u = signature_dict.get("x5u")
    return encrypt_key, signature, x5u


def upload_content_to_s3(name, version, asset, bucket, headers):  # pragma: no cover
    headers = dict(headers)  # clone the headers as it's mutable
    asset_name, asset_body, signature = asset
    s3_key = "{0}/v{1}/{2}".format(name, version, asset_name)

    key = Key(bucket)
    key.name = s3_key
    ext = os.path.splitext(asset_name)[-1][1:]
    if ext == "html":
        headers["Cache-Control"] = "public, max-age=86400"
    headers['Content-Type'] = MIME_EXTENSIONS.get(ext) or 'text/plain'
    if signature:
        encrypt_key, sig, x5u = _extract_entryption_info(signature)
        headers['X-amz-meta-content-signature'] = sig
        if encrypt_key:  # as the encrypt key is optional
            headers['X-amz-meta-encryption-key'] = encrypt_key
        if x5u:  # as x5u is optional
            headers['X-amz-meta-x5u'] = x5u
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
