import expect from 'expect';
import * as actions from 'actions/Accounts/AccountActions';

describe('actions', () => {
  it('should request accounts', () => {
    const expectedAction = {
      type: actions.REQUEST_ACCOUNTS
    };
    expect(actions.requestAccounts()).toEqual(expectedAction);
  });

  it('should receive accounts', () => {
    const json = {results: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_ACCOUNTS,
      rows: json.results
    };
    expect(actions.receiveAccounts(json)).toEqual(expectedAction);
  });

  it('should request account', () => {
    const expectedAction = {
      type: actions.REQUEST_ACCOUNT
    };
    expect(actions.requestAccount()).toEqual(expectedAction);
  });

  it('should receive account', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_ACCOUNT,
      details: json.result
    };
    expect(actions.receiveAccount(json)).toEqual(expectedAction);
  });

  it('should request to create account', () => {
    const expectedAction = {
      type: actions.REQUEST_CREATE_ACCOUNT
    };
    expect(actions.requestCreateAccount()).toEqual(expectedAction);
  });

  it('should receive created account', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_CREATE_ACCOUNT,
      json: json.result
    };
    expect(actions.receiveCreateAccount(json)).toEqual(expectedAction);
  });
});