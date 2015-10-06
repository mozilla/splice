import React, { Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import AccountForm from 'components/Accounts/AccountForm/AccountForm';

export default class AccountCreatePage extends Component {
  componentDidMount(){
    updateDocTitle('Create Account');
  }

  render() {
    return (
      <div>
        <h1>Create Account</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <AccountForm isSaving={this.props.Account.isSaving} data={{}} editMode={false} dispatch={this.props.dispatch} history={this.props.history}/>
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
