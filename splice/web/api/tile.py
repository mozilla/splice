import jsonschema

from flask import Blueprint, request
from flask.json import jsonify
from flask_restful import Api, Resource, marshal, fields, reqparse, inputs
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError
from splice.schemas import API_TILE_SCHEMA_POST, API_TILE_SCHEMA_PUT
from splice.models import Tile
from splice.queries.common import session_scope
from splice.queries.tile import get_tiles, insert_tile, get_tile, update_tile
from splice.web.api.tile_upload import VALID_CREATIVE_EXTS, single_creative_upload, upload_signed_content


tile_bp = Blueprint('api.tile', __name__, url_prefix='/api')
api = Api(tile_bp)

tile_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'target_url': fields.String,
    'adgroup_id': fields.Integer,
    'type': fields.String,
    'status': fields.String,
    'image_uri': fields.String,
    'enhanced_image_uri': fields.String,
    'created_at': fields.DateTime(dt_format='iso8601'),
    'bg_color': fields.String,
    'paused': fields.Boolean,
    'title_bg_color': fields.String,
    'position_priority': fields.String
}


class TileListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('adgroup_id', type=int, required=True,
                                   help='Adgroup ID', location='json')
        self.reqparse.add_argument('title', type=unicode, required=True,
                                   help='Title', location='json')
        self.reqparse.add_argument('type', type=str, required=True,
                                   choices=Tile.TYPES,
                                   help='Tile type', location='json')
        self.reqparse.add_argument('status', type=str, required=True,
                                   choices=Tile.STATUS,
                                   help='Tile approval state', location='json')
        self.reqparse.add_argument('target_url', type=str, required=True,
                                   help='Click through URL', location='json')
        self.reqparse.add_argument('image_uri', type=str, required=True,
                                   help='base64 encoded roll over image', location='json')
        self.reqparse.add_argument('enhanced_image_uri', type=str, required=True,
                                   help='base64 encoded static image', location='json')
        self.reqparse.add_argument('bg_color', type=str, default="",
                                   help='Background color', location='json')
        self.reqparse.add_argument('title_bg_color', type=str, default="",
                                   help='Background color of title', location='json')
        self.reqparse.add_argument('position_priority', type=str, default='medium',
                                   choices=set(Tile.POSITION_PRIORITY.keys()),
                                   help='Position priority', location='json')
        self.reqparse.add_argument('paused', type=inputs.boolean, required=True,
                                   help='Tile status', location='json')
        self.reqparse_get = reqparse.RequestParser()
        self.reqparse_get.add_argument('adgroup_id', type=int, required=True,
                                       help='Adgroup ID', location='args')
        super(TileListAPI, self).__init__()

    def get(self):
        args = self.reqparse_get.parse_args()
        tiles = get_tiles(filters={'adgroup_id': args['adgroup_id']})
        if tiles:
            return {"results": marshal(tiles, tile_fields)}
        else:
            return {"results": []}

    def post(self):
        """ HTTP end point to create new tile. Note the initial status of a new
        tile is always set as 'unapproved'
        """
        args = self.reqparse.parse_args()
        # the status of new tiles are alway set as unapproved
        args["status"] = "unapproved"

        try:
            # validate background color, url, and image fields again
            jsonschema.validate(args, API_TILE_SCHEMA_POST)
            with session_scope() as session:
                new = insert_tile(session, args)
        except jsonschema.exceptions.ValidationError as e:
            return {"message": e.message}, 400
        except InvalidRequestError as e:
            return {"message": e.message}, 400
        else:
            return {"result": marshal(new, tile_fields)}, 201


class TileAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('status', type=str, required=False,
                                   choices=Tile.STATUS, store_missing=False,
                                   help='Tile approval state', location='json')
        self.reqparse.add_argument('paused', type=inputs.boolean, required=False,
                                   help='Tile status', location='json',
                                   store_missing=False)
        self.reqparse.add_argument('bg_color', type=str, required=False, store_missing=False,
                                   help='Background color', location='json')
        self.reqparse.add_argument('position_priority', type=str, required=False,
                                   store_missing=False,
                                   choices=set(Tile.POSITION_PRIORITY.keys()),
                                   help='Position priority', location='json')
        self.reqparse.add_argument('title_bg_color', type=str, required=False, store_missing=False,
                                   help='Background color of title', location='json')
        super(TileAPI, self).__init__()

    def get(self, tile_id):
        tile = get_tile(tile_id)
        if tile is None:
            return {"message": "No tile found"}, 404
        else:
            return {"result": marshal(tile, tile_fields)}

    def put(self, tile_id):
        args = self.reqparse.parse_args()
        try:
            jsonschema.validate(args, API_TILE_SCHEMA_PUT)
            with session_scope() as session:
                tile = update_tile(session, tile_id, args)
        except jsonschema.exceptions.ValidationError as e:
            return {"message": e.message}, 400
        except NoResultFound as e:
            return {"message": e.message}, 404
        else:
            return {"result": marshal(tile, tile_fields)}, 200


api.add_resource(TileListAPI, '/tiles', endpoint='tiles')
api.add_resource(TileAPI, '/tiles/<int:tile_id>', endpoint='tile')


@tile_bp.route('/tiles/creative/upload', methods=['POST'])
def handler_creative_upload():
    """Upload a single creative to S3, return the URL if succeeds."""
    def _is_allowed_file(name, allowed_sets):
        return '.' in name and name.rsplit('.', 1)[1].lower() in allowed_sets

    creative = request.files["creative"]
    if not _is_allowed_file(creative.filename, VALID_CREATIVE_EXTS):
        return jsonify(message="Invalid creative uploaded."), 400

    try:
        url = single_creative_upload(creative.stream,
                                     creative.filename.rsplit('.', 1)[1])
    except Exception as e:
        return jsonify(message="%s" % e), 400
    else:
        return jsonify(result=url)


@tile_bp.route('/tiles/content/upload', methods=['POST'])
def handler_content_upload():
    """Upload a single content to S3, return the URL if succeeds."""
    def _is_allowed_file(name):
        return '.' in name and name.rsplit('.', 1)[1].lower() in set(['html', 'xpi', 'zip'])

    content_file = request.files["content"]
    if not _is_allowed_file(content_file.filename):
        return jsonify(message="Invalid content uploaded."), 400

    try:
        url = upload_signed_content(content_file.stream, content_file.filename)
    except Exception as e:
        return jsonify(message="%s" % e), 400
    else:
        return jsonify(result=url)


def register_routes(app):
    app.register_blueprint(tile_bp)
