from flask import Blueprint, request, jsonify
from splice.environment import Environment
from splice.queries import get_channels, get_upcoming_distributions
from splice.ingest import payload_schema as schema

upcoming = Blueprint('api.upcoming', __name__, url_prefix='/api/upcoming')
env = Environment.instance()


@upcoming.route('/init_data', methods=['GET'])
def init_data():
    """
    Initial data provided to the upcoming page
    """
    dists = get_upcoming_distributions()
    chans = get_channels()

    return jsonify({'d': {'dists': dists, 'chans': chans, 'schema': schema}})

def register_routes(app):
    app.register_blueprint(upcoming)
