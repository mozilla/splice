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
            'name': 'JDA',
            'contact_name': 'John Doe Account',
            'contact_email': 'johndoe@example.com',
            'contact_phone': '(987) 654-3210',
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
        for field in ['name', 'contact_name', 'contact_email', 'contact_phone']:
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
        del account['id']
        del account['created_at']
        assert_equal(account, self.account_data)

    def test_put_account(self):
        """Test updating an account via API (PUT)."""
        new_account_data = {
            'name': 'New Account Name',
            'contact_name': 'New Contact Name',
            'contact_email': 'newaccount@example.com',
            'contact_phone': '(123) 456-7890',
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
        del account['id']
        del account['created_at']
        assert_equal(account, new_account_data)

    def test_put_without_optional_fields(self):
        """Test PUTing just the required fields."""
        new_account_data = {
            'name': 'New Account Name',
        }

        # Create an account.
        with session_scope() as session:
            account_id = insert_account(session, self.account_data)['id']

        # Update the account with the new data.
        url = url_for('api.account.account', account_id=account_id)
        data = json.dumps(new_account_data)
        response = self.client.put(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 200)

        # Verify the data. Make sure the fields not sent don't get updated (nulled).
        account = get_account(account_id)
        assert_equal(account['name'], new_account_data['name'])
        assert_equal(account['contact_name'], self.account_data['contact_name'])
        assert_equal(account['contact_email'], self.account_data['contact_email'])
        assert_equal(account['contact_phone'], self.account_data['contact_phone'])

    def test_put_account_only_phone(self):
        """Test updating the phone number of an account."""
        new_account_data = {
            'contact_phone': '123456789',
        }

        # Create an account.
        with session_scope() as session:
            account_id = insert_account(session, self.account_data)['id']

        # Update the account with the new data.
        url = url_for('api.account.account', account_id=account_id)
        data = json.dumps(new_account_data)
        response = self.client.put(url, data=data, content_type='application/json')
        assert_equal(response.status_code, 200)

        # Verify the data. Make sure the fields not sent don't get updated (nulled).
        account = get_account(account_id)
        assert_equal(account['name'], self.account_data['name'])
        assert_equal(account['contact_name'], self.account_data['contact_name'])
        assert_equal(account['contact_email'], self.account_data['contact_email'])
        assert_equal(account['contact_phone'], new_account_data['contact_phone'])
