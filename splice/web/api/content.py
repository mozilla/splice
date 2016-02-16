from flask import Blueprint, request
from flask.json import jsonify
from splice.web.api.content_upload import upload_signed_content
from splice.queries.common import session_scope
from splice.queries.content import get_content, insert_content, update_content


content_bp = Blueprint('api.content', __name__, url_prefix='/api')


@content_bp.route('/content/resignall', methods=['POST'])
def handler_content_resign_all():
    # TODO(najiang@mozilla.com): implement re-sign all
    raise NotImplementedError("Not implemented yet")


@content_bp.route('/content/sign', methods=['POST'])
def handler_content_upload():
    """Signed and upload a piece of content to S3, return the URL if succeeds."""
    def _is_allowed_file(name):
        return '.' in name and name.rsplit('.', 1)[1].lower() in set(['zip'])

    content_file = request.files["content"]
    name = request.args.get('name')
    version = request.args.get('version')

    if not _is_allowed_file(content_file.filename):
        return jsonify(message="Invalid content uploaded, expecting a zip file."), 400

    if not name:
        return jsonify(message="Missing content name in the query string."), 400

    # try to fetch the content from the database
    new_content = False
    freeze = False
    content_record = get_content(name)
    if content_record is None:
        content_record = {"name": name}
        new_content = True

    # determin the version based on the query string (if specified), and the current version in the database
    if version:
        try:
            version = int(version)
        except:
            return jsonify(message="Invalid version number %s." % version), 400
        else:
            # make sure the version from the query string is sane
            if version < 0:
                return jsonify(message="Negative version number in the query string."), 400
            if not new_content and content_record["version"] < version:
                return jsonify(message="Given version %d is ahead of the controlled version %d." % (version, content_record["version"])), 400
            elif new_content and version != 0:
                return jsonify(message="Failed to find the content with the given version %d. You can omit the version to create a new content." % version), 400

            if not new_content and version <= content_record["version"]:
                freeze = True  # re-sign an existing version, do not bump up the version
    else:
        if new_content:
            version = 0
            content_record['version'] = version
        else:
            version = content_record['version']

    # sign the content then upload it to S3
    try:
        # TODO(najiang@mozilla.com): return the signing pub key and store it to database?
        urls, new_version = upload_signed_content(content_file.stream, name, version, freeze)
    except Exception as e:
        return jsonify(message="%s" % e), 400
    else:
        record = _sync_to_database(content_record, new_content, new_version, freeze)
        return jsonify(results=urls, content=record)


def _sync_to_database(content_record, new_content, new_version, freeze):
    with session_scope() as session:
        if new_content:
            content_record["version"] = new_version
            record = insert_content(session, content_record)
        else:
            # always update the content after signing as the signing key might have changed
            if not freeze:
                content_record["version"] = new_version
            record = update_content(session, content_record['id'], content_record)
    return record


def register_routes(app):
    app.register_blueprint(content_bp)
