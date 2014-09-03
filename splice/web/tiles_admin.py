from flask import (
    Response,
    redirect,
    request,
    Blueprint
)

from splice.environment import Environment
from splice.queries import *
from splice.models import *

admin = Blueprint('admin', __name__, url_prefix='/admin')
env = Environment.instance()


@admin.route('/', methods='GET')
def root():
    return ""


def register_routes(app):
    app.register_blueprint(admin)


@admin.route('/tile_stats/weekly/<start_date>/<tile_id>', methods=['GET'])
def tile_stats_weekly(start_date, tile_id=None):
    pass

@admin.route('/tile_stats/monthly/<tile_id>', methods=['GET'])
def tile_stats_monthly(tile_id=None):
    pass


@admin.route('/slot_stats/weekly/<slot_id>', methods=['GET'])
def slot_stats_weekly(slot_id=None):
    pass


@admin.route('/slot_stats/monthly/<slot_id>', methods=['GET'])
def slot_stats_monthly(slot_id=None):
    pass
