import expect from 'expect';
import { List, Map } from 'immutable';
import { Account } from 'reducers/AccountReducer';
import * as types from 'actions/Accounts/AccountActions';
import _ from 'lodash';

describe('Account ', () => {
  //Test initial state
  it('should return the initial state', () => {
    expect(
      Account(undefined, {}).rows).toEqual([]);
  });

  it('should receive the accounts', () => {
    expect(
      Account(undefined, {
        type: types.RECEIVE_ACCOUNTS,
        rows: [{text: "Run the tests"}]
      }).rows).toEqual(
      [{text: "Run the tests"}]
    );
  });

  it('should receive the account', () => {
    expect(
      Account(undefined, {
        type: types.RECEIVE_ACCOUNT,
        details: {text: "Run the tests"}
      }).details).toEqual(
      {text: "Run the tests"}
    );
  });

  it('should handle RECEIVE_CREATE_ACCOUNT', () => {
    //Test adding to initial state
    expect(
      Account(undefined, {
        type: types.RECEIVE_CREATE_ACCOUNT,
        json: {text: "Run the tests"}
      }).rows
    ).toEqual([
        {text: "Run the tests"}
      ]);

    //Test adding when state is explicitly set
    expect(
      Account({
        rows: [
          {text: "Use Redux"},
          {text: "Learn to connect it to React"},
          {text: "Run the tests"}
        ]
      }, {
        type: types.RECEIVE_CREATE_ACCOUNT,
        json: {text: "Last test"}
      }).rows
    ).toEqual([
        {text: "Use Redux"},
        {text: "Learn to connect it to React"},
        {text: "Run the tests"},
        {text: "Last test"},
      ]);
  });
});
