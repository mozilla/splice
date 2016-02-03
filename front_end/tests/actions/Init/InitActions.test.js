import expect from 'expect';
import * as actions from 'actions/Init/InitActions';

describe('actions', () => {
  it('should request init', () => {
    const expectedAction = {
      type: actions.REQUEST_INIT
    };
    expect(actions.requestInit()).toEqual(expectedAction);
  });

  it('should receive init', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_INIT,
      json: json
    };
    expect(actions.receiveInit(json)).toEqual(expectedAction);
  });

  it('should get channel by id', () => {
    const rows = [{id: 1, name: 'test'}, {id: 2, name: 'channel'}, {id: 3, name: 'last'}];
    expect(actions.getChannel(2, rows)).toEqual({id: 2, name: 'channel'});
  });

  it('should get country by country_code', () => {
    const rows = [{country_code: 'US', country_name: 'United States'}, {country_code: 'STAR', country_name: 'All Countries'}, {country_code: 'CA', country_name: 'Canada'}];
    expect(actions.getCountry('STAR', rows)).toEqual({country_code: 'STAR', country_name: 'All Countries'});
  });
});