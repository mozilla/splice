import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createAccount, updateAccount, fetchAccounts } from 'actions/Accounts/AccountActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';

window.$ = require('jquery');
window.jQuery = $;

bindFormConfig();
require('parsleyjs');

export default class AccountForm extends Component {
  componentDidMount(){
    bindFormValidators();
  }

  render() {
    let spinner;
    if(this.props.isSaving){
      spinner = <img src="/public/img/ajax-loader.gif" />;
    }

    return (
      <div>
        <form id="AccountForm" ref="form">
          {(this.props.editMode) ? (<input type="hidden" id="AccountId" name="id" ref="id" value={this.props.data.id}/>) : null}
          <div className="form-group">
            <label htmlFor="AccountName">Name</label>
            <input className="form-control" type="text" id="AccountName" name="name" ref="name" defaultValue={this.props.data.name} data-parsley-required/>
          </div>
          <div className="form-group">
            <label htmlFor="AccountContactName">Contact Name</label>
            <input className="form-control" type="text" id="AccountContactName" name="contact_name" ref="contact_name" defaultValue={this.props.data.contact_name} />
          </div>
          <div className="form-group">
            <label htmlFor="AccountContactEmail">Contact Email</label>
            <input className="form-control" type="text" id="AccountContactEmail" name="contact_email" ref="contact_email" defaultValue={this.props.data.contact_email} data-parsley-type="email"/>
          </div>
          <div className="form-group">
            <label htmlFor="AccountContactPhone">Contact Phone</label>
            <input className="form-control" type="text" id="AccountContactPhone" name="contact_phone" ref="contact_phone" defaultValue={this.props.data.contact_phone} />
          </div>
          <input onClick={(e) => this.handleFormSubmit(e)} type="submit" value="Save" className="btn btn-primary"/>
          &nbsp;
          {(this.props.editMode)
            ? <Link to={'/accounts/' + this.props.data.id} className="btn btn-default">Cancel</Link>
            : <Link to="/" className="btn btn-default">Cancel</Link>
          }
          &nbsp;
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

      if(this.props.editMode){
        this.handleUpdate(data);
      }
      else{
        this.handleCreate(data);
      }
    }
    else{
      const { dispatch } = this.props;
      dispatch(displayMessage('error', 'Error: Validation Errors') );
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

    dispatch(updateAccount(this.props.data.id, data))
      .then(function(response){
        context.handleResponse(response);
      }
    );
  }

  handleResponse(response){
    const { dispatch, history } = this.props;

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
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  editMode: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  isSaving: PropTypes.bool.isRequired
};
