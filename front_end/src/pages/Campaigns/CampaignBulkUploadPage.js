import React, { Component } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import fetch from 'isomorphic-fetch';

import { updateDocTitle, pageVisit, displayMessage, shownMessage } from 'actions/App/AppActions';
import { bulkupload } from 'actions/Campaigns/CampaignActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';

bindFormConfig();
require('parsleyjs');

class CampaignBulkUploadPage extends Component {
  constructor(props) {
    super(props);
    this.handleFileUpload = this.handleFileUpload.bind(this);
  }

  componentDidMount() {
    this.fetchCampaignDetails(this.props);
    bindFormValidators();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.campaignId !== this.props.params.campaignId) {
      this.fetchCampaignDetails(nextProps);
      bindFormValidators();
    }
  }

  render() {
    let spinner;
    if(this.props.Campaign.isSaving){
      spinner = <img src ={__CONFIG__.WEBPACK_PUBLIC_PATH + 'public/img/ajax-loader-aqua.gif'} />;
    }

    let output = (<div/>);

    if(this.props.Campaign.details){
      output = (
        <div>
          <div className="form-module">
            <div className="form-module-header">Bulk Upload - {this.props.Campaign.details.name}</div>
            <div className="form-module-body">
              <form id="BulkUploadForm">
                <div className="container-fluid field-container">
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="form-group file-upload-form-group">
                        <label htmlFor="zip">Upload Creatives File (.zip)</label>
                        <input className="file-upload-input" type="file" name="zip" id="zip" ref="zip" data-parsley-required data-parsley-filetype="zip" />
                      </div>
                      <div className="form-group file-upload-form-group">
                        <label htmlFor="bulkUpload">Upload Assets File (.tsv)</label>
                        <input className="file-upload-input" type="file" name="tsv" id="tsv" ref="tsv" data-parsley-required data-parsley-filetype="tsv" />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={this.handleFileUpload} className="form-submit" >Save {spinner}</button>
              </form>
            </div>
          </div>
        </div>
      );
    }
    return output;
  }

  fetchCampaignDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Campaign Bulk Upload');

    dispatch(fetchHierarchy('campaign', props))
      .then(() => {
        if(this.props.Campaign.details.id) {
          updateDocTitle('Campaign Bulk Upload - ' + this.props.Campaign.details.name);
        }
        else{
          props.history.replaceState(null, '/error404');
        }
    });
  }

  handleFileUpload(e){
    e.preventDefault();
    const { dispatch, history } = this.props;
    const campaignId = this.props.Campaign.details.id;
    const form = $('#BulkUploadForm').parsley();

    if(form.validate()){
      const data = new FormData();

      const zip = findDOMNode(this.refs.zip);
      const tsv = findDOMNode(this.refs.tsv);
      data.append('creatives', zip.files[0]);
      data.append('assets', tsv.files[0]);

      dispatch(bulkupload(campaignId, data))
        .then(function(response){
          if(response.message !== 'Uploading successfully.'){
            dispatch(displayMessage('error', response.message) );
            dispatch(shownMessage());
          }
          else{
            dispatch(displayMessage('success', 'Upload Successful!') );
            history.pushState(null, '/campaigns/' + campaignId);
          }
        });
    }
    else{
      dispatch(displayMessage('error', 'Validation Errors') );
      dispatch(shownMessage());
    }
  }
}

CampaignBulkUploadPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Campaign: state.Campaign
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignBulkUploadPage);
