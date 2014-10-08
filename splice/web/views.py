from flask import Blueprint, render_template
from splice.environment import Environment

root = Blueprint('root', __name__)
env = Environment.instance()


@root.route('/', methods=['GET'])
def index():
    return render_template('index.jinja2')


def register_routes(app):
    app.register_blueprint(root)
