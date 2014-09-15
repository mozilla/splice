from flask import Blueprint, request, jsonify
from splice.web.api import build_response
from splice.environment import Environment
from splice.ingest import IngestError, ingest_links, deploy
from jsonschema.exceptions import ValidationError
import json

authoring = Blueprint('api.authoring', __name__, url_prefix='/api/authoring')
env = Environment.instance()

@authoring.route('/all_tiles', methods=['POST'])
def all_tiles():

    try:
        data = request.get_json(force=True)
        new_data = ingest_links(data)
        urls = deploy(new_data)
    except (IngestError, ValidationError) as e:
        errors = []
        error = {"path": e.path[0], "msg": e.message}
        errors.append(error)
        return jsonify({"err": errors}), 400
    except:
        return "", 500

    return jsonify({"urls": urls}), 200

def register_routes(app):
    app.register_blueprint(authoring)
