import expect from 'expect';
import * as actions from 'actions/Campaigns/CampaignActions';

describe('actions', () => {
  it('should request campaigns', () => {
    const expectedAction = {
      type: actions.REQUEST_CAMPAIGNS
    };
    expect(actions.requestCampaigns()).toEqual(expectedAction);
  });

  it('should receive campaigns', () => {
    const json = {results: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_CAMPAIGNS,
      json: json
    };
    expect(actions.receiveCampaigns(json)).toEqual(expectedAction);
  });

  it('should request campaign', () => {
    const expectedAction = {
      type: actions.REQUEST_CAMPAIGN
    };
    expect(actions.requestCampaign()).toEqual(expectedAction);
  });

  it('should receive campaign', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_CAMPAIGN,
      json: json
    };
    expect(actions.receiveCampaign(json)).toEqual(expectedAction);
  });

  it('should request to create campaign', () => {
    const expectedAction = {
      type: actions.REQUEST_CREATE_CAMPAIGN
    };
    expect(actions.requestCreateCampaign()).toEqual(expectedAction);
  });

  it('should receive created campaign', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_CREATE_CAMPAIGN,
      json: json
    };
    expect(actions.receiveCreateCampaign(json)).toEqual(expectedAction);
  });

  it('should request to update campaign', () => {
    const expectedAction = {
      type: actions.REQUEST_UPDATE_CAMPAIGN
    };
    expect(actions.requestUpdateCampaign()).toEqual(expectedAction);
  });

  it('should receive updated campaign', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_UPDATE_CAMPAIGN,
      json: json
    };
    expect(actions.receiveUpdateCampaign(json)).toEqual(expectedAction);
  });

  it('should request bulk upload', () => {
    const expectedAction = {
      type: actions.REQUEST_BULK_UPLOAD
    };
    expect(actions.requestBulkUpload()).toEqual(expectedAction);
  });

  it('should receive bulk upload', () => {
    const json = {result: [{test: 'test'}]};
    const expectedAction = {
      type: actions.RECEIVE_BULK_UPLOAD,
      json: json
    };
    expect(actions.receiveBulkUpload(json)).toEqual(expectedAction);
  });

  it('should set filter', () => {
    const expectedAction = {
      type: actions.CAMPAIGN_SET_FILTER,
      variable: 'past',
      value: true
    };
    expect(actions.campaignSetFilter('past', true)).toEqual(expectedAction);
  });
});