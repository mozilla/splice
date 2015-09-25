import { fetchAccount } from 'actions/Accounts/AccountActions';
import { fetchCampaign, fetchCampaigns } from 'actions/Campaigns/CampaignActions';
import { fetchAdGroup, fetchAdGroups } from 'actions/AdGroups/AdGroupActions';
import { fetchTile, fetchTiles } from 'actions/Tiles/TileActions';

export function fetchHierarchy(mode, props) {
  return function(parentDispatch, getState){
    const { dispatch } = props;

    if(mode === 'account') {
      const accountId = parseInt(props.params.accountId, 10);

      return dispatch(fetchAccount(accountId)).then(() => {
        dispatch(fetchCampaigns(getState().Account.details.id));
      });
    }
    else if(mode === 'campaign') {
      const campaignId = parseInt(props.params.campaignId, 10);

      return dispatch(fetchCampaign(campaignId)).then(() => {
        dispatch(fetchAdGroups(getState().Campaign.details.id));
        dispatch(fetchAccount(getState().Campaign.details.account_id));
        dispatch(fetchCampaigns(getState().Campaign.details.account_id));
      });
    }
    else if(mode === 'adGroup') {
      const adGroupId = parseInt(props.params.adGroupId, 10);

      return dispatch(fetchAdGroup(adGroupId)).then(() => {
        dispatch(fetchTiles(getState().AdGroup.details.id));
        dispatch(fetchAdGroups(getState().AdGroup.details.campaign_id));

        dispatch(fetchCampaign(getState().AdGroup.details.campaign_id)).then(() => {
          dispatch(fetchAccount(getState().Campaign.details.account_id));
          dispatch(fetchCampaigns(getState().Campaign.details.account_id));
        });
      });
    }
    else if(mode === 'tile') {
      const tileId = parseInt(props.params.tileId, 10);

      return dispatch(fetchTile(tileId)).then(() => {
        dispatch(fetchTiles(getState().Tile.details.adgroup_id));

        dispatch(fetchAdGroup(getState().Tile.details.adgroup_id)).then(() => {
          dispatch(fetchAdGroups(getState().AdGroup.details.campaign_id));

          dispatch(fetchCampaign(getState().AdGroup.details.campaign_id)).then(() => {
            dispatch(fetchAccount(getState().Campaign.details.account_id));
            dispatch(fetchCampaigns(getState().Campaign.details.account_id));
          });
        });
      });
    }
  };
}

