import expect from 'expect';
import { Campaign } from 'reducers/CampaignReducer';
import * as types from 'actions/Campaigns/CampaignActions';
import _ from 'lodash';

describe('Campaign ', () => {
  //Test initial state
  it('should return the initial state', () => {
    expect(
      Campaign(undefined, {}).rows).toEqual([]);
  });

  it('should handle RECEIVE_CAMPAIGNS', () => {
    expect(
      Campaign(undefined, {
        type: types.RECEIVE_CAMPAIGNS,
        json: {results: [{text: 'Run the tests'}] }
      }).rows).toEqual(
      [{text: 'Run the tests'}]
    );
  });

  it('should handle RECEIVE_CAMPAIGN', () => {
    expect(
      Campaign(undefined, {
        type: types.RECEIVE_CAMPAIGN,
        json: { result: {text: 'Run the tests'} }
      }).details).toEqual(
      {text: 'Run the tests'}
    );
  });

  it('should handle RECEIVE_CREATE_CAMPAIGN', () => {
    //Test adding to initial state
    expect(
      Campaign(undefined, {
        type: types.RECEIVE_CREATE_CAMPAIGN,
        json: {result: {text: 'Run the tests'} }
      }).rows
    ).toEqual([
        {text: 'Run the tests'}
      ]);

    //Test adding when state is explicitly set
    expect(
      Campaign({
        rows: [
          {text: 'Use Redux'},
          {text: 'Learn to connect it to React'},
          {text: 'Run the tests'}
        ]
      }, {
        type: types.RECEIVE_CREATE_CAMPAIGN,
        json: {result: {text: 'Last test'} }
      }).rows
    ).toEqual([
        {text: 'Last test'},
        {text: 'Use Redux'},
        {text: 'Learn to connect it to React'},
        {text: 'Run the tests'}
      ]);
  });

  it('should handle RECEIVE_UPDATE_CAMPAIGN', () => {
    //Test Updating when state is explicitly set
    expect(
      Campaign({
        details: {name: 'test'}
      }, {
        type: types.RECEIVE_UPDATE_CAMPAIGN,
        json: {result: {name: 'new name'} }
      }).details
    ).toEqual(
      {name: 'new name'}
    );
  });

  it('should handle CAMPAIGN_SET_FILTER', () => {
    expect(
      Campaign({ filters: { past: false, scheduled: false, inFlight: true } }, {
        type: types.CAMPAIGN_SET_FILTER,
        variable: 'past',
        value: true
      }).filters).toEqual({
      past: true,
      scheduled: false,
      inFlight: true
    });
  });
});
