import jsonschema

from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields, reqparse
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError
from splice.schemas import API_TILE_SCHEMA
from splice.models import Tile
from splice.queries.common import session_scope
from splice.queries.tile import (
    get_tiles_by_adgroup_id, insert_tile, get_tile, update_tile)


tile_bp = Blueprint('api.tile', __name__, url_prefix='/api')
api = Api(tile_bp)

tile_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'target_url': fields.String,
    'attribution_url': fields.String,
    'attribution_period': fields.Integer,
    'adgroup_id': fields.Integer,
    'type': fields.String,
    'status': fields.String,
    'image_uri': fields.String,
    'enhanced_image_uri': fields.String,
    'explanation': fields.String,
    'created_at': fields.DateTime,
    'bg_color': fields.String
}


class TileListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('title', type=unicode, required=True,
                                   help='Title', location='json')
        self.reqparse.add_argument('adgroup_id', type=int, required=True,
                                   help='Adgroup ID', location='json')
        self.reqparse.add_argument('type', type=str, required=True,
                                   choices=Tile.TYPE,
                                   help='Tile type', location='json')
        self.reqparse.add_argument('target_url', type=str, required=True,
                                   help='Click through URL', location='json')
        self.reqparse.add_argument('attribution_url', type=str,
                                   help='Attribution URL', location='json')
        self.reqparse.add_argument('attribution_period', type=int,
                                   help='Attribution period', location='json')
        self.reqparse.add_argument('image_uri', type=str, required=True,
                                   help='base64 encoded roll over image', location='json')
        self.reqparse.add_argument('enhanced_image_uri', type=str, required=True,
                                   help='base64 encoded static image', location='json')
        self.reqparse.add_argument('bg_color', type=str, default="",
                                   help='Background color', location='json')
        self.reqparse.add_argument('explanation', type=unicode, default="",
                                   help='Contextual explanation', location='json')
        super(TileListAPI, self).__init__()

    def get(self, adgroup_id):
        tiles = get_tiles_by_adgroup_id(adgroup_id)
        if len(tiles) == 0:
            return {"message": "No tiles found"}, 404
        else:
            return {"message": marshal(tiles, tile_fields)}

    def post(self, adgroup_id):
        """ HTTP end point to create new tile. Note the initial status of a new
        tile is always set as 'unapproved'
        """
        args = self.reqparse.parse_args()
        # the status of new tiles are alway set as unapproved
        args["status"] = "unapproved"

        try:
            # validate background color, url, and image fields again
            jsonschema.validate(args, API_TILE_SCHEMA)
            with session_scope() as session:
                new = insert_tile(session, args)
        except jsonschema.exceptions.ValidationError as e:
            return {"message": e.message}, 400
        except InvalidRequestError as e:
            return {"message": e.message}, 400
        except Exception as e:
            return {"message": e.message}, 500
        else:
            return {"message": marshal(new, tile_fields)}, 201


class TileAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('adgroup_id', type=int, required=True,
                                   help='adgroup ID', location='json')
        self.reqparse.add_argument('status', type=str, required=True,
                                   choices=Tile.STATUS,
                                   help='Status', location='json')
        super(TileAPI, self).__init__()

    def get(self, adgroup_id, tile_id):
        tile = get_tile(tile_id)
        if tile is None:
            return {"message": "No tile found"}, 404
        else:
            return {"message": marshal(tile, tile_fields)}

    def put(self, adgroup_id, tile_id):
        args = self.reqparse.parse_args()
        try:
            with session_scope() as session:
                tile = update_tile(session, tile_id, args)
        except NoResultFound as e:
            return {"message": e.message}, 404
        except Exception as e:
            return {"message": e.message}, 500
        else:
            return {"message": marshal(tile, tile_fields)}, 200


api.add_resource(TileListAPI, '/adgroups/<int:adgroup_id>/tiles', endpoint='tiles')
api.add_resource(TileAPI, '/adgroups/<int:adgroup_id>/tile/<int:tile_id>', endpoint='tile')


def register_routes(app):
    app.register_blueprint(tile_bp)
