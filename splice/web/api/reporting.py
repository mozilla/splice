from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields
from splice.queries.reporting import get_stats_by_date


reporting_bp = Blueprint('api.reporting', __name__, url_prefix='/api')
api = Api(reporting_bp)

reporting_fields = {
    'date': fields.DateTime(dt_format='iso8601'),
    'impressions': fields.Integer,
    'clicks': fields.Integer,
    'pinned': fields.Integer,
    'blocked': fields.Integer
}


class ReportingAPI(Resource):
    def __init__(self):
        super(ReportingAPI, self).__init__()

    def get(self, campaign_id):
        """Returns stats for a campaign."""
        stats = get_stats_by_date(campaign_id)

        if not stats:
            return {'message': 'No stats for campaign_id={id} found.'.format(id=campaign_id)}, 404
        else:
            return {'results': marshal(stats, reporting_fields)}

api.add_resource(ReportingAPI, '/stats/campaign/<int:campaign_id>', endpoint='stats')


def register_routes(app):
    app.register_blueprint(reporting_bp)
