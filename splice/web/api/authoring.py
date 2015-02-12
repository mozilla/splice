import sys
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from sqlalchemy.orm.exc import NoResultFound
from splice.environment import Environment
from splice.queries import get_channels, get_all_distributions
from splice.ingest import IngestError, ScheduleError, ingest_links, distribute, payload_schema as schema
from jsonschema.exceptions import ValidationError

authoring = Blueprint('api.authoring', __name__, url_prefix='/api/authoring')
env = Environment.instance()


@authoring.route('/all_tiles', methods=['POST'])
def all_tiles():
    deploy_flag = request.args.get('deploy')
    channel_id = request.args.get('channelId')
    scheduled_ts = request.args.get('scheduledTS')
    scheduled_dt = None

    deploy = deploy_flag == '1'

    if channel_id is None:
        msg = "channel_id not provided"
        env.log("INGEST_ERROR msg: {0}".format(msg))
        return jsonify({"err": [{"msg": msg}]}), 400

    try:
        data = request.get_json(force=True)
        new_data = ingest_links(data, channel_id)
        if scheduled_ts:
            # scheduled_ts assumed to be in seconds
            scheduled_dt = datetime.utcfromtimestamp(int(scheduled_ts))
        urls = distribute(new_data, channel_id, deploy, scheduled_dt)
    except NoResultFound, e:
        msg = "channel_id {0} does not exist".format(channel_id)
        env.log("INGEST_ERROR msg: {0}".format(msg))
        return jsonify({"err": [{"msg": msg}]}), 404
    except ValidationError, e:
        errors = []
        error = {"path": e.path[0], "msg": e.message}
        errors.append(error)
        env.log("VALIDATION_ERROR path:{0} msg:{1}".format(e.path[0], e.message), level=logging.ERROR, name="client_error")
        return jsonify({"err": errors}), 400
    except IngestError, e:
        env.log("INGEST_ERROR msg:{0}".format(e.message), level=logging.ERROR, name="client_error")
        return jsonify({"err": [{"msg": e.message}]}), 400
    except ScheduleError, e:
        env.log("SCHEDULE_ERROR msg:{0}".format(e.message), level=logging.ERROR, name="client_error")
        return jsonify({"err": [{"msg": e.message}]}), 400
    except BadRequest, e:
        env.log("PAYLOAD_ERROR msg:{0}".format(e.message), level=logging.ERROR, name="client_error")
        return jsonify({"err": [{"msg": e.message}]}), 400
    except ValueError, e:
        env.log(e.message, level=logging.ERROR, exc_info=sys.exc_info(), name="application")
        return jsonify({"err": [{"msg": e.message}]}), 400
    except Exception, e:
        env.log(e.message, level=logging.ERROR, exc_info=sys.exc_info(), name="application")
        return jsonify({"err": [{"msg": e.message}]}), 500

    return jsonify({"urls": urls, "deployed": deploy}), 200


@authoring.route('/distributions', methods=['GET'])
def distributions():

    limit = request.args.get('limit', 100)
    dists = get_all_distributions(limit=limit)
    channels = get_channels()

    return jsonify({'d': {'dists': dists, 'chans': channels}})


@authoring.route('/init_data', methods=['GET'])
def init_data():
    """
    Initial data provided to the authoring page
    """

    channels = get_channels()
    dists = get_all_distributions()

    return jsonify({'d': {'dists': dists, 'chans': channels, 'schema': schema}})


def register_routes(app):
    app.register_blueprint(authoring)
