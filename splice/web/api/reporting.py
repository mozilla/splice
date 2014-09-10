from flask import Blueprint
from splice.web.api import build_response
from splice.queries import *
from splice.models import *

report = Blueprint('api.report', __name__, url_prefix='/api/report')
env = Environment.instance()


@report.route('/', methods=['GET'])
def root():
    return ""


@report.route('/tile_stats/weekly/<start_date>/<tile_id>', methods=['GET'])
def path_tile_stats_weekly(start_date, tile_id=None):
    conn = env.db.engine.connect()
    keys, rval = tile_stats_weekly(conn, start_date, tile_id)
    return build_response(rval, keys)


@report.route('/tile_stats/monthly/<start_date>/<tile_id>', methods=['GET'])
def path_tile_stats_monthly(start_date, tile_id=None):
    conn = env.db.engine.connect()
    keys, rval = tile_stats_monthly(conn, start_date, tile_id)
    return build_response(rval, keys)


@report.route('/slot_stats/weekly/<start_date>/<slot_id>', methods=['GET'])
def path_slot_stats_weekly(start_date, slot_id=None):
    conn = env.db.engine.connect()
    keys, rval = slot_stats_weekly(conn, start_date, slot_id)
    return build_response(rval, keys)


@report.route('/slot_stats/monthly/<start_date>/<slot_id>', methods=['GET'])
def path_slot_stats_monthly(start_date, slot_id=None):
    conn = env.db.engine.connect()
    keys, rval = slot_stats_monthly(conn, start_date, slot_id)
    return build_response(rval, keys)


def register_routes(app):
    app.register_blueprint(report)
