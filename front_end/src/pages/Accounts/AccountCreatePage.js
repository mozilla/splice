import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';

import AccountForm from 'components/Accounts/AccountForm/AccountForm';

export default class AccountCreatePage extends Component {
  componentDidMount(){
    updateDocTitle('Create Account');
  }

  render() {
    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-body">
            <h2>Create Account</h2>
            <AccountForm editMode={false} {...this.props}/>
          </div>
        </div>
      </div>
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
