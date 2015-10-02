import React, { Component } from 'react';
import { Link } from 'react-router';

import { shownMessage } from 'actions/App/AppActions';

export default class AppMessage extends Component {
  render() {
    const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    let message;
    if(this.props.message.display){
      let className;
      switch(this.props.message.type){
        case 'success':
          className = 'bg-success text-success';
          break;
        case 'error':
          className = 'bg-danger text-danger';
          break;
        default:
          className = 'bg-warning text-warning';
          break;
      }

      message = (
        <div className={'panel panel-default'}>
          <div className={'panel-body ' + className}>
            {this.props.message.body}
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
}
