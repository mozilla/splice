import React, { PropTypes, Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchAccount } from 'actions/Accounts/AccountActions';
import { fetchCampaign, fetchCampaigns } from 'actions/Campaigns/CampaignActions';
import { fetchAdGroup, fetchAdGroups } from 'actions/AdGroups/AdGroupActions';
import { fetchTile, fetchTiles } from 'actions/Tiles/TileActions';

export default class BreadCrumbs extends Component {
  componentWillMount() {
    this.getHierarchy(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if( (this.props.location.pathname.match(/\/accounts\/.*/) && nextProps.params.accountId !== this.props.params.accountId) ||
        (this.props.location.pathname.match(/\/campaigns\/.*/) && nextProps.params.campaignId !== this.props.params.campaignId) ||
        (this.props.location.pathname.match(/\/adgroups\/.*/) && nextProps.params.adGroupId !== this.props.params.adGroupId) ||
        (this.props.location.pathname.match(/\/tiles\/.*/) && nextProps.params.tileId !== this.props.params.tileId) ) {
      this.getHierarchy(this.props);
    }
  }

  getHierarchy(props){
    if(this.props.location.pathname.match(/\/accounts\/.*/) ){
      this.getAccountHierarchy(props);
    }
    else if(this.props.location.pathname.match(/\/campaigns\/.*/) ){
      this.getCampaignHierarchy(props);
    }
    else if(this.props.location.pathname.match(/\/adgroups\/.*/) ){
      this.getAdGroupHierarchy(props);
    }
    else if(this.props.location.pathname.match(/\/tiles\/.*/) ){
      this.getTileHierarchy(props);
    }
  }

  getAccountHierarchy(props){
    const { dispatch } = props;
    const accountId = parseInt(props.params.accountId, 10);

    dispatch(fetchAccount(accountId)).then(() => {
      dispatch(fetchCampaigns(this.props.Account.details.id));
    });
  }

  getCampaignHierarchy(props){
    const { dispatch } = props;
    const campaignId = parseInt(props.params.campaignId, 10);

    dispatch(fetchCampaign(campaignId)).then(() => {
      dispatch(fetchAdGroups(this.props.Campaign.details.id));
      dispatch(fetchAccount(this.props.Campaign.details.account_id));
      dispatch(fetchCampaigns(this.props.Campaign.details.account_id));
    });
  }

  getAdGroupHierarchy(props){
    const { dispatch } = props;
    const adGroupId = parseInt(props.params.adGroupId, 10);

    dispatch(fetchAdGroup(adGroupId)).then(() => {
      dispatch(fetchTiles(this.props.AdGroup.details.id));
      dispatch(fetchAdGroups(this.props.AdGroup.details.campaign_id));

      dispatch(fetchCampaign(this.props.AdGroup.details.campaign_id)).then(() => {
        dispatch(fetchAccount(this.props.Campaign.details.account_id));
        dispatch(fetchCampaigns(this.props.Campaign.details.account_id));
      });
    });
  }

  getTileHierarchy(props){
    const { dispatch } = props;
    const tileId = parseInt(props.params.tileId, 10);

    dispatch(fetchTile(tileId)).then(() => {
      dispatch(fetchTiles(this.props.Tile.details.adgroup_id));

      dispatch(fetchAdGroup(this.props.Tile.details.adgroup_id)).then(() => {
        dispatch(fetchAdGroups(this.props.AdGroup.details.campaign_id));

        dispatch(fetchCampaign(this.props.AdGroup.details.campaign_id)).then(() => {
          dispatch(fetchAccount(this.props.Campaign.details.account_id));
          dispatch(fetchCampaigns(this.props.Campaign.details.account_id));
        });
      });
    });
  }

  render() {
    if (!this.props.location.pathname.match(/\/accounts\/.*/) &&
        !this.props.location.pathname.match(/\/campaigns\/.*/) &&
        !this.props.location.pathname.match(/\/adgroups\/.*/) &&
        !this.props.location.pathname.match(/\/tiles\/.*/) ) {
      return '';
    }

    let accountActive = '';
    let campaignActive = '';
    let adGroupActive = '';
    let tileActive = '';

    let campaignCount = '';
    let adGroupCount = '';
    let tileCount = '';

    if(this.props.location.pathname.match(/\/accounts\/.*/) ){
      accountActive = 'active';
      campaignCount = '(' + this.props.Campaign.rows.length + ')';
    }
    if(this.props.location.pathname.match(/\/campaigns\/.*/) ){
      campaignActive = 'active';
      adGroupCount = '(' + this.props.AdGroup.rows.length + ')';
    }
    if(this.props.location.pathname.match(/\/adgroups\/.*/) ){
      adGroupActive = 'active';
      tileCount = '(' + this.props.Tile.rows.length + ')';
    }
    if(this.props.location.pathname.match(/\/tiles\/.*/) ){
      tileActive = 'active';
    }

    let campaignMarkup = (<li className="text-muted"><a disabled="disabled" style={{pointerEvents: 'none'}}>Campaigns {campaignCount}</a></li>);
    if(this.props.location.pathname.match(/\/campaigns\/.*/) ||
       this.props.location.pathname.match(/\/adgroups\/.*/) ||
       this.props.location.pathname.match(/\/tiles\/.*/) ){
      campaignMarkup = this.generateCrumb(this.props.Campaign, campaignActive, '/campaigns/');
    }

    let adGroupMarkup = (<li className="text-muted"><a disabled="disabled" style={{pointerEvents: 'none'}}>Ad Groups {adGroupCount}</a></li>);
    if(this.props.location.pathname.match(/\/adgroups\/.*/) ||
      this.props.location.pathname.match(/\/tiles\/.*/) ){
      adGroupMarkup = this.generateCrumb(this.props.AdGroup, adGroupActive, '/adgroups/');
    }

    let tileMarkup = (<li className="text-muted"><a disabled="disabled" style={{pointerEvents: 'none'}}>Tiles {tileCount}</a></li>);
    if(this.props.location.pathname.match(/\/tiles\/.*/) ){
      tileMarkup = this.generateCrumb(this.props.Tile, tileActive, '/tiles/');
    }

    return (
      <div className="navbar navbar-default">
        <ul className="nav navbar-nav">
          <li className={accountActive}><Link to={'/accounts/' + this.props.Account.details.id}>{this.props.Account.details.name}</Link></li>
          <li><a><i className="fa fa-angle-right"></i></a></li>
          { campaignMarkup }
          <li><a><i className="fa fa-angle-right"></i></a></li>
          { adGroupMarkup }
          <li><a><i className="fa fa-angle-right"></i></a></li>
          { tileMarkup }
        </ul>
      </div>
    );
  }

  generateCrumb(data, active, url){
    return (
      <li className={'dropdown ' + active}>
        <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{(data.details.name !== undefined) ? data.details.name : data.details.title } <span className="caret"></span></a>
        <ul className="dropdown-menu">
          <li className="active"><Link to={url + data.details.id} >{(data.details.name !== undefined) ? data.details.name : data.details.title }</Link></li>
          {data.rows.map(function(object, i){
            if(data.details.id !== object.id){
              return <li key={'bread-crumb-' + i}><Link to={url + object.id} >{(object.name !== undefined) ? object.name : object.title }</Link></li>;
            }
          })}
        </ul>
      </li>
    );
  }
}

BreadCrumbs.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Tile: state.Tile
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(BreadCrumbs);
