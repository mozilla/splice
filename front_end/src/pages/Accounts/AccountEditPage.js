import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import AccountForm from 'components/Accounts/AccountForm/AccountForm';

export default class AccountEditPage extends Component {
  componentWillMount() {
    this.fetchAccountDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.accountId !== this.props.params.accountId) {
      this.fetchAccountDetails(nextProps);
    }
  }

  render() {
    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-body">
            <h2>Edit Account - {this.props.Account.details.name}</h2>
            { (this.props.Account.details.id !== undefined)
              ? <AccountForm editMode={true} {...this.props} />
              : null
            }
          </div>
        </div>
      </div>
    );
  }

  fetchAccountDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit Account');

    dispatch(fetchHierarchy('account', props))
      .catch(function(){
        props.history.pushState(null, '/error404');
      })
      .then(() => {
        if(this.props.Account.details.name !== undefined){
          updateDocTitle('Edit Account - ' + this.props.Account.details.name);
        }
      });
  }
}

AccountEditPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AccountEditPage);
