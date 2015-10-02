import React, { Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createAccount, fetchAccounts } from 'actions/Accounts/AccountActions';

import $ from 'jquery';
window.$ = $;
require('jquery-serializejson');

export default class AccountCreatePage extends Component {
  componentDidMount() {
    const context = this;
    $('#AccountForm input').keydown(function(e){
      if (e.which === 13) {
        context.handleFormSubmit(e);
      }
    });
  }

  render() {
    let spinner;
    if(this.props.Account.isSaving){
      spinner = <img src="/public/img/ajax-loader.gif" />;
    }

    return (
      <div>
        <h1>Create Account</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <form id="AccountForm" ref="form">
              <div className="form-group">
                <label htmlFor="AccountName">Name</label>
                <input className="form-control" type="text" id="AccountName" name="name" ref="name" />
              </div>
              <div className="form-group">
                <label htmlFor="AccountContactName">Contact Name</label>
                <input className="form-control" type="text" id="AccountContactName" name="contact_name" ref="contact_name" />
              </div>
              <div className="form-group">
                <label htmlFor="AccountContactEmail">Contact Email</label>
                <input className="form-control" type="text" id="AccountContactEmail" name="contact_email" ref="contact_email" />
              </div>
              <div className="form-group">
                <label htmlFor="AccountContactPhone">Contact Phone</label>
                <input className="form-control" type="text" id="AccountContactPhone" name="contact_phone" ref="contact_phone" />
              </div>
              <input onClick={(e) => this.handleFormSubmit(e)} type="submit" value="Submit" className="btn btn-primary"/>
              &nbsp;
              <Link to="/" className="btn btn-default">Cancel</Link>
              &nbsp;
              {spinner}
            </form>
          </div>
        </div>
      </div>
    );
  }

  handleFormSubmit(e){
    e.preventDefault();

    const { dispatch } = this.props;
    const props = this.props;
    const context = this;

    const data = JSON.stringify($('#AccountForm').serializeJSON());

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
