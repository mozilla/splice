from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields
from splice.environment import Environment
from splice.queries.common import get_channels


init_bp = Blueprint('api.init', __name__, url_prefix='/api')
api = Api(init_bp)

country_fields = {
    'country_code': fields.String,
    'country_name': fields.String,
}

locale_fields = {
    "results": fields.List(fields.String),
}

channel_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'created_at': fields.DateTime(dt_format='iso8601'),
}

category_fields = {
    'results': fields.List(fields.String),
}

all_fields = {
    "countries": fields.List(fields.Nested(country_fields)),
    "locales": fields.List(fields.String),
    "channels": fields.List(fields.Nested(channel_fields)),
    "categories": fields.List(fields.String),
}


class InitAPI(Resource):
    def __init__(self):
        super(InitAPI, self).__init__()

    def get(self, target):
        """Returns the init data including locales, countries, channels etc.

        Params: target string, [all|locales|countries|channels]
        """
        target = target.lower()
        if target == "all":
            locales = Environment.instance()._load_locales()[:-1]
            locales.sort()
            countries = Environment.instance()._load_countries()[:-1]
            country_items = [{"country_code": code, "country_name": name} for code, name in countries]
            channels = get_channels()
            categories = Environment.instance()._load_categories()
            data = {
                "countries": country_items,
                "channels": channels,
                "locales": locales,
                "categories": categories,
            }
            return {'result': marshal(data, all_fields)}
        elif target == "locales":
            # the last item is 'ERROR', client won't need this
            locales = Environment.instance()._load_locales()[:-1]
            locales.sort()
            return marshal({"results": locales}, locale_fields)
        elif target == "countries":
            # the last item is 'ERROR', client won't need this
            countries = Environment.instance()._load_countries()[:-1]
            country_items = [{"country_code": code, "country_name": name} for code, name in countries]
            return {'results': marshal(country_items, country_fields)}
        elif target == "channels":
            channels = get_channels()
            return {'results': marshal(channels, channel_fields)}
        elif target == "categories":
            categories = Environment.instance()._load_categories()
            return marshal({"results": categories}, category_fields)
        else:
            return {"message": "Unknown target, must be one of [all|locales|countries|channels]"}, 404

api.add_resource(InitAPI, '/init/<string:target>', endpoint='init')


def register_routes(app):
    app.register_blueprint(init_bp)
