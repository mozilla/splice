from flask import Blueprint
from flask_restful import Api, Resource, marshal, fields, reqparse
from sqlalchemy.exc import IntegrityError

from sqlalchemy.orm.exc import NoResultFound
from splice.queries.common import session_scope
from splice.queries.account import (
    get_accounts, get_account, insert_account, update_account)


account_bp = Blueprint('api.account', __name__, url_prefix='/api')
api = Api(account_bp)


account_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'created_at': fields.DateTime,
    'contact_name': fields.String,
    'contact_email': fields.String,
    'contact_phone': fields.String,
}


class AccountListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=unicode, required=True,
                                   help='Name of the new account', location='json')
        self.reqparse.add_argument('contact_email', type=str, required=False,
                                   help='Email address', location='json',
                                   store_missing=False)
        self.reqparse.add_argument('contact_name', type=unicode, required=False,
                                   help='Contact name', location='json',
                                   store_missing=False)
        self.reqparse.add_argument('contact_phone', type=str, required=False,
                                   help='Phone number', location='json',
                                   store_missing=False)

        super(AccountListAPI, self).__init__()

    def get(self):
        """Returns all the accounts."""
        accounts = get_accounts()
        return {"results": marshal(accounts, account_fields)}

    def post(self):
        """Creates an account."""
        args = self.reqparse.parse_args()
        try:
            with session_scope() as session:
                new = insert_account(session, args)
        except IntegrityError as e:
            return {'message': e.message}, 400
        else:
            return {'result': marshal(new, account_fields)}, 201


class AccountAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=unicode, required=False,
                                   help='Name of the new account', location='json',
                                   store_missing=False)
        self.reqparse.add_argument('contact_name', type=unicode, required=False,
                                   help='Phone number', location='json',
                                   store_missing=False)
        self.reqparse.add_argument('contact_email', type=str, required=False,
                                   help='Email address', location='json',
                                   store_missing=False)
        self.reqparse.add_argument('contact_phone', type=str, required=False,
                                   help='Phone number', location='json',
                                   store_missing=False)

        super(AccountAPI, self).__init__()

    def get(self, account_id):
        account = get_account(account_id)
        if account is None:
            return {'message': 'Account with id={id} not found.'.format(id=account_id)}, 404
        else:
            return {'result': marshal(account, account_fields)}

    def put(self, account_id):
        args = self.reqparse.parse_args()
        try:
            with session_scope() as session:
                account = update_account(session, account_id, args)
        except NoResultFound as e:
            return {'message': e.message}, 404
        except IntegrityError as e:
            return {'message': e.message}, 400
        else:
            return {'result': marshal(account, account_fields)}, 200


api.add_resource(AccountListAPI, '/accounts', endpoint='accounts')
api.add_resource(AccountAPI, '/accounts/<int:account_id>', endpoint='account')


def register_routes(app):
    app.register_blueprint(account_bp)
