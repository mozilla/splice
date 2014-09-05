from flask import (
    Response,
    redirect,
    request,
    Blueprint
)
import ujson
from splice.environment import Environment
from splice.queries import *
from splice.models import *

admin = Blueprint('admin', __name__, url_prefix='/admin')
env = Environment.instance()


@admin.route('/', methods='GET')
def root():
    return ""


def register_routes(app):
    app.register_blueprint(admin)


def build_response(it, keys):
    rval = []
    for tup in it:
        rval.append(dict(zip(keys, tup)))
    return Response(ujson.dumps(rval), content_type='application/json; charset=utf-8', status=200)

@admin.route('/tile_stats/weekly/<start_date>/<tile_id>', methods=['GET'])
def path_tile_stats_weekly(start_date, tile_id=None):
    with env.application.app_context():
        conn = env.db.engine.connect()
        keys, rval = tile_stats_weekly(conn, start_date, tile_id)
        return build_response(rval, keys)


@admin.route('/tile_stats/monthly/<start_date>/<tile_id>', methods=['GET'])
def path_tile_stats_monthly(start_date, tile_id=None):
    with env.application.app_context():
        conn = env.db.engine.connect()
        keys, rval = tile_stats_monthly(conn, start_date, tile_id)
        return build_response(rval, keys)


@admin.route('/slot_stats/weekly/<start_date>/<slot_id>', methods=['GET'])
def path_slot_stats_weekly(start_date, slot_id=None):
    with env.application.app_context():
        conn = env.db.engine.connect()
        keys, rval = slot_stats_weekly(conn, start_date, slot_id)
        return build_response(rval, keys)


@admin.route('/slot_stats/monthly/<start_date>/<slot_id>', methods=['GET'])
def path_slot_stats_monthly(start_date, slot_id=None):
    with env.application.app_context():
        conn = env.db.engine.connect()
        keys, rval = slot_stats_monthly(conn, start_date, slot_id)
        return build_response(rval, keys)
