import React, { Component, findDOMNode } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import fetch from 'isomorphic-fetch';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

export default class CampaignBulkUploadPage extends Component {
  componentDidMount() {
    this.fetchCampaignDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.campaignId !== this.props.params.campaignId) {
      this.fetchCampaignDetails(nextProps);
    }
  }

  render() {
    let spinner;
    if(this.props.Campaign.isSaving){
      spinner = <img src="/public/img/ajax-loader-aqua.gif" />;
    }

    let output = (<div/>);

    if(this.props.Campaign.details){
      output = (
        <div>
          <div className="form-module">
            <div className="form-module-header">Bulk Upload - {this.props.Campaign.details.name}</div>
            <div className="form-module-body">
              <form >
                <div className="container-fluid field-container">
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="form-group">
                        <label htmlFor="zip">Upload Zip</label>
                        <input type="file" name="zip" id="zip" ref="zip" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bulkUpload">Upload TSV</label>
                        <input type="file" name="tsv" id="tsv" ref="tsv" />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={(e) => this.handleFileUpload(e)} className="form-submit" >Save {spinner}</button>
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
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Campaign.details) {
          updateDocTitle('Campaign Bulk Upload - ' + this.props.Campaign.details.name);
        }
    });
  }

  handleFileUpload(e){
    e.preventDefault();
    const data = new FormData();
    const input = findDOMNode(this.refs.bulkUpload);
    data.append('file', input.files[0]);

    fetch('http://dev.sandbox.com/receiveFile.php', {
      method: 'post',
      body: data
    });
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