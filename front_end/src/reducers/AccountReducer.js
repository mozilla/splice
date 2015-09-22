import {
	REQUEST_ADD_ACCOUNT,
	RECEIVE_ADD_ACCOUNT,
	REQUEST_ACCOUNTS,
	RECEIVE_ACCOUNTS,
	REQUEST_ACCOUNT,
	RECEIVE_ACCOUNT
} from 'actions/Accounts/AccountActions';

const initialState = {
	accountRows: [],
	accountDetails: [],
	isSavingAccount: false,
	isFetchingAccounts: false,
	isFetchingAccount: false
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
		case REQUEST_ACCOUNT:
			return _.assign({}, state, {
				isFetchingAccount: true
			});
		case RECEIVE_ACCOUNT:
			return _.assign({}, state, {
				accountDetails: action.accountDetails,
				isFetchingAccount: false
			});
		default:
			return state;
	}
}
