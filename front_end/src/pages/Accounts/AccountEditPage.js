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
    let output = (<div/>);

    if(this.props.Account.details){
      output = (
        <div>
          <div className="module">
            <div className="module-header">Edit Account - {this.props.Account.details.name}</div>
            <div className="module-body">
              { (this.props.Account.details.id !== undefined)
                ? <AccountForm editMode={true} {...this.props} />
                : null
              }
            </div>
          </div>
        </div>
      );
    }

    return output;
  }

  fetchAccountDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit Account');

    dispatch(fetchHierarchy('account', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Account.details){
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
