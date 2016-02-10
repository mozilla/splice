from flask import Blueprint, request
from flask.json import jsonify
from splice.web.api.content_upload import upload_signed_content


content_bp = Blueprint('api.content', __name__, url_prefix='/api')


@content_bp.route('/content/sign', methods=['POST'])
def handler_content_upload():
    """Upload a signed content to S3, return the URL if succeeds."""
    def _is_allowed_file(name):
        return '.' in name and name.rsplit('.', 1)[1].lower() in set(['html', 'xpi', 'zip'])

    content_file = request.files["content"]
    if not _is_allowed_file(content_file.filename):
        return jsonify(message="Invalid content uploaded."), 400

    try:
        url = upload_signed_content(content_file.stream, content_file.filename)
    except Exception as e:
        return jsonify(message="%s" % e), 400
    else:
        return jsonify(result=url)


def register_routes(app):
    app.register_blueprint(content_bp)
