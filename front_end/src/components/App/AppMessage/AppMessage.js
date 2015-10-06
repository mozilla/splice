import React, { Component } from 'react';
import { Link } from 'react-router';

import { shownMessage, removeMessage } from 'actions/App/AppActions';

window.$ = require('jquery');

export default class AppMessage extends Component {
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
              {this.props.message.body}
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
