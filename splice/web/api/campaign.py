from flask import Blueprint, request
from flask.json import jsonify
from flask_restful import Api, Resource, marshal, fields, reqparse, inputs
from sqlalchemy.exc import IntegrityError

from sqlalchemy.orm.exc import NoResultFound
from splice.queries.common import session_scope
from splice.queries.campaign import (
    get_campaigns, get_campaign, insert_campaign, update_campaign)
from splice.web.api.tile_upload import bulk_upload


campaign_bp = Blueprint('api.campaign', __name__, url_prefix='/api')
api = Api(campaign_bp)

campaign_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'countries': fields.List(fields.String),
    'created_at': fields.DateTime(dt_format='iso8601'),
    'start_date': fields.DateTime(dt_format='iso8601'),
    'end_date': fields.DateTime(dt_format='iso8601'),
    'paused': fields.Boolean,
    'channel_id': fields.Integer,
    'account_id': fields.Integer,
}


campaign_parser = reqparse.RequestParser()
campaign_parser.add_argument(
    'name', type=unicode, required=True, help='Name of the campaign',
    location='json')
campaign_parser.add_argument(
    'countries', type=list, required=True, default=["STAR"], help='List of countries', location='json')
campaign_parser.add_argument(
    'start_date', type=inputs.datetime_from_iso8601, required=False, help='Start date', location='json',
    store_missing=False)
campaign_parser.add_argument(
    'end_date', type=inputs.datetime_from_iso8601, required=False, help='End date', location='json',
    store_missing=False)
campaign_parser.add_argument(
    'paused', type=inputs.boolean, required=True, help='Campaign status', location='json',
    store_missing=False)
campaign_parser.add_argument(
    'channel_id', type=int, required=True, help='Channel ID', location='json')
campaign_parser.add_argument(
    'account_id', type=int, required=True, help='Account ID', location='json')


class CampaignListAPI(Resource):
    def __init__(self):
        self.reqparse_post = campaign_parser
        self.reqparse_get = reqparse.RequestParser()
        self.reqparse_get.add_argument(
            'account_id', type=int, required=True, help='Account ID', location='args')

        super(CampaignListAPI, self).__init__()

    def get(self):
        """Returns all the campaigns.

        Takes an optional account_id as a query string argument.
        """
        args = self.reqparse_get.parse_args()
        campaigns = get_campaigns(args.get('account_id'))
        return {'results': marshal(campaigns, campaign_fields)}

    def post(self):
        """Creates a campaign."""
        args = self.reqparse_post.parse_args()
        try:
            with session_scope() as session:
                new = insert_campaign(session, args)
        except IntegrityError:
            return {'message': 'Invalid account_id or channel_id provided.'}, 400
        else:
            return {'result': marshal(new, campaign_fields)}, 201


class CampaignAPI(Resource):
    def __init__(self):
        self.reqparse = campaign_parser.copy()

        # Mostly the same parser. Name, channel, account and status are
        # optional here.
        self.reqparse.replace_argument('name', type=unicode, required=False,
                                       help='Name of the campaign',
                                       location='json', store_missing=False)
        self.reqparse.replace_argument('countries', type=list, required=False,
                                       help='List of countries', location='json',
                                       store_missing=False)
        self.reqparse.replace_argument('channel_id', type=int, required=False,
                                       help='Channel ID', location='json',
                                       store_missing=False)
        self.reqparse.replace_argument('account_id', type=int, required=False,
                                       help='Account ID', location='json',
                                       store_missing=False)
        self.reqparse.replace_argument('paused', type=inputs.boolean, required=False,
                                       help='Campaign status', location='json',
                                       store_missing=False)

        super(CampaignAPI, self).__init__()

    def get(self, campaign_id):
        """Returns the campaign with given campaign_id."""
        campaign = get_campaign(campaign_id)
        if campaign is None:
            return {'message': 'Campaign with id={id} not found.'.format(
                id=campaign_id)}, 404
        else:
            return {'result': marshal(campaign, campaign_fields)}

    def put(self, campaign_id):
        """updates the campaign with given campaign_id."""
        args = self.reqparse.parse_args()
        try:
            with session_scope() as session:
                campaign = update_campaign(session, campaign_id, args)
        except NoResultFound as e:
            return {'message': e.message}, 404
        except IntegrityError as e:
            return {'message': 'Invalid account_id or channel_id provided.'}, 400

        return {'result': marshal(campaign, campaign_fields)}, 200


api.add_resource(CampaignListAPI, '/campaigns', endpoint='campaigns')
api.add_resource(CampaignAPI, '/campaigns/<int:campaign_id>', endpoint='campaign')


_VALID_CREATIVE_EXTENSIONS = set(['zip'])
_VALID_ASSETS_EXTENSIONS = set(['tsv', 'txt'])


@campaign_bp.route('/campaigns/<int:campaign_id>/bulkupload', methods=['POST'])
def handler_bulk_upload(campaign_id):
    """bulk uploading adgroups and tiles with the given campaign_id."""

    def _is_allowed_file(name, allowed_sets):
        return '.' in name and name.rsplit('.', 1)[1].lower() in allowed_sets

    creatives = request.files["creatives"]
    assets = request.files["assets"]
    if not _is_allowed_file(creatives.filename, _VALID_CREATIVE_EXTENSIONS) \
            or not _is_allowed_file(assets.filename, _VALID_ASSETS_EXTENSIONS):
            return jsonify(message="Invalid files uploaded."), 400

    campaign = get_campaign(campaign_id)
    if campaign is None:
        return jsonify(message='Campaign not found.'), 404

    try:
        bulk_upload(creatives.stream, assets.stream, campaign_id, campaign["channel_id"])
    except Exception as e:
        return jsonify(message="Error: %s" % e), 400
    else:
        return jsonify(message="Uploading successfully.")


def register_routes(app):
    app.register_blueprint(campaign_bp)
