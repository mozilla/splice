import expect from 'expect';
import * as actions from 'actions/AdGroups/AdGroupActions';

describe('actions', () => {
  it('should request adGroups', () => {
    const expectedAction = {
      type: actions.REQUEST_ADGROUPS
    };
    expect(actions.requestAdGroups()).toEqual(expectedAction);
  });

  it('should receive adGroups', () => {
    const json = {results: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_ADGROUPS,
      json: json
    };
    expect(actions.receiveAdGroups(json)).toEqual(expectedAction);
  });

  it('should request adGroup', () => {
    const expectedAction = {
      type: actions.REQUEST_ADGROUP
    };
    expect(actions.requestAdGroup()).toEqual(expectedAction);
  });

  it('should receive adGroup', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_ADGROUP,
      json: json
    };
    expect(actions.receiveAdGroup(json)).toEqual(expectedAction);
  });

  it('should request to create adGroup', () => {
    const expectedAction = {
      type: actions.REQUEST_CREATE_ADGROUP
    };
    expect(actions.requestCreateAdGroup()).toEqual(expectedAction);
  });

  it('should receive created adGroup', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_CREATE_ADGROUP,
      json: json
    };
    expect(actions.receiveCreateAdGroup(json)).toEqual(expectedAction);
  });

  it('should request to update adGroup', () => {
    const expectedAction = {
      type: actions.REQUEST_UPDATE_ADGROUP
    };
    expect(actions.requestUpdateAdGroup()).toEqual(expectedAction);
  });

  it('should receive updated adGroup', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_UPDATE_ADGROUP,
      json: json
    };
    expect(actions.receiveUpdateAdGroup(json)).toEqual(expectedAction);
  });

  it('should set details var', () => {
    const expectedAction = {
      type: actions.ADGROUP_SET_DETAILS_VAR,
      variable: 'type',
      value: 'suggested'
    };
    expect(actions.adGroupSetDetailsVar('type', 'suggested')).toEqual(expectedAction);
  });
});