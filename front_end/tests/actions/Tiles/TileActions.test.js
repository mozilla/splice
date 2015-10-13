import expect from 'expect';
import * as actions from 'actions/Tiles/TileActions';

describe('actions', () => {
  it('should request tiles', () => {
    const expectedAction = {
      type: actions.REQUEST_TILES
    };
    expect(actions.requestTiles()).toEqual(expectedAction);
  });

  it('should receive tiles', () => {
    const json = {results: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_TILES,
      json: json
    };
    expect(actions.receiveTiles(json)).toEqual(expectedAction);
  });

  it('should request tile', () => {
    const expectedAction = {
      type: actions.REQUEST_TILE
    };
    expect(actions.requestTile()).toEqual(expectedAction);
  });

  it('should receive tile', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_TILE,
      json: json
    };
    expect(actions.receiveTile(json)).toEqual(expectedAction);
  });

  it('should request to create tile', () => {
    const expectedAction = {
      type: actions.REQUEST_CREATE_TILE
    };
    expect(actions.requestCreateTile()).toEqual(expectedAction);
  });

  it('should receive created tile', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_CREATE_TILE,
      json: json
    };
    expect(actions.receiveCreateTile(json)).toEqual(expectedAction);
  });

  it('should request to update tile', () => {
    const expectedAction = {
      type: actions.REQUEST_UPDATE_TILE
    };
    expect(actions.requestUpdateTile()).toEqual(expectedAction);
  });

  it('should receive updated tile', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_UPDATE_TILE,
      json: json
    };
    expect(actions.receiveUpdateTile(json)).toEqual(expectedAction);
  });
});