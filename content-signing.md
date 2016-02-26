# Content signing

In Splice, content signing implements [Content-Signature](https://github.com/martinthomson/content-signature/) for all types of content that get served in Firefox, e.g. the remote new tab page.

It allows content providers to sign and manage their content. Behind the scenes, it depends on [Autograph](https://github.com/mozilla-services/autograph) to generate the content signature, and all the content will be uploaded and hosted on AWS S3 for the content consumers.

# Usage

## Name
Each piece of content will occupy its dedicated directory on AWS S3. The first thing you need to do is choosing a proper name for your content, make sure it's not taken by other exsiting content.

## Version control
For each content, you are able to keep multiple versions of it (starting from 1). Splice uses version number to track the content history. Usually, you might want to bump up the version in following cases,

1. the content itself gets upgraded
2. the signing key gets updated for whatever reason

Splice will keep the version number in the database, and automatically update it if you ask it to do so. See [Content manifest](#content manifest) for more detail.

## <a name="content manifest"></a>Content manifest
A content usually contains more than one asset, and not all of them need to be signed. Splice uses a manifest file to specify the signing assets as well as the version control flag.

*Note* that the content manifest is mandatory, even if there is only one asset in it. A manifest is simply a JSON file that has two properties:

* `bump_version`, a boolean flag to specify whether Splice should bump the version or not
* `signature_required`, an array that contains all the assets that need to be signed

You can create a zip file, which includes the manifest and all the content assets, e.g. A zip file with following files,

```sh
manifest.json
nightly/en-US/index.html
nightly/en-GB/index.html
release/en-US/index.html
release/en-GB/index.html
common/a.css
```

where the `manifest.json` as,

```JSON
{
    "bump_version": true,
    "signature_required": [
        "nightly/en-US/index.html",
        "nightly/en-GB/index.html",
        "release/en-US/index.html",
        "release/en-GB/index.html",
    ]
}
```

Note that it's required to organize the directory structure properly for the `signature_required` field. Because Splice will use the same structure hierarchy on AWS S3. Assume that the name for the previous example is `foo`, and the current version is 0 (i.e. it is a new content), the content will be signed and uploaded to S3 as follows:

```sh
foo/v1/nightly/en-US/index.html
foo/v1/nightly/en-GB/index.html
foo/v1/release/en-US/index.html
foo/v1/release/en-GB/index.html
foo/v1/common/a.css
```

Splice puts the new content to its own bucket "foo", followed by the new version tag, then creates the same diretory structure as the zip file's layout.

## API endpoints
Splice exposes two API endpoints for content signing:

1. to sign a new/existing content: `api/content/sign?name=foo&version=2`. Note the `name` is a required field in the query string, whereas the `version` is optional, which could be used to re-sign an existing content on a specific version. Re-signing an old version will not change the version for that content. User also could ignore the `version` to let Splice work on the current version of the target content, in this case, the version change will be determined by the `bump_version` in the manifest file.
2. to re-sign *all* the content: `api/content/resignall`. This is **only** for the emergency uses. For instance, we need to re-sign all the content when the private key gets compromised or updated on the signing server.
