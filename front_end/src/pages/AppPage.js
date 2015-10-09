import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { shownMessage, removeMessage } from 'actions/App/AppActions';
import { fetchInit } from 'actions/Init/InitActions';
import { fetchAccounts } from 'actions/Accounts/AccountActions';

import TopBar from 'components/App/Navigation/TopBar.js';

import AppMessage from 'components/App/AppMessage/AppMessage.js';

export default class AppPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    if (this.props.Account.rows.length === 0) {
      dispatch(fetchAccounts());
    }

    if(_.isEmpty(this.props.Init.channels) ){
      dispatch(fetchInit());
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;

    //Handle global messaging
    if(this.props.location.pathname !== nextProps.location.pathname){
      if(this.props.App.message.shown === true){
        dispatch(removeMessage());
      }
      else if(this.props.App.message.display === true &&
              this.props.App.message.shown === false){
        dispatch(shownMessage());
      }
    }
  }

  render() {
    const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
    const key = this.props.location.pathname;

    return (
      <div className="app-container">
        <TopBar {...this.props} />

        <div className="container-fluid content-container">
          <div className="row">
            <div className="col-xs-12">
              <AppMessage message={this.props.App.message} dispatch={this.props.dispatch}/>
              <ReactCSSTransitionGroup transitionName="page-transition" transitionAppearTimeout={300} transitionEnterTimeout={300} transitionLeave={false} transitionLeaveTimeout={300}>
                {React.cloneElement(this.props.children || <div />, {key: key})}
              </ReactCSSTransitionGroup>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AppPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return state;
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AppPage);
