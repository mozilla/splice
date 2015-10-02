import React, { Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createAccount, fetchAccounts } from 'actions/Accounts/AccountActions';

import AccountForm from 'components/Accounts/AccountForm/AccountForm';

import $ from 'jquery';
window.$ = $;
require('jquery-serializejson');

export default class AccountCreatePage extends Component {
  render() {
    return (
      <div>
        <h1>Create Account</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <AccountForm isSaving={this.props.Account.isSaving} handleFormSubmit={(id) => this.handleFormSubmit(id)} data={{}} editMode={false} />
          </div>
        </div>
      </div>
    );
  }

  handleFormSubmit(id){
    const { dispatch } = this.props;
    const props = this.props;
    const context = this;

    const data = JSON.stringify($(id).serializeJSON());

    dispatch(createAccount(data))
      .then(function(response){
        if(response.result === undefined){
          if(_.isString(response.message)){
            dispatch(displayMessage('error', 'Error: ' + response.message) );
          }
          else{
            dispatch(displayMessage('error', 'Error: Validation Errors') );
          }
          dispatch(shownMessage());
        }
        else{
          dispatch(fetchAccounts());
          dispatch(displayMessage('success', 'Account Created Successfully') );
          props.history.pushState(null, '/accounts/' + response.id);
        }
      }
    );
  }
}

AccountCreatePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AccountCreatePage);
