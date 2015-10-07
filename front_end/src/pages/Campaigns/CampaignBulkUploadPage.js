import React, { Component, findDOMNode } from '../../../node_modules/react/addons';
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
    return (
      <div>
        <h1>Bulk Upload - {this.props.Campaign.details.name}</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <form >
              <label htmlFor="bulkUpload">Upload File</label>
              <input type="file" name="bulkUpload" id="bulkUpload" ref="bulkUpload" />
              <br/>
              <input onClick={(e) => this.handleFileUpload(e)} type="submit" className="btn btn-primary" value="Submit" />
              <Link to={'/campaigns/' + this.props.Campaign.details.id} className="btn btn-default">Cancel</Link>
            </form>
          </div>
        </div>
      </div>
    );
  }

  fetchCampaignDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Campaign Bulk Upload');

    dispatch(fetchHierarchy('campaign', props)).then(() => {
      updateDocTitle('Campaign Bulk Upload - ' + this.props.Campaign.details.name);
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


