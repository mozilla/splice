from flask import Blueprint, request, jsonify
from splice.web.api import build_response
from splice.queries import *
from splice.models import *
from splice.environment import Environment
from splice.ingest import IngestError, ingest_links, deploy
import jsonschema
import json

authoring = Blueprint('api.authoring', __name__, url_prefix='/api/authoring')
env = Environment.instance()

payload_schema = {
    "type": "object",
    "patternProperties": {
        "^([A-Za-z]+)/([A-Za-z-]+)$": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "directoryId": {
                        "type": "integer",
                    },
                    "url": {
                        "type": "string",
                        "pattern": "^https?://.*$",
                    },
                    "title": {
                        "type": "string",
                    },
                    "bgColor": {
                        "type": "string",
                        "pattern": "^#[0-9a-fA-F]+$|^rgb\([0-9]+,[0-9]+,[0-9]+\)$|"
                    },
                    "type": {
                        "enum": ["affiliate", "organic", "sponsored"],
                    },
                    "imageURI": {
                        "type": "string",
                        "pattern": "^data:image/.*$|^https?://.*$",
                    },
                    "enhancedImageURI": {
                        "type": "string",
                        "pattern": "^data:image/.*$|^https?://.*$",
                    },
                },
                "required": ["url", "title", "bgColor", "type", "imageURI"],
            }
        }
    },
    "additionalProperties": False,
}


@authoring.route('/all_tiles', methods=['POST'])
def all_tiles():
    try:
        data = request.get_json(force=True)
        jsonschema.validate(data, payload_schema)
    except jsonschema.exceptions.ValidationError, e:
        return jsonify({"err": e.message}), 400
    except:
        return jsonify({"err": "cannot unpack payload"}), 400

    try:
        new_data = ingest_links(data)
        deploy(new_data)
    except IngestError, e:
        return jsonify({"err": e.message}), 400
    except:
        return "", 500

    return "", 200

def register_routes(app):
    app.register_blueprint(authoring)
