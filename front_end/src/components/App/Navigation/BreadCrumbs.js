import React, { Component } from 'react/addons';
import { Link } from 'react-router';

export default class BreadCrumbs extends Component {
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
