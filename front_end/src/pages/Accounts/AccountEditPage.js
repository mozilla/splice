import React, { Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit, displayMessage, shownMessage } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';
import { updateAccount, fetchAccounts } from 'actions/Accounts/AccountActions';

import AccountForm from 'components/Accounts/AccountForm/AccountForm';

window.$ = require('jquery');
require('jquery-serializejson');

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
        <h1>Edit Account - {this.props.Account.details.name}</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            { (this.props.Account.details.id !== undefined)
              ? <AccountForm isSaving={this.props.Account.isSaving} handleFormSubmit={(id) => this.handleFormSubmit(id)} data={this.props.Account.details} editMode={true} dispatch={this.props.dispatch}/>
              : null
            }
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

    dispatch(updateAccount(this.props.Account.details.id, data))
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
          dispatch(displayMessage('success', 'Account Updated Successfully') );
          dispatch(shownMessage());
        }
      }
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
