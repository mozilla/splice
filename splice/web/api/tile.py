from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields, reqparse
from splice.models import Tile
# from splice.queries import (NoResultFound, InvalidRequestError, session_scope,)

tile_bp = Blueprint('api.tile', __name__, url_prefix='/api')
api = Api(tile_bp)

tile_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'locale': fields.String,
    'target_url': fields.String,
    'adgroup_id': fields.Integer,
    'type': fields.String,
    'status': fields.String,
    'image_uri': fields.String,
    'enhanced_image_uri': fields.String,
    'created_at': fields.DateTime
}


class TileListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('locale', type=str, required=True,
                                   help='Locale', location='json')
        self.reqparse.add_argument('title', type=unicode, required=True,
                                   help='Title', location='json')
        self.reqparse.add_argument('adgroup_id', type=int, required=True,
                                   help='Adgroup ID', location='json')
        self.reqparse.add_argument('type', type=str, required=True,
                                   choices=Tile.TYPES,
                                   help='Tile type', location='json')
        self.reqparse.add_argument('target_url', type=str,
                                   help='Click through URL', location='json')
        self.reqparse.add_argument('image_uri', type=str,
                                   help='Sha1 hash of roll over image', location='json')
        self.reqparse.add_argument('enhanced_image_uri', type=str,
                                   help='Sha1 hash of static image', location='json')
        self.reqparse.add_argument('status', type=str,
                                   choices=Tile.STATUS,
                                   help='Status of the new tile', location='json')
        self.reqparse.add_argument('bg_color', type=str, default="",
                                   help='Backgroup color', location='json')
        super(TileListAPI, self).__init__()

    def get(self, campaign_id):
        tiles = []
        if len(tiles) == 0:
            return {"message": "No adgroups found"}, 404
        else:
            return {"message": marshal(tiles, tile_fields)}

    def post(self, campaign_id):
        pass


class TileAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str,
                                   help='Name of the new tile', location='json')
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
        super(TileAPI, self).__init__()

    def get(self, campaign_id, adgroup_id):
        pass

    def put(self, campaign_id, adgroup_id):
        pass


api.add_resource(TileListAPI,
                 '/adgroups/<int:adgroup_id>/tiles',
                 endpoint='tiles')
api.add_resource(TileAPI,
                 '/adgroups/<int:adgroup_id>/tile/<int:tile_id>',
                 endpoint='tile')


def register_routes(app):
    app.register_blueprint(tile_bp)
