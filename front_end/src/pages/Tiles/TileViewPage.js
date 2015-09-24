import React, { Component } from 'react/addons';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';

import { fetchAccount } from 'actions/Accounts/AccountActions';
import { fetchCampaign, fetchCampaigns } from 'actions/Campaigns/CampaignActions';
import { fetchAdGroup, fetchAdGroups } from 'actions/AdGroups/AdGroupActions';
import { fetchTile, fetchTiles } from 'actions/Tiles/TileActions';

import TileDetails from 'components/Tiles/TileDetails/TileDetails';

export default class TileViewPage extends Component {
  componentWillMount() {
    this.fetchTileDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.tileId !== this.props.params.tileId) {
      this.fetchTileDetails(nextProps);
    }
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <h1>Tile</h1>
            <TileDetails Tile={this.props.Tile}/>
          </div>
        </div>
      </div>
    );
  }

  fetchTileDetails(props) {
    const { dispatch } = props;
    const data = props.Tile.details;
    const tileId = parseInt(props.params.tileId, 10);

    updateDocTitle('Tile View');

    dispatch(fetchTile(tileId)).then(() => {
      pageVisit('Tile - ' + this.props.Tile.details.title, this);
    }).then(() => {
      dispatch(fetchTiles(this.props.Tile.details.adgroup_id));

      dispatch(fetchAdGroup(this.props.Tile.details.adgroup_id)).then(() => {
        dispatch(fetchAdGroups(this.props.AdGroup.details.campaign_id));
      }).then(() => {
        dispatch(fetchAdGroups(this.props.AdGroup.details.campaign_id));

        dispatch(fetchCampaign(this.props.AdGroup.details.campaign_id)).then(() => {
          dispatch(fetchAccount(this.props.Campaign.details.account_id));
          dispatch(fetchCampaigns(this.props.Campaign.details.account_id));
        });
      });
    });
  }
}

TileViewPage.propTypes = {};

function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Tile: state.Tile
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(TileViewPage);
