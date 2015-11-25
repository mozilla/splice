from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields, reqparse, inputs
from splice.queries.reporting import get_stats
from splice.models import Tile, Adgroup

reporting_bp = Blueprint('api.reporting', __name__, url_prefix='/api')
api = Api(reporting_bp)

valid_group_by = {
    'date': fields.DateTime(dt_format='iso8601'),
    'week': fields.Integer,
    'month': fields.Integer,
    'category': fields.String,
    'locale': fields.String,
    'country_code': fields.String
}

valid_filters = {
    'account_id': {'type': int, 'store_missing': False},
    'adgroup_id': {'type': int, 'store_missing': False},
    'campaign_id': {'type': int, 'store_missing': False},
    'account_id': {'type': int, 'store_missing': False},
    'type': {'choices': Tile.TYPES, 'store_missing': False},
    'adgroup_type': {'choices': Adgroup.TYPE, 'store_missing': False},
    'country_code': {'store_missing': False},
    'locale': {'store_missing': False},
    'channel_id': {'type': int, 'store_missing': False},
    'start_date': {'type': inputs.date, 'store_missing': False},
    'end_date': {'type': inputs.date, 'store_missing': False}
}


def reporting_fields(group_by):
    resp_fields = {
        'impressions': fields.Integer,
        'clicks': fields.Integer,
        'pinned': fields.Integer,
        'blocked': fields.Integer
    }
    for field in group_by:
        resp_fields[field] = valid_group_by.get(field)
    return resp_fields

req_parser = reqparse.RequestParser()
req_parser.add_argument('group_by', action='append', choices=valid_group_by.keys(), default=['date'])
for field, options in valid_filters.iteritems():
    req_parser.add_argument(field, **options)


class ReportingAPI(Resource):
    def __init__(self):
        self.reqparse_get = req_parser

        super(ReportingAPI, self).__init__()

    def get(self):
        """Returns stats for a campaign."""

        args = self.reqparse_get.parse_args(strict=True)

        filter_args = {}
        for k in valid_filters:
            if k in args:
                filter_args[k] = args[k]

        group_by = args['group_by']

        stats = get_stats(group_by=group_by, filters=filter_args)

        if not stats:
            return {'results': []}
        else:
            return {'results': marshal(stats, reporting_fields(group_by))}

api.add_resource(ReportingAPI, '/stats', endpoint='stats')


def register_routes(app):
    app.register_blueprint(reporting_bp)
