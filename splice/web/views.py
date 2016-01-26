from flask import Blueprint, render_template, send_from_directory
from splice.environment import Environment
import os

root = Blueprint('root', __name__)
env = Environment.instance()

campaign_static_path = os.path.join(env.application.config['STATIC_DIR'], 'build/campaign-manager')


@root.route('/', methods=['GET'])
def index():
    return render_template('index.jinja2')


@root.route('/distribution/', methods=['GET'])
def distribution():
    return render_template('distribution.jinja2')


@root.route('/campaign', methods=['GET'])
def campaign():
    return send_from_directory(campaign_static_path, 'index.html')


def register_routes(app):
    app.register_blueprint(root)
