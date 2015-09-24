from datetime import datetime

from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields, reqparse
from sqlalchemy.exc import IntegrityError

from sqlalchemy.orm.exc import NoResultFound
from splice.queries.common import session_scope
from splice.queries.campaign import (
    get_campaigns, get_campaign, insert_campaign, update_campaign)


campaign_bp = Blueprint('api.campaign', __name__, url_prefix='/api')
api = Api(campaign_bp)


campaign_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'country': fields.String,
    'created_at': fields.DateTime,
    'start_date': fields.DateTime,
    'end_date': fields.DateTime,
    'paused': fields.Boolean,
    'channel_id': fields.Integer,
    'account_id': fields.Integer,
}


campaign_parser = reqparse.RequestParser()
campaign_parser.add_argument(
    'name', type=unicode, required=True, help='Name of the campaign',
    location='json')
campaign_parser.add_argument(
    'country', type=str, required=True, help='Country', location='json',
    default='STAR')
campaign_parser.add_argument(
    'start_date', type=datetime, required=False, help='Start date', location='json',
    store_missing=False)
campaign_parser.add_argument(
    'end_date', type=datetime, required=False, help='End date', location='json',
    store_missing=False)
campaign_parser.add_argument(
    'paused', type=str, required=True, help='Campaign status', location='json',
    choices=('true', 'false'), store_missing=False)
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
        self.reqparse.replace_argument('country', type=str, required=False,
                                       help='Country', location='json',
                                       store_missing=False)
        self.reqparse.replace_argument('channel_id', type=int, required=False,
                                       help='Channel ID', location='json',
                                       store_missing=False)
        self.reqparse.replace_argument('account_id', type=int, required=False,
                                       help='Account ID', location='json',
                                       store_missing=False)
        self.reqparse.replace_argument('paused', type=str, required=False,
                                       help='Campaign status', location='json',
                                       choices=('true', 'false'), store_missing=False)

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
api.add_resource(CampaignAPI, '/campaign/<int:campaign_id>', endpoint='campaign')


def register_routes(app):
    app.register_blueprint(campaign_bp)
