from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields, reqparse, inputs

from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError
from splice.queries.common import session_scope
from splice.queries.adgroup import (
    get_adgroups_by_campaign_id, get_adgroup,
    insert_adgroup, update_adgroup)
from splice.models import Adgroup


adgroup_bp = Blueprint('api.adgroup', __name__, url_prefix='/api')
api = Api(adgroup_bp)

adgroup_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'locale': fields.String,
    'campaign_id': fields.Integer,
    'channel_id': fields.Integer,
    'type': fields.String,
    'categories': fields.List(fields.String),
    'explanation': fields.String,
    'frequency_cap_daily': fields.Integer,
    'frequency_cap_total': fields.Integer,
    'paused': fields.Boolean,
    'created_at': fields.DateTime(dt_format='iso8601')
}


class AdgroupListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('campaign_id', type=int, required=True,
                                   help='Campaign ID', location='json')
        self.reqparse.add_argument('channel_id', type=int, required=True,
                                   help='Channle ID', location='json')
        self.reqparse.add_argument('name', type=str, required=True,
                                   help='Name of the new adgroup', location='json')
        self.reqparse.add_argument('locale', type=str, required=True,
                                   help='Locale', location='json')
        self.reqparse.add_argument('frequency_cap_daily', type=int,
                                   help='Daily frequency cap', location='json')
        self.reqparse.add_argument('frequency_cap_total', type=int,
                                   help='Total frequency cap', location='json')
        self.reqparse.add_argument('explanation', type=unicode,
                                   help='Explanation', location='json')
        self.reqparse.add_argument('check_inadjacency', type=str,
                                   choices=('true', 'false'),
                                   help='Switch of inadjacency check', location='json')
        self.reqparse.add_argument('type', type=str, required=True,
                                   choices=Adgroup.TYPE,
                                   help='Adgroup type', location='json')
        self.reqparse.add_argument('categories', type=list, default=[],
                                   help='Category of suggested tile', location='json')
        self.reqparse.add_argument('paused', type=inputs.boolean, required=True,
                                   help='Campaign status', location='json')
        self.reqparse_get = reqparse.RequestParser()
        self.reqparse_get.add_argument('campaign_id', type=int, required=True,
                                       help='Campaign ID', location='args')

        super(AdgroupListAPI, self).__init__()

    def get(self):
        args = self.reqparse_get.parse_args()
        adgroups = get_adgroups_by_campaign_id(args['campaign_id'])
        return {"results": marshal(adgroups, adgroup_fields)}

    def post(self):
        args = self.reqparse.parse_args()
        try:
            with session_scope() as session:
                new = insert_adgroup(session, args)
        except InvalidRequestError as e:
            return {"message": e.message}, 400
        else:
            return {"result": marshal(new, adgroup_fields)}, 201


class AdgroupAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str, store_missing=False,
                                   help='Name of the new adgroup', location='json')
        self.reqparse.add_argument('locale', type=str, store_missing=False,
                                   help='Locale', location='json')
        self.reqparse.add_argument('campaign_id', type=int, required=True,
                                   help='Campaign ID', location='json')
        self.reqparse.add_argument('frequency_cap_daily', type=int, store_missing=False,
                                   help='Daily frequency cap', location='json')
        self.reqparse.add_argument('frequency_cap_total', type=int, store_missing=False,
                                   help='Total frequency cap', location='json')
        self.reqparse.add_argument('explanation', type=unicode, store_missing=False,
                                   help='Explanation', location='json')
        self.reqparse.add_argument('check_inadjacency', type=str, store_missing=False,
                                   choices=('true', 'false'),
                                   help='Switch of inadjacency check', location='json')
        self.reqparse.add_argument('type', type=str, store_missing=False,
                                   choices=Adgroup.TYPE,
                                   help='Adgroup type', location='json')
        self.reqparse.add_argument('categories', type=list, default=[], store_missing=False,
                                   help='Category of suggested tile', location='json')
        self.reqparse.add_argument('paused', type=inputs.boolean, required=False,
                                   help='Adgroup status', location='json',
                                   store_missing=False)
        super(AdgroupAPI, self).__init__()

    def get(self, adgroup_id):
        adgroup = get_adgroup(adgroup_id)
        if adgroup is None:
            return {"message": "Item is missing"}, 404
        else:
            return {"result": marshal(adgroup, adgroup_fields)}

    def put(self, adgroup_id):
        args = self.reqparse.parse_args()
        try:
            with session_scope() as session:
                adgroup = update_adgroup(session, adgroup_id, args)
        except NoResultFound as e:
            return {"message": e.message}, 404
        except InvalidRequestError as e:
            return {"message": e.message}, 400
        else:
            return {"result": marshal(adgroup, adgroup_fields)}, 200


api.add_resource(AdgroupListAPI, '/adgroups', endpoint='adgroups')
api.add_resource(AdgroupAPI, '/adgroups/<int:adgroup_id>', endpoint='adgroup')


def register_routes(app):
    app.register_blueprint(adgroup_bp)
