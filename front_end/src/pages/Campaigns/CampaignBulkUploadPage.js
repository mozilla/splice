import React, { Component } from '../../../node_modules/react/addons';
import { connect } from 'react-redux';
//import { pageVisit } from 'actions/App/AppActions';

export default class CampaignBulkUploadPage extends Component {
  componentDidMount() {

  }

  render() {
    return (
      <div>
        <h1>Bulk Upload</h1>
      </div>
    );
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


