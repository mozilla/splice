from flask import Blueprint, render_template
from splice.environment import Environment

root = Blueprint('root', __name__)
env = Environment.instance()


@root.route('/', methods=['GET'])
def index():
    return render_template('index.jinja2')


@root.route('/distribution/', methods=['GET'])
def distribution():
    return render_template('distribution.jinja2')


@root.route('/campaign/', methods=['GET'])
def campaign():
    return render_template('campaign.jinja2')


def register_routes(app):
    app.register_blueprint(root)
