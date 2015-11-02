import expect from 'expect';
import { AdGroup } from 'reducers/AdGroupReducer';
import * as types from 'actions/AdGroups/AdGroupActions';
import _ from 'lodash';

describe('AdGroup ', () => {
  //Test initial state
  it('should return the initial state', () => {
    expect(
      AdGroup(undefined, {}).rows).toEqual([]);
  });

  it('should handle RECEIVE_ADGROUPS', () => {
    expect(
      AdGroup(undefined, {
        type: types.RECEIVE_ADGROUPS,
        json: {results: [{text: "Run the tests"}] }
      }).rows).toEqual(
      [{text: "Run the tests"}]
    );
  });

  it('should handle RECEIVE_ADGROUP', () => {
    expect(
      AdGroup(undefined, {
        type: types.RECEIVE_ADGROUP,
        json: { result: {text: "Run the tests"} }
      }).details).toEqual(
      {text: "Run the tests"}
    );
  });

  it('should handle RECEIVE_CREATE_ADGROUP', () => {
    //Test adding to initial state
    expect(
      AdGroup(undefined, {
        type: types.RECEIVE_CREATE_ADGROUP,
        json: {result: {text: "Run the tests"} }
      }).rows
    ).toEqual([
        {text: "Run the tests"}
      ]);

    //Test adding when state is explicitly set
    expect(
      AdGroup({
        rows: [
          {text: "Use Redux"},
          {text: "Learn to connect it to React"},
          {text: "Run the tests"}
        ]
      }, {
        type: types.RECEIVE_CREATE_ADGROUP,
        json: {result: {text: "Last test"} }
      }).rows
    ).toEqual([
        {text: "Last test"},
        {text: "Use Redux"},
        {text: "Learn to connect it to React"},
        {text: "Run the tests"}
      ]);
  });

  it('should handle RECEIVE_UPDATE_ADGROUP', () => {
    //Test Updating when state is explicitly set
    expect(
      AdGroup({
        details: {name: "test"}
      }, {
        type: types.RECEIVE_UPDATE_ADGROUP,
        json: {result: {name: "new name"} }
      }).details
    ).toEqual(
      {name: "new name"}
    );
  });
});
