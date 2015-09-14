import {
	REQUEST_ADD_ACCOUNT,
	RECEIVE_ADD_ACCOUNT,
	REQUEST_ACCOUNTS,
	RECEIVE_ACCOUNTS,
	REQUEST_ACCOUNT_VIEW,
	RECEIVE_ACCOUNT_VIEW
} from 'actions/Accounts/AccountActions';
import _ from 'lodash';

const initialState = {
	accountRows: [],
	accountDetails: [],
	isSavingAccount: false,
	isFetchingAccounts: false,
	isFetchingAccountView: false
};

export function Account(state = initialState, action = null) {
	switch (action.type) {
		case REQUEST_ADD_ACCOUNT:
			return _.assign({}, state, {
				isSavingAccount: true
			});
		case RECEIVE_ADD_ACCOUNT:
			return _.assign({}, state, {
				accountRows: [...state.accountRows, action.json],
				isSavingAccount: false
			});
		case REQUEST_ACCOUNTS:
			return _.assign({}, state, {
				isFetchingAccounts: true
			});
		case RECEIVE_ACCOUNTS:
			return _.assign({}, state, {
				accountRows: action.accountRows,
				isFetchingAccounts: false
			});
		case REQUEST_ACCOUNT_VIEW:
			return _.assign({}, state, {
				isFetchingAccountView: true
			});
		case RECEIVE_ACCOUNT_VIEW:
			return _.assign({}, state, {
				accountDetails: action.accountDetails,
				isFetchingAccountView: false
			});
		default:
			return state;
	}
}
