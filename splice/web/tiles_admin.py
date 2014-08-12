from flask import (
    Response,
    redirect,
    request,
    Blueprint
)

from splice.environment import Environment
from splice.models import *

admin = Blueprint('admin', __name__, url_prefix='/admin')
env = Environment.instance()

@admin.route('/', methods='GET')
def root():
    return ""

def register_routes(app):
    app.register_blueprint(admin)
