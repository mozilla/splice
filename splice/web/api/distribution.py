from flask import Blueprint
from flask_restful import Api, Resource, reqparse, inputs
from splice.queries.distribution import get_possible_distributions
from splice.web.api.tile_upload import artifacts_upload


dist_bp = Blueprint('api.distributions', __name__, url_prefix='/api')
api = Api(dist_bp)

arg_parser = reqparse.RequestParser()
arg_parser.add_argument(
    'date', type=inputs.date, required=False, help='date',
    location='args', store_missing=False)
arg_parser.add_argument(
    'channel_id', type=int, required=False, help='Channel ID',
    location='args', store_missing=False)


class DistributionAPI(Resource):
    def __init__(self):
        super(DistributionAPI, self).__init__()

    def get(self):
        """Returns the distributions on a specific date"""
        args = arg_parser.parse_args()
        artifacts = get_possible_distributions(today=args.get('date'),
                                               channel_id=args.get('channel_id'))
        if artifacts:
            return {"results": artifacts}
        else:
            return {"message": "No ditribution found on that date"}, 404

    def post(self):  # progma: no cover
        """Deploy the current distribution to S3"""
        ret = {}
        args = arg_parser.parse_args()
        try:
            channel_artifacts = get_possible_distributions(today=args.get('date'),
                                                           channel_id=args.get('channel_id'))
            for channel, artifacts in channel_artifacts.items():
                urls = artifacts_upload(artifacts)
                ret[channel] = urls
            return {"results": ret}, 201
        except Exception as e:
            return {"message": "%s" % e}, 400


api.add_resource(DistributionAPI, '/distributions', endpoint='distributions')


def register_routes(app):
    app.register_blueprint(dist_bp)
