import React, { Component } from 'react';
import { Link } from 'react-router';

import './BreadCrumb.scss';

export default class BreadCrumbs extends Component {
  getName(data, isTile){
    let name;

    if(isTile){
      if(data.title !== undefined) {
        if (data.title.trim() === '') {
          name = '(No Title)';
        }
        else {
          name = data.title;
        }
      }
    }
    else {
      if(data.name !== undefined){
        if(data.name.trim() === ''){
          name = '(No Name)';
        }
        else{
          name = data.name;
        }
      }
    }
    return name;
  }

  render() {
    let campaignParent = '';
    let adGroupParent = '';

    let campaignActive = '';
    let adGroupActive = '';
    let tileActive = '';

    let campaignCount = '';
    let adGroupCount = '';
    let tileCount = '';

    if(this.props.location.pathname.match(/\/accounts\/.*/) ){
      campaignCount = '(' + this.props.Campaign.rows.length + ')';
    }
    if(this.props.location.pathname.match(/\/campaigns\/.*/) ){
      campaignActive = 'active';
      adGroupCount = '(' + this.props.AdGroup.rows.length + ')';
    }
    if(this.props.location.pathname.match(/\/adgroups\/.*/) ){
      campaignParent = 'parent';
      adGroupActive = 'active';
      tileCount = '(' + this.props.Tile.rows.length + ')';
    }
    if(this.props.location.pathname.match(/\/tiles\/.*/) ){
      campaignParent = 'parent';
      adGroupParent = 'parent';
      tileActive = 'active';
    }

    let campaignMarkup = (<li className="branch top-level"><a className="dropdown-toggle" disabled="disabled" style={{pointerEvents: 'none'}}>Campaigns {campaignCount}</a></li>);
    if(this.props.location.pathname.match(/\/campaigns\/.*/) ||
       this.props.location.pathname.match(/\/adgroups\/.*/) ||
       this.props.location.pathname.match(/\/tiles\/.*/) ){
      campaignMarkup = this.generateCrumb(this.props.Campaign, campaignActive, campaignParent, '/campaigns/', true);
    }

    let adGroupMarkup = (<li className="line top-level"><a className="dropdown-toggle" disabled="disabled" style={{pointerEvents: 'none'}}>Ad Groups {adGroupCount}</a></li>);
    if(this.props.location.pathname.match(/\/adgroups\/.*/) ||
      this.props.location.pathname.match(/\/tiles\/.*/) ){
      adGroupMarkup = this.generateCrumb(this.props.AdGroup, adGroupActive, adGroupParent, '/adgroups/', false);
    }

    let tileMarkup = (<li className="line top-level"><a className="dropdown-toggle" disabled="disabled" style={{pointerEvents: 'none'}}>Tiles {tileCount}</a></li>);
    if(this.props.location.pathname.match(/\/tiles\/.*/) ){
      tileMarkup = this.generateCrumb(this.props.Tile, tileActive, false, '/tiles/', false, true);
    }

    return (
      <div className="breadcrumbs-container">
        <div className="navbar navbar-default breadcrumbs">
          <ul className="nav navbar-nav">
            { campaignMarkup }
            { adGroupMarkup }
            { tileMarkup }
          </ul>
        </div>
      </div>
    );
  }

  generateCrumb(data, active, parent, url, branch, isTile = false){
    const context = this;
    let output;

    if(data.details){
      output = (
        <li className={'dropdown top-level ' + parent + ' ' + active + ' ' + ((branch) ? 'branch' : 'line')}>
          <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{this.getName(data.details, isTile)} <span className="down-arrow"></span></a>
          <ul className="dropdown-menu">
            <li className="active"><Link to={url + data.details.id} >{this.getName(data.details, isTile)}</Link></li>
            {data.rows.map(function(object, i){
              if(data.details.id !== object.id){
                return <li key={'bread-crumb-' + i}><Link to={url + object.id} >{context.getName(object, isTile)}</Link></li>;
              }
            })}
          </ul>
        </li>
      );
    }
    return output;
  }
}
