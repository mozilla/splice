import { getCampaign } from 'actions/Campaigns/CampaignActions';
import $ from 'jquery';

export function getAccountId(props) {
  let apiUrl;
  if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
    apiUrl = __DEVAPI__;
  } else {
    apiUrl = __LIVEAPI__;
  }

  let accountId = null;

  if (props.params.accountId !== undefined) {
    accountId = props.params.accountId;
  }
  else if (props.location.query.accountId !== undefined) {
    accountId = props.location.query.accountId;
  }
  else if (props.Account.details.id !== undefined) {
    accountId = props.Account.details.id;
  }
  else if (props.Campaign.details.account_id !== undefined) {
    accountId = props.Campaign.details.account_id;
  }
  else if (props.AdGroup.details.campaign_id !== undefined) {
    //Use jQuery.ajax() to do synchronous request.
    $.ajax({
      type: 'GET',
      url: apiUrl + '/api/campaign/' + props.AdGroup.details.campaign_id,
      async: false,
      success: function handleResponse(data) {
        accountId = data.result.account_id;
      }
    });
  }
  else {
    //console.log('Account ID could not be found.');
  }

  return accountId;
}