from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields, reqparse

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
    'type': fields.String,
    'category': fields.String,
    'frequency_cap_daily': fields.Integer,
    'frequency_cap_total': fields.Integer,
    'created_at': fields.DateTime
}


class AdgroupListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str, required=True,
                                   help='Name of the new adgroup', location='json')
        self.reqparse.add_argument('locale', type=str, required=True,
                                   help='Locale', location='json')
        self.reqparse.add_argument('channel_id', type=int, required=True,
                                   help='Channel ID', location='json')
        self.reqparse.add_argument('campaign_id', type=int, required=True,
                                   help='Campaign ID', location='json')
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
        self.reqparse.add_argument('category', type=str,
                                   help='Category of suggested tile', location='json')
        super(AdgroupListAPI, self).__init__()

    def get(self, campaign_id):
        adgroups = get_adgroups_by_campaign_id(campaign_id)
        if len(adgroups) == 0:
            return {"message": "No adgroups found"}, 404
        else:
            return {"message": marshal(adgroups, adgroup_fields)}

    def post(self, campaign_id):
        args = self.reqparse.parse_args()
        try:
            with session_scope() as session:
                new = insert_adgroup(session, args)
        except InvalidRequestError as e:
            return {"message": e.message}, 400
        except Exception as e:
            return {"message": e.message}, 500
        else:
            return {"message": marshal(new, adgroup_fields)}, 201


class AdgroupAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str,
                                   help='Name of the new adgroup', location='json')
        self.reqparse.add_argument('locale', type=str,
                                   help='Locale', location='json')
        self.reqparse.add_argument('channel_id', type=int,
                                   help='Channel ID', location='json')
        self.reqparse.add_argument('campaign_id', type=int, required=True,
                                   help='Campaign ID', location='json')
        self.reqparse.add_argument('frequency_cap_daily', type=int,
                                   help='Daily frequency cap', location='json')
        self.reqparse.add_argument('frequency_cap_total', type=int,
                                   help='Total frequency cap', location='json')
        self.reqparse.add_argument('explanation', type=unicode,
                                   help='Explanation', location='json')
        self.reqparse.add_argument('check_inadjacency', type=str,
                                   choices=('true', 'false'),
                                   help='Switch of inadjacency check', location='json')
        self.reqparse.add_argument('type', type=str, choices=('directory', 'suggested'),
                                   help='Adgroup type', location='json')
        self.reqparse.add_argument('category', type=str,
                                   help='Category of suggested tile', location='json')
        super(AdgroupAPI, self).__init__()

    def get(self, campaign_id, adgroup_id):
        adgroup = get_adgroup(adgroup_id)
        if adgroup is None:
            return {"message": "Item is missing"}, 404
        else:
            return {"message": marshal(adgroup, adgroup_fields)}

    def put(self, campaign_id, adgroup_id):
        args = self.reqparse.parse_args()
        try:
            with session_scope() as session:
                adgroup = update_adgroup(session, adgroup_id, args)
        except NoResultFound as e:
            return {"message": e.message}, 404
        except InvalidRequestError as e:
            return {"message": e.message}, 400
        except Exception as e:
            return {"message": e.message}, 500
        else:
            return {"message": marshal(adgroup, adgroup_fields)}, 200


api.add_resource(AdgroupListAPI, '/campaigns/<int:campaign_id>/adgroups', endpoint='adgroups')
api.add_resource(AdgroupAPI, '/campaigns/<int:campaign_id>/adgroups/<int:adgroup_id>', endpoint='adgroup')


def register_routes(app):
    app.register_blueprint(adgroup_bp)
