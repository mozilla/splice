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
      json: json
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
      json: json
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
      json: json
    };
    expect(actions.receiveCreateAccount(json)).toEqual(expectedAction);
  });

  it('should request to update account', () => {
    const expectedAction = {
      type: actions.REQUEST_UPDATE_ACCOUNT
    };
    expect(actions.requestUpdateAccount()).toEqual(expectedAction);
  });

  it('should receive updated account', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_UPDATE_ACCOUNT,
      json: json
    };
    expect(actions.receiveUpdateAccount(json)).toEqual(expectedAction);
  });

  it('should request to account stats', () => {
    const expectedAction = {
      type: actions.REQUEST_ACCOUNT_STATS
    };
    expect(actions.requestAccountStats()).toEqual(expectedAction);
  });

  it('should receive account stats', () => {
    const json = {result: [{clicked: 1}]};
    const expectedAction = {
      type: actions.RECEIVE_ACCOUNT_STATS,
      json: json
    };
    expect(actions.receiveAccountStats(json)).toEqual(expectedAction);
  });
});