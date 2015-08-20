# TODO: FIXME: This import has the side effect of creating the
# test environment. So it needs to be first.
from tests.base import BaseTestCase

from flask import url_for, json
from nose.tools import assert_equal

from splice.queries.account import insert_account, get_account
from splice.queries.common import session_scope


class TestAccountAPI(BaseTestCase):
    load_fixtures = False

    def setUp(self):
        self.account_data = {
            'name': 'John Doe Account',
            'email': 'johndoe@example.com',
            'phone': '(987) 654-3210',
        }

        super(TestAccountAPI, self).setUp()

    def test_get_accounts(self):
        """Test getting the list of accounts via API (GET)."""
        # Initially, there are no accounts. API should return an empty list.
        url = url_for('api.account.accounts')
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        assert_equal(len(json.loads(response.data)['results']), 0)

        # Create two accounts.
        with session_scope() as session:
            insert_account(session, self.account_data)
            insert_account(session, {'name': 'Another Account'})

        # Verify two accounts are returned.
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        assert_equal(len(json.loads(response.data)['results']), 2)

    def test_post_accounts(self):
        """Test creating an account via API (POST)."""
        # Create the account via API.
        url = url_for('api.account.accounts')
        data = json.dumps(self.account_data)
        response = self.client.post(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 201)
        account_id = json.loads(response.data)['result']['id']

        # Verify the right data was stored to DB.
        account = get_account(account_id)
        for field in ['name', 'email', 'phone']:
            assert_equal(account[field], self.account_data[field])

        # Posting again with same name should fail with a 400.
        response = self.client.post(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 400)

    def test_get_account_by_id(self):
        """Test getting the details of a specific account via API (GET)."""
        # Initially, there are no accounts. API should return a 404.
        account_id = 1
        url = url_for('api.account.account', account_id=account_id)
        response = self.client.get(url)
        assert_equal(response.status_code, 404)

        # Create an account.
        with session_scope() as session:
            account_id = insert_account(session, self.account_data)['id']

        # Verify the API returns it with the right data.
        url = url_for('api.account.account', account_id=account_id)
        response = self.client.get(url)
        assert_equal(response.status_code, 200)
        resp = json.loads(response.data)
        account = resp['result']
        for field in ['name', 'email', 'phone']:
            assert_equal(account[field], self.account_data[field])

    def test_put_account(self):
        """Test updating an account via API (PUT)."""
        new_account_data = {
            'name': 'New Account Name',
            'email': 'newaccount@example.com',
            'phone': '(123) 456-7890',
        }

        # A PUT to a non existent account should 404.
        url = url_for('api.account.account', account_id=1)
        data = json.dumps(new_account_data)
        response = self.client.put(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 404)

        # Create an account.
        with session_scope() as session:
            account_id = insert_account(session, self.account_data)['id']

        # Update the account with the new data.
        url = url_for('api.account.account', account_id=account_id)
        response = self.client.put(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 200)

        # Verify the data.
        account = get_account(account_id)
        for field in ['name', 'email', 'phone']:
            assert_equal(account[field], new_account_data[field])
