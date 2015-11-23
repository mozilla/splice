import React, { Component } from 'react';
import { Link } from 'react-router';

import './Timeline.scss';

window.$ = require('jquery');
window.jQuery = $;

export default class Timeline extends Component {
  getCancelLink(){
    let output;

    if(this.props.location.pathname.match(/\/accounts\/create/) ||
      this.props.location.pathname.match(/\/campaigns\/create/) ||
      this.props.location.pathname.match(/\/adgroups\/create/) ||
      this.props.location.pathname.match(/\/tiles\/create/) )
    {
      output = '/';
      if(this.props.App.locationLog[1] !== undefined){
        output = this.props.App.locationLog[1];
      }
    }
    else if(this.props.location.pathname.match(/\/accounts\/[0-9]{1,10}\/edit/) ||
      this.props.location.pathname.match(/\/accounts\/[0-9]{1,10}\/createcampaign/) ) {
      output = '/accounts/' + this.props.params.accountId;
    }
    else if(this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/edit/) ||
      this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/createadgroup/) ||
      this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/bulkupload/) ){
      output = '/campaigns/' + this.props.params.campaignId;
    }
    else if(this.props.location.pathname.match(/\/adgroups\/[0-9]{1,10}\/edit/) ||
      this.props.location.pathname.match(/\/adgroups\/[0-9]{1,10}\/createtile/) ){
      output = '/adgroups/' + this.props.params.adGroupId;
    }
    else if(this.props.location.pathname.match(/\/tiles\/[0-9]{1,10}\/edit/) ){
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
            this.props.location.pathname.match(/\/accounts\/[0-9]{1,10}\/edit/) );
  }

  isCampaign(){
    return (this.props.location.pathname.match(/\/accounts\/[0-9]{1,10}\/createcampaign/) ||
            this.props.location.pathname.match(/\/campaigns\/create/) ||
            this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/edit/) ||
            this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/bulkupload/));
  }

  isAdGroup(){
    return (this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/createadgroup/) ||
            this.props.location.pathname.match(/\/adgroups\/create/) ||
            this.props.location.pathname.match(/\/adgroups\/[0-9]{1,10}\/edit/) );
  }

  isTile(){
    return (this.props.location.pathname.match(/\/adgroups\/[0-9]{1,10}\/createtile/) ||
            this.props.location.pathname.match(/\/tiles\/create/) ||
            this.props.location.pathname.match(/\/tiles\/[0-9]{1,10}\/edit/) );
  }
}
