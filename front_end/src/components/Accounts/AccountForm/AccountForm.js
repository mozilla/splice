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
  componentDidUpdate(prevProps) {
    if (prevProps.Account.details.id !== this.props.Account.details.id ){
      bindFormValidators();
    }
  }

  render() {
    let spinner;
    if(this.props.Account.isSaving){
      spinner = <img src="/public/img/ajax-loader-aqua.gif" />;
    }

    let data = this.props.Account.details;
    if(this.props.editMode === false){
      data = {};
    }

    return (
      <div>
        <form id="AccountForm" ref="form" key={'campaignform-' + ((this.props.editMode) ? 'edit-' + data.id : 'create')}>
          {(this.props.editMode) ? (<input type="hidden" id="AccountId" name="id" ref="id" value={data.id}/>) : null}
          <div className="container-fluid field-container">
            <div className="row">
              <div className="col-xs-4">
                <div className="form-group">
                  <label htmlFor="AccountName">Account Name</label>
                  <input className="form-control" type="text" id="AccountName" name="name" ref="name" defaultValue={data.name} data-parsley-required data-parsley-minlength="2"/>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <div className="form-group">
                  <label htmlFor="AccountContactName">Contact Name</label>
                  <input className="form-control" type="text" id="AccountContactName" name="contact_name" ref="contact_name" defaultValue={data.contact_name} />
                </div>
              </div>
              <div className="col-xs-4">
                <div className="form-group">
                  <label htmlFor="AccountContactEmail">Contact Email</label>
                  <input className="form-control" type="text" id="AccountContactEmail" name="contact_email" ref="contact_email" defaultValue={data.contact_email} data-parsley-type="email"/>
                </div>
              </div>
              <div className="col-xs-4">
                <div className="form-group">
                  <label htmlFor="AccountContactPhone">Contact Phone</label>
                  <input className="form-control" type="text" id="AccountContactPhone" name="contact_phone" ref="contact_phone" defaultValue={data.contact_phone} />
                </div>
              </div>
            </div>
          </div>

          <div onClick={(e) => this.handleFormSubmit(e)} className="form-submit">Save {spinner}</div>
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
        dispatch(displayMessage('success', 'Account Updated Successfully') );
      }
      else{
        dispatch(displayMessage('success', 'Account Created Successfully') );
      }
      dispatch(fetchAccounts());
      history.pushState(null, '/accounts/' + response.result.id);
    }
  }
}

AccountForm.propTypes = {
  editMode: PropTypes.bool.isRequired
};
