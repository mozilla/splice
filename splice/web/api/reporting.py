from flask import Blueprint, request
from splice.web.api import build_response
from splice.queries import *
from splice.models import *

report = Blueprint('api.report', __name__, url_prefix='/api/report')


@report.route('/', methods=['GET'])
def root():
    return ""


@report.route('/tile_stats/weekly/<start_date>/<tile_id>', methods=['GET'])
@report.route('/tile_stats/weekly/<start_date>', methods=['GET'])
def path_tile_stats_weekly(start_date, tile_id=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_stats_weekly(conn, start_date, tile_id)
    return build_response(request, rval, keys, name=start_date)


@report.route('/tile_stats/monthly/<start_date>/<tile_id>', methods=['GET'])
@report.route('/tile_stats/monthly/<start_date>', methods=['GET'])
def path_tile_stats_monthly(start_date, tile_id=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_stats_monthly(conn, start_date, tile_id)
    return build_response(request, rval, keys, name=start_date)


@report.route('/slot_stats/weekly/<start_date>/<slot_id>', methods=['GET'])
@report.route('/slot_stats/weekly/<start_date>', methods=['GET'])
def path_slot_stats_weekly(start_date, slot_id=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = slot_stats_weekly(conn, start_date, slot_id)
    return build_response(request, rval, keys, name=start_date)


@report.route('/slot_stats/monthly/<start_date>/<slot_id>', methods=['GET'])
@report.route('/slot_stats/monthly/<start_date>', methods=['GET'])
def path_slot_stats_monthly(start_date, slot_id=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = slot_stats_monthly(conn, start_date, slot_id)
    return build_response(request, rval, keys, name=start_date)


def register_routes(app):
    app.register_blueprint(report)
