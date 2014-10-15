from flask import Blueprint, request, Response
from splice.queries import tile_stats_monthly, tile_stats_weekly, slot_stats_weekly, \
    slot_stats_monthly, tile_summary_monthly, tile_summary_weekly, slot_summary_monthly, \
    slot_summary_weekly, tile_stats_daily, tile_summary_daily
from splice.models import Environment

import ujson
import StringIO
import csv


def _build_response(it, keys, name=''):
    json = request.args.get('json')
    if json == 'true':
        json = True
    else:
        json = False
    headers = request.args.get('headers')
    if headers == 'false':
        headers = False
    else:
        headers = True
    download = request.args.get('download')
    if download == 'true':
        download = True
    else:
        download = False

    if json:
        rval = []
        for tup in it:
            rval.append(dict(zip(keys, tup)))
        response = Response(ujson.dumps(rval), content_type='application/json; charset=utf-8', status=200)
        ending = 'json'
    else:
        buf = StringIO.StringIO()
        writer = csv.writer(buf)
        if headers:
            writer.writerow(keys)
        for tup in it:
            writer.writerow(tup)
        response = Response(buf.getvalue(), content_type='text/csv; charset=utf-8', status=200)
        buf.close()
        ending = 'csv'

    if download:
        response.headers['Content-Disposition'] = 'attachment; filename=imps_%s.%s' % (name, ending)
    return response

report = Blueprint('api.report', __name__, url_prefix='/api/report')


@report.route('/', methods=['GET'])
def root():
    return ""


@report.route('/tile_stats/weekly/<start_date>/<tile_id>/<country_code>', methods=['GET'])
@report.route('/tile_stats/weekly/<start_date>/<tile_id>', methods=['GET'])
def path_tile_stats_weekly(start_date, tile_id, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_stats_weekly(conn, start_date, tile_id, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/tile_stats/monthly/<start_date>/<tile_id>/<country_code>', methods=['GET'])
@report.route('/tile_stats/monthly/<start_date>/<tile_id>', methods=['GET'])
def path_tile_stats_monthly(start_date, tile_id, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_stats_monthly(conn, start_date, tile_id, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/tile_stats/daily/<start_date>/<tile_id>/<country_code>', methods=['GET'])
@report.route('/tile_stats/daily/<start_date>/<tile_id>', methods=['GET'])
def path_tile_stats_daily(start_date, tile_id, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_stats_daily(conn, start_date, tile_id, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/tile_summary/weekly/<start_date>/<country_code>', methods=['GET'])
@report.route('/tile_summary/weekly/<start_date>', methods=['GET'])
def path_tile_summary_weekly(start_date, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_summary_weekly(conn, start_date, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/tile_summary/monthly/<start_date>/<country_code>', methods=['GET'])
@report.route('/tile_summary/monthly/<start_date>', methods=['GET'])
def path_tile_summary_monthly(start_date, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_summary_monthly(conn, start_date, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/tile_summary/daily/<start_date>/<country_code>', methods=['GET'])
@report.route('/tile_summary/daily/<start_date>', methods=['GET'])
def path_tile_summary_daily(start_date, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_summary_daily(conn, start_date, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/slot_stats/weekly/<start_date>/<slot_id>/<country_code>', methods=['GET'])
@report.route('/slot_stats/weekly/<start_date>/<slot_id>', methods=['GET'])
def path_slot_stats_weekly(start_date, slot_id, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = slot_stats_weekly(conn, start_date, slot_id, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/slot_stats/monthly/<start_date>/<slot_id>/<country_code>', methods=['GET'])
@report.route('/slot_stats/monthly/<start_date>/<slot_id>', methods=['GET'])
def path_slot_stats_monthly(start_date, slot_id, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = slot_stats_monthly(conn, start_date, slot_id, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/slot_summary/weekly/<start_date>/<country_code>', methods=['GET'])
@report.route('/slot_summary/weekly/<start_date>', methods=['GET'])
def path_slot_summary_weekly(start_date, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = slot_summary_weekly(conn, start_date, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/slot_summary/monthly/<start_date>/<country_code>', methods=['GET'])
@report.route('/slot_summary/monthly/<start_date>', methods=['GET'])
def path_slot_summary_monthly(start_date, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = slot_summary_monthly(conn, start_date, country_code)
    return _build_response(rval, keys, name=start_date)


def register_routes(app):
    app.register_blueprint(report)
