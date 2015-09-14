import expect from 'expect';
import { List, Map } from 'immutable';
import { Account } from 'reducers/AccountReducer';
import * as types from 'actions/Accounts/AccountActions';

describe('Account ', () => {
	//Test initial state	
	it('should return the initial state', () => {
		expect(
			Account(undefined, {}).accountRows).toEqual([]);
		});

	it('should handle ADD_ACCOUNT', () => {
		//Test adding to initial state 
		expect(
			Account(undefined, {
				type: types.RECEIVE_ADD_ACCOUNT,
				json: {text: "Run the tests" }
			}).accountRows
		).toEqual([				
			{ text: "Run the tests" }
		]);

		//Test adding when state is explicitly set
		expect(
			Account({
				accountRows: [
					{ text: "Use Redux" },
					{ text: "Learn to connect it to React" },
					{ text: "Run the tests" }
				]
			}, {
				type: types.RECEIVE_ADD_ACCOUNT,
				json: { text: "Last test" }
			}).accountRows
		).toEqual([
			{ text: "Use Redux" },
			{ text: "Learn to connect it to React" },
			{ text: "Run the tests" },
			{ text: "Last test" },
		]);
	});
});
