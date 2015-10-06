import React, { Component } from 'react';
import { Link } from 'react-router';

import { shownMessage, removeMessage } from 'actions/App/AppActions';

import _ from 'lodash';

window.$ = require('jquery');

export default class AppMessage extends Component {
  getBodyMessage(){
    let body;
    if(this.props.message.type === 'error'){
      //Handle Errors that are passed as objects;
      if(_.isObject(this.props.message.body)){
        if(_.values(this.props.message.body).length > 1){
          body = [];
          _.forOwn(this.props.message.body, function(value, key){
            body.push(<li>{'Error in ' + _.capitalize(key) + ': ' + value}</li>);
          });
        }
        else{
          _.forOwn(this.props.message.body, function(value, key) {
            body = 'Error in ' + _.capitalize(key) + ': ' + value;
          });
        }
      }
      else{
        body = 'Error: ' + this.props.message.body;
      }
    }
    else{
      body = this.props.message.body;
    }
    return body;
  }

  render() {
    const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    let message;
    if(this.props.message.display){
      let bgClass;
      let textClass;
      switch(this.props.message.type){
        case 'success':
          bgClass = 'bg-success';
          textClass = 'text-success';
          break;
        case 'error':
          bgClass = 'bg-danger';
          textClass = 'text-danger';
          break;
        default:
          bgClass = 'bg-warning';
          textClass = 'text-warning';
          break;
      }

      message = (
        <div className={'panel panel-default'}>
          <div className={'panel-body ' + bgClass + ' ' + textClass}>
            <div className="col-xs-11">
              {this.getBodyMessage()}
            </div>
            <div className="col-xs-1 text-right">
              <a href="#" onClick={e => this.handleCloseClick(e)} className={textClass}><i className="fa fa-close"></i></a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionLeave={false}>
        {message}
      </ReactCSSTransitionGroup>
    );
  }

  handleCloseClick(e){
    e.preventDefault();
    this.props.dispatch(removeMessage());
  }
}
