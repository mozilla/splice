from flask import Blueprint, request, jsonify
from sqlalchemy.exc import DataError
from sqlalchemy.orm.exc import NoResultFound
from splice.environment import Environment
from splice.queries import get_channels, get_upcoming_distributions, unschedule_distribution
from splice.ingest import get_payload_schema

upcoming = Blueprint('api.upcoming', __name__, url_prefix='/api/upcoming')
env = Environment.instance()


@upcoming.route('/init_data', methods=['GET'])
def init_data():
    """
    Initial data provided to the upcoming page
    """
    dists = get_upcoming_distributions()
    chans = get_channels()

    return jsonify({'d': {'dists': dists, 'chans': chans,
        'schema': {"default": get_payload_schema(compact=False), "compact": get_payload_schema(compact=True)},
        'env': env.config.ENVIRONMENT}})


@upcoming.route('/unschedule', methods=['POST'])
def unschedule():
    """
    Unschedule a distribution
    """
    dist_id = request.args.get('distId')

    if not dist_id:
        msg = "a distribution ID is required"
        return jsonify({"err": [{"msg": msg}]}), 400
    try:
        unschedule_distribution(dist_id)
    except (NoResultFound, DataError):
        msg = "dist_id {0} does not exist".format(dist_id)
        env.log("UPCOMING_ERROR msg: {0}".format(msg))
        return jsonify({"err": [{"msg": msg}]}), 404

    return jsonify({"unscheduled": [dist_id]}), 204


@upcoming.route('/distributions', methods=['GET'])
def distributions():
    """
    Obtain upcoming distributions
    """

    limit = request.args.get('limit', 100)
    dists = get_upcoming_distributions(limit=limit)
    channels = get_channels()

    return jsonify({'d': {'dists': dists, 'chans': channels}})


def register_routes(app):
    app.register_blueprint(upcoming)
