from flask import Blueprint, request
from splice.web.api import build_response
from splice.queries import *
from splice.models import *
from splice.environment import Environment
import json

authoring = Blueprint('api.authoring', __name__, url_prefix='/api/authoring')
env = Environment.instance()


@authoring.route('/all_tiles', methods=['POST'])
def all_tiles():
    try:
        data = request.get_json(force=True)
    except:
        return jsonify({"data": "cannot unpack payload"}), 400
    return "", 200

def register_routes(app):
    app.register_blueprint(authoring)
