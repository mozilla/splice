from flask import Blueprint, request
from flask.json import jsonify
from splice.web.api.content_upload import upload_signed_content


content_bp = Blueprint('api.content', __name__, url_prefix='/api')


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

    if version:
        try:
            version = int(version)
        except:
            return jsonify(message="Invalid version number in the query string."), 400
        else:
            if version < 0:
                return jsonify(message="Negative version number in the query string."), 400
    else:
        # TODO(najiang@mozilla.com): fetch the current version number from database
        pass

    try:
        url = upload_signed_content(content_file.stream, name, version)
    except Exception as e:
        return jsonify(message="%s" % e), 400
    else:
        return jsonify(results=url)


def register_routes(app):
    app.register_blueprint(content_bp)
