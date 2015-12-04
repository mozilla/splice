import expect from 'expect';
import { App } from 'reducers/AppReducer';
import * as types from 'actions/App/AppActions';
import { GET_RECENTLY_VIEWED } from 'actions/App/RecentlyViewedActions';
import _ from 'lodash';

describe('App ', () => {
  it('should handle DISPLAY_MESSAGE', () => {
    expect(
      App(undefined, {
        type: types.DISPLAY_MESSAGE,
        messageType: 'success',
        messageBody: 'success!'
      }).message).toEqual({
        type: 'success',
        body: 'success!',
        display: true,
        shown: false
    });
  });

  it('should handle SHOWN_MESSAGE', () => {
    expect(
      App({ message: {display: true, type: 'success', body: 'success!', shown: true}}, {
        type: types.SHOWN_MESSAGE
      }).message).toEqual({
      type: 'success',
      body: 'success!',
      display: true,
      shown: true
    });
  });

  it('should handle REMOVE_MESSAGE', () => {
    expect(
      App({ message: {display: true, type: 'success', body: 'success!', shown: true}}, {
        type: types.REMOVE_MESSAGE
      }).message).toEqual({
      type: '',
      body: '',
      display: false,
      shown: false
    });
  });

  it('should handle GET_RECENTLY_VIEWED', () => {
    expect(
      App(undefined, {
        type: GET_RECENTLY_VIEWED,
        recentlyViewed: [{name: 'test'}, {name: 'test2'}]
      }).recentlyViewed).toEqual(
      [{name: 'test'}, {name: 'test2'}]
    );
  });

  it('should handle SET_LIST_TYPE', () => {
    expect(
      App(undefined, {
        type: types.SET_LIST_TYPE,
        value: 'campaigns'
      }).listType).toEqual('campaigns');
  });

  it('should handle SET_LIST_DATE_RANGE', () => {
    expect(
      App(undefined, {
        type: types.SET_LIST_DATE_RANGE,
        value: {start: '2015-12-03', end: '2015-12-24'}
      }).listDateRange).toEqual({start: '2015-12-03', end: '2015-12-24'});
  });

  it('should handle FORM_CHANGED', () => {
    expect(
      App(undefined, {
        type: types.FORM_CHANGED
      }).formChanged).toEqual(true);
  });

  it('should handle FORM_SAVED', () => {
    expect(
      App(undefined, {
        type: types.FORM_SAVED
      }).formChanged).toEqual(false);
  });
});
