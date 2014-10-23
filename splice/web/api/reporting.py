from flask import Blueprint, request, Response
from splice.queries import tile_stats, slot_stats, newtab_stats, \
    tile_summary, slot_summary
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

_periods = {'weekly': 'week', 'daily': 'date', 'monthly': 'month'}
_sumaries = {'tile': tile_summary, 'slot': slot_summary}

@report.route('/tile_stats/<period>/<start_date>/<tile_id>/<country_code>', methods=['GET'])
@report.route('/tile_stats/<period>/<start_date>/<tile_id>', methods=['GET'])
def path_tile_stats(start_date, period, tile_id, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = tile_stats(conn, start_date, _periods[period], tile_id, country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/newtab_stats/<period>/<start_date>/<country_code>', methods=['GET'])
@report.route('/newtab_stats/<period>/<start_date>', methods=['GET'])
def path_newtab_stats(start_date, period, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = newtab_stats(conn, start_date, _periods[period], country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/summary/<summary>/<period>/<start_date>/<country_code>', methods=['GET'])
@report.route('/summary/<summary>/<period>/<start_date>', methods=['GET'])
def path_summary(summary, start_date, period, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = _sumaries[summary](conn, start_date, _periods[period], country_code)
    return _build_response(rval, keys, name=start_date)


@report.route('/slot_stats/<period>/<start_date>/<slot_id>/<country_code>', methods=['GET'])
@report.route('/slot_stats/<period>/<start_date>/<slot_id>', methods=['GET'])
def path_slot_stats(start_date, period, slot_id, country_code=None):
    conn = Environment.instance().db.engine.connect()
    keys, rval = slot_stats(conn, start_date, _periods[period], slot_id, country_code)
    return _build_response(rval, keys, name=start_date)


def register_routes(app):
    app.register_blueprint(report)
