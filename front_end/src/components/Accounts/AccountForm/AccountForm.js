import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createAccount, updateAccount, fetchAccounts } from 'actions/Accounts/AccountActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';

window.$ = require('jquery');
window.jQuery = $;
require('jquery-serializejson');

bindFormConfig();
require('parsleyjs');

export default class AccountForm extends Component {
  componentDidMount(){
    bindFormValidators();
  }

  render() {
    let spinner;
    if(this.props.Account.isSaving){
      spinner = <img src="/public/img/ajax-loader.gif" />;
    }

    let data = this.props.Account.details;
    if(this.props.editMode === false){
      data = {};
    }

    return (
      <div>
        <form id="AccountForm" ref="form">
          {(this.props.editMode) ? (<input type="hidden" id="AccountId" name="id" ref="id" value={data.id}/>) : null}
          <div className="form-group">
            <label htmlFor="AccountName">Name</label>
            <input className="form-control" type="text" id="AccountName" name="name" ref="name" defaultValue={data.name} data-parsley-required/>
          </div>
          <div className="form-group">
            <label htmlFor="AccountContactName">Contact Name</label>
            <input className="form-control" type="text" id="AccountContactName" name="contact_name" ref="contact_name" defaultValue={data.contact_name} />
          </div>
          <div className="form-group">
            <label htmlFor="AccountContactEmail">Contact Email</label>
            <input className="form-control" type="text" id="AccountContactEmail" name="contact_email" ref="contact_email" defaultValue={data.contact_email} data-parsley-type="email"/>
          </div>
          <div className="form-group">
            <label htmlFor="AccountContactPhone">Contact Phone</label>
            <input className="form-control" type="text" id="AccountContactPhone" name="contact_phone" ref="contact_phone" defaultValue={data.contact_phone} />
          </div>
          <input onClick={(e) => this.handleFormSubmit(e)} type="submit" value="Save" className="btn btn-primary"/>
          {(this.props.editMode)
            ? <Link to={'/accounts/' + data.id} className="btn btn-default">Cancel</Link>
            : <Link to="/" className="btn btn-default">Cancel</Link>
          }
          {spinner}
        </form>
      </div>
    );
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const form = $('#AccountForm').parsley();

    if(form.validate()){
      const data = JSON.stringify($('#AccountForm').serializeJSON());

      //Handle Update or Create
      if(this.props.editMode){
        this.handleUpdate(data);
      }
      else{
        this.handleCreate(data);
      }
    }
    else{
      const { dispatch } = this.props;
      dispatch(displayMessage('error', 'Validation Errors') );
      dispatch(shownMessage());
    }
  }

  handleCreate(data){
    const { dispatch } = this.props;
    const context = this;

    dispatch(createAccount(data))
      .then(function(response){
        context.handleResponse(response);
      });
  }

  handleUpdate(data){
    const { dispatch } = this.props;
    const context = this;

    dispatch(updateAccount(this.props.Account.details.id, data))
      .then(function(response){
        context.handleResponse(response);
      }
    );
  }

  handleResponse(response){
    const { dispatch, history } = this.props;

    if(response.result === undefined){
      dispatch(displayMessage('error', response.message) );
      dispatch(shownMessage());
    }
    else{
      if(this.props.editMode){
        dispatch(fetchAccounts());
        dispatch(displayMessage('success', 'Account Updated Successfully') );
        dispatch(shownMessage());
      }
      else{
        dispatch(fetchAccounts());
        dispatch(displayMessage('success', 'Account Created Successfully') );
        history.pushState(null, '/accounts/' + response.result.id);
      }
    }
  }
}

AccountForm.propTypes = {
  editMode: PropTypes.bool.isRequired
};
