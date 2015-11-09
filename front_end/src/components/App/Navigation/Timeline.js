import React, { Component } from 'react';
import { Link } from 'react-router';

import './Timeline.scss';

window.$ = require('jquery');
window.jQuery = $;

export default class Timeline extends Component {
  getCancelLink(){
    let output;

    if(this.props.location.pathname.match(/\/accounts\/create/)){
      output = '/';
    }
    else if(this.props.location.pathname.match(/\/accounts\/\d\/edit/) ||
      this.props.location.pathname.match(/\/accounts\/\d\/createcampaign/) ) {
      output = '/accounts/' + this.props.params.accountId;
    }
    else if(this.props.location.pathname.match(/\/campaigns\/\d\/edit/) ||
      this.props.location.pathname.match(/\/campaigns\/\d\/createadgroup/) ||
      this.props.location.pathname.match(/\/campaigns\/\d\/bulkupload/) ){
      output = '/campaigns/' + this.props.params.campaignId;
    }
    else if(this.props.location.pathname.match(/\/adgroups\/\d\/edit/) ||
      this.props.location.pathname.match(/\/adgroups\/\d\/createtile/) ){
      output = '/adgroups/' + this.props.params.adGroupId;
    }
    else if(this.props.location.pathname.match(/\/tiles\/\d\/edit/) ){
      output = '/tiles/' + this.props.params.tileId;
    }

    return output;
  }

  getTimeline(){
    let output;
    let accountActive;
    let campaignActive;
    let adGroupActive;
    let tileActive;

    if(this.isAccount()){
      accountActive = 'active';
    }
    if(this.isCampaign()){
      accountActive = 'active';
      campaignActive = 'active';
    }
    if(this.isAdGroup()){
      accountActive = 'active';
      campaignActive = 'active';
      adGroupActive = 'active';
    }
    if(this.isTile()){
      accountActive = 'active';
      campaignActive = 'active';
      adGroupActive = 'active';
      tileActive = 'active';
    }

    output = (
      <ul>
        <li className={'timeline-dot ' + accountActive}>Account</li>
        <li className={'timeline-line ' + campaignActive}>Campaign</li>
        <li className={'timeline-line ' + adGroupActive}>Ad Group</li>
        <li className={'timeline-line ' + tileActive}>Tile</li>
      </ul>
    );

    return output;
  }

  render() {
    return (
      <div className="timeline-container">
        <div className="timeline-link save" onClick={(e) => this.handleSave(e)}>Save</div>
        <Link className="timeline-link cancel" to={this.getCancelLink()}>Cancel</Link>
        <div className="timeline">
          {this.getTimeline()}
        </div>
      </div>
    );
  }

  handleSave(e){
    if(this.isAccount()){
      $('#AccountForm .form-submit').click();
    }
    if(this.isCampaign()){
      $('#CampaignForm .form-submit').click();
    }
    if(this.isAdGroup()){
      $('#AdGroupForm .form-submit').click();
    }
    if(this.isTile()){
      $('#TileForm .form-submit').click();
    }
  }

  isAccount(){
    return (this.props.location.pathname.match(/\/accounts\/create/) ||
            this.props.location.pathname.match(/\/accounts\/\d\/edit/) );
  }

  isCampaign(){
    return (this.props.location.pathname.match(/\/accounts\/\d\/createcampaign/) ||
            this.props.location.pathname.match(/\/campaigns\/\d\/edit/) ||
            this.props.location.pathname.match(/\/campaigns\/\d\/bulkupload/));
  }

  isAdGroup(){
    return (this.props.location.pathname.match(/\/campaigns\/\d\/createadgroup/) ||
    this.props.location.pathname.match(/\/adgroups\/\d\/edit/) );
  }

  isTile(){
    return (this.props.location.pathname.match(/\/adgroups\/\d\/createtile/) ||
    this.props.location.pathname.match(/\/tiles\/\d\/edit/) );
  }
}
