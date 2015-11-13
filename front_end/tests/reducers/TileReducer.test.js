import expect from 'expect';
import { Tile } from 'reducers/TileReducer';
import * as types from 'actions/Tiles/TileActions';
import _ from 'lodash';

describe('Tile ', () => {
  //Test initial state
  it('should return the initial state', () => {
    expect(
      Tile(undefined, {}).rows).toEqual([]);
  });

  it('should handle RECEIVE_TILES', () => {
    expect(
      Tile(undefined, {
        type: types.RECEIVE_TILES,
        json: {results: [{text: "Run the tests"}] }
      }).rows).toEqual(
      [{text: "Run the tests"}]
    );
  });

  it('should handle RECEIVE_TILE', () => {
    expect(
      Tile(undefined, {
        type: types.RECEIVE_TILE,
        json: { result: {text: "Run the tests"} }
      }).details).toEqual(
      {text: "Run the tests"}
    );
  });

  it('should handle RECEIVE_CREATE_TILE', () => {
    //Test adding to initial state
    expect(
      Tile(undefined, {
        type: types.RECEIVE_CREATE_TILE,
        json: {result: {text: "Run the tests"} }
      }).rows
    ).toEqual([
        {text: "Run the tests"}
      ]);

    //Test adding when state is explicitly set
    expect(
      Tile({
        rows: [
          {text: "Use Redux"},
          {text: "Learn to connect it to React"},
          {text: "Run the tests"}
        ]
      }, {
        type: types.RECEIVE_CREATE_TILE,
        json: {result: {text: "Last test"} }
      }).rows
    ).toEqual([
        {text: "Last test"},
        {text: "Use Redux"},
        {text: "Learn to connect it to React"},
        {text: "Run the tests"}
      ]);
  });

  it('should handle RECEIVE_UPDATE_TILE', () => {
    //Test Updating when state is explicitly set
    expect(
      Tile({
        details: {name: "test"}
      }, {
        type: types.RECEIVE_UPDATE_TILE,
        json: {result: {name: "new name"} }
      }).details
    ).toEqual(
      {name: "new name"}
    );
  });

  it('should handle TILE_SET_DETAILS_VAR', () => {
    expect(
      Tile({ details: { title: 'initialName' } }, {
        type: types.TILE_SET_DETAILS_VAR,
        variable: 'title',
        value: 'newName'
      }).details).toEqual({
      title: 'newName'
    });
  });
});
