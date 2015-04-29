from flask import Blueprint
from splice.models import Environment, Tile
from sqlalchemy.sql import select
from boto.s3.key import Key
import random


heartbeat = Blueprint('api.heartbeat', __name__, url_prefix='/')


@heartbeat.route('__heartbeat__', methods=['GET'])
def root():
    try:
        conn = Environment.instance().db.engine.connect()
        stmt = select([Tile.id])
        res = conn.execute(stmt)
        assert res is not None
    except Exception as e:
        return "Error hitting Redshift: %s" % str(e), 500

    try:
        bucket = Environment.instance().s3.get_bucket(Environment.instance().config.S3["bucket"])
        key = Key(bucket)
        key.name = "__heartbeat__%d" % random.randint(0, 759392)
        key.set_contents_from_string("heartbeat test")
        key.delete()
    except Exception as e:
        return "Error hitting S3: %s" % str(e), 500

    return "OK", 200


def register_routes(app):
    app.register_blueprint(heartbeat)
