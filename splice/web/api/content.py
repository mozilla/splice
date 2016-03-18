from flask import Blueprint, request
from flask.json import jsonify
from splice.web.api.content_upload import handle_content, resign_content, extract_manifest
from splice.queries.common import session_scope
from splice.queries.content import get_content, get_contents,\
    insert_content, update_content, update_version, insert_version


content_bp = Blueprint('api.content', __name__, url_prefix='/api')


@content_bp.route('/content', methods=['GET'])
def handler_get_content_all():
    content_list = get_contents()
    return jsonify(result=content_list)


@content_bp.route('/content/<name>', methods=['GET'])
def handler_get_content(name):
    content = get_content(name)
    if content is None:
        return jsonify(message="Can't find content %s" % name), 404
    else:
        return jsonify(result=content)


@content_bp.route('/content/resignall', methods=['POST'])
def handler_content_resign_all():
    succeeded, failed = [], []
    for content in get_contents():
        try:
            new_pub_key = resign_content(content)
            updated_record = {"signing_key": new_pub_key}
            with session_scope() as session:
                for version in content["versions"]:
                    update_version(session, content["id"], version["version"], updated_record)
        except Exception as e:
            failed.append("%s: %s" % (content['name'], e))
        else:
            succeeded.append(content['name'])

    return jsonify(succeeded=succeeded, failed=failed)


@content_bp.route('/content/sign', methods=['POST'])
def handler_content_upload():
    """Sign and upload a piece of content to S3

    Query string:
        name: a required string to specify the name of the content

        version: optional. Can be used if the user wants to work on an
        existing version, for instance, update a content without changing
        version. If not specified, Splice uses the current version and the
        filed 'bump_version' in the manifest to determine the version.
    """
    def _is_allowed_file(name):
        return '.' in name and name.rsplit('.', 1)[1].lower() in set(['zip', 'xpi'])

    content_file = request.files["content"]
    name = request.args.get('name')
    version = request.args.get('version')

    if not _is_allowed_file(content_file.filename):
        return jsonify(message="Invalid content uploaded, expecting a zip file."), 400

    if not name:
        return jsonify(message="Missing content name in the query string."), 400

    # try to fetch the content from the database
    new_content = False
    content_record = get_content(name)
    if content_record is None:
        content_record = {"name": name}
        new_content = True

    # determine the target version, set freeze to True if working on an existing version
    try:
        version, freeze = _get_target_version(content_record, new_content, version)
    except Exception as e:
        return jsonify(message="%s" % e), 400

    # check the manifest
    try:
        manifest = extract_manifest(content_file.stream)
    except Exception as e:
        return jsonify(message="%s" % e), 400

    # sign the content then upload it to S3
    try:
        urls, new_version, original_hash, pub_key = handle_content(content_file.stream, manifest, name, version, freeze)
    except Exception as e:
        return jsonify(message="%s" % e), 500
    else:
        try:
            content_rec, version_rec = _sync_to_database(content_record, new_content, new_version, urls[-1], original_hash, pub_key, freeze)
        except Exception as e:
            return jsonify(message="%s" % e), 500
        return jsonify(uploaded=urls, content=content_rec, version=version_rec)


def _sync_to_database(content_record, new_content, new_version, original_url, original_hash, pub_key, freeze):
    version_record = {
        "original_url": original_url,
        "original_hash": original_hash,
        "signing_key": pub_key
    }

    with session_scope() as session:
        if new_content:
            # added a new content and its first version
            content_record["version"] = new_version
            version_record["version"] = new_version
            content_record["versions"] = [version_record]
            content_rec = insert_content(session, content_record)  # this inserts the new version as well
            version_rec = content_rec.pop("versions")
        else:
            # just worked on an existing content
            if freeze:
                # modified an existing version
                version_rec = update_version(session, content_record['id'], new_version, version_record)
                content_rec = content_record
                content_rec.pop("versions")  # pop versions before sending it back to the user
            else:
                # added a new version
                content_record["version"] = new_version
                version_record["version"] = new_version
                content_record.pop("versions")  # content update doesn't need this field
                content_rec = update_content(session, content_record['id'], content_record)
                version_rec = insert_version(session, content_record['id'], version_record)
        return content_rec, version_rec


def _get_target_version(content, is_new, version):
    """Determine the target version based on the query string(if provided), and the current version in the database"""
    freeze = False
    if version:
        try:
            version = int(version)
        except:
            raise Exception("Invalid version number %s." % version)
        else:
            # make sure the version from the query string is sane
            if version < 0:
                raise Exception("Negative version number in the query string.")
            if not is_new and content["version"] < version:
                raise Exception("Given version %d is ahead of the controlled version %d." % (version, content["version"]))
            elif is_new and version != 0:
                raise Exception("Failed to find the content with the given version %d. You can omit the version to create a new content." % version)

            if not is_new and version <= content["version"]:
                freeze = True  # re-sign an existing version, do not bump up the version
    else:
        if is_new:
            version = 0  # will be bumped to 1 later during signing
            content['version'] = version
        else:
            version = content['version']

    return version, freeze


def register_routes(app):
    app.register_blueprint(content_bp)
