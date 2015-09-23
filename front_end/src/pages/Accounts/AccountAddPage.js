import React, { Component } from 'react/addons';
import { pageVisit } from 'actions/App/AppActions';
import { connect } from 'react-redux';

export default class AccountAddPage extends Component {
  render() {
    return (
      <div>
        <div>
          <h1>Add Account</h1>
        </div>
      </div>
    );
  }
}

AccountAddPage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  return {
    Account: state.Account
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AccountAddPage);
