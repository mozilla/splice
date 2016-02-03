import expect from 'expect';
import { Init } from 'reducers/InitReducer';
import * as types from 'actions/Init/InitActions';
import _ from 'lodash';

describe('Init ', () => {
  //Test initial state
  it('should return the initial state', () => {
    expect(Init(undefined, {}).categories).toEqual([]);
    expect(Init(undefined, {}).channels).toEqual([]);
    expect(Init(undefined, {}).countries).toEqual([]);
    expect(Init(undefined, {}).locales).toEqual([]);
  });

  it('should handle RECEIVE_INIT', () => {
    const json = { result:
      {
        categories: [
          'Animals_General',
          'Automotive_General',
          'Automotive_In-Market'
        ],
        channels: [
          {id: 1, name: 'desktop'},
          {id: 2, name: 'android'},
          {id: 3, name: 'desktop-prerelease'}
        ],
        countries: [
          {country_code: 'US', country_name: 'United States'},
          {country_code: 'STAR', country_name: 'All Countries'},
          {country_code: 'CA', country_name: 'Canada'}
        ],
        locales: [
          'en-US',
          'en-GB',
          'es-MX'
        ]
      }
    };

    expect(
      Init(undefined, {
        type: types.RECEIVE_INIT,
        json: json
      }).categories).toEqual(
      ['Animals_General', 'Automotive_General', 'Automotive_In-Market']
    );

    expect(
      Init(undefined, {
        type: types.RECEIVE_INIT,
        json: json
      }).channels).toEqual(
      [{id: 1, name: 'desktop'}, {id: 2, name: 'android'}, {id: 3, name: 'desktop-prerelease'}]
    );

    expect(
      Init(undefined, {
        type: types.RECEIVE_INIT,
        json: json
      }).countries).toEqual(
      [{country_code: 'US', country_name: 'United States'}, {country_code: 'STAR', country_name: 'All Countries'}, {country_code: 'CA', country_name: 'Canada'}]
    );

    expect(
      Init(undefined, {
        type: types.RECEIVE_INIT,
        json: json
      }).locales).toEqual(
      ['en-US', 'en-GB', 'es-MX']
    );
  });
});
