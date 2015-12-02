import expect from 'expect';
import { Account } from 'reducers/AccountReducer';
import * as types from 'actions/Accounts/AccountActions';
import _ from 'lodash';

describe('Account ', () => {
  //Test initial state
  it('should return the initial state', () => {
    expect(
      Account(undefined, {}).rows).toEqual([]);
  });

  it('should handle RECEIVE_ACCOUNTS', () => {
    expect(
      Account(undefined, {
        type: types.RECEIVE_ACCOUNTS,
        json: {results: [{text: 'Run the tests'}] }
      }).rows).toEqual(
      [{text: 'Run the tests'}]
    );
  });

  it('should handle RECEIVE_ACCOUNT', () => {
    expect(
      Account(undefined, {
        type: types.RECEIVE_ACCOUNT,
        json: { result: {text: 'Run the tests'} }
      }).details).toEqual(
      {text: 'Run the tests'}
    );
  });

  it('should handle RECEIVE_CREATE_ACCOUNT', () => {
    //Test adding to initial state
    expect(
      Account(undefined, {
        type: types.RECEIVE_CREATE_ACCOUNT,
        json: {result: {text: 'Run the tests'} }
      }).rows
    ).toEqual([
        {text: 'Run the tests'}
      ]);

    //Test adding when state is explicitly set
    expect(
      Account({
        rows: [
          {text: 'Use Redux'},
          {text: 'Learn to connect it to React'},
          {text: 'Run the tests'}
        ]
      }, {
        type: types.RECEIVE_CREATE_ACCOUNT,
        json: {result: {text: 'Last test'} }
      }).rows
    ).toEqual([
        {text: 'Last test'},
        {text: 'Use Redux'},
        {text: 'Learn to connect it to React'},
        {text: 'Run the tests'}
      ]);
  });

  it('should handle RECEIVE_UPDATE_ACCOUNT', () => {
    //Test Updating when state is explicitly set
    expect(
      Account({
        details: {name: 'test'}
      }, {
        type: types.RECEIVE_UPDATE_ACCOUNT,
        json: {result: {name: 'new name'} }
      }).details
    ).toEqual(
      {name: 'new name'}
    );
  });

  it('should handle RECEIVE_ACCOUNT_STATS', () => {
    //Test Updating when state is explicitly set
    expect(
      Account(undefined, {
        type: types.RECEIVE_ACCOUNT_STATS,
        json: {results: [{clicked: 1}] }
      }).stats
    ).toEqual(
      [{clicked: 1}]
    );
  });
});
