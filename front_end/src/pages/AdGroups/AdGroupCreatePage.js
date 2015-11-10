import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import AdGroupForm from 'components/AdGroups/AdGroupForm/AdGroupForm';

export default class AdGroupCreatePage extends Component {
  componentWillMount(){
    this.props.AdGroup.details = {};
  }
  componentDidMount(){
    this.fetchAdGroupDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.campaignId !== this.props.params.campaignId) {
      this.fetchCampaignDetails(nextProps);
    }
  }

  render() {
    let output = (<div/>);

    if(this.props.Campaign.details){
      output = (
        <div>
          <div className="form-module">
            <div className="form-module-header">{this.props.Campaign.details.name}: Create Ad Group</div>
            <div className="form-module-body">
              <AdGroupForm editMode={false} {...this.props}/>
            </div>
          </div>
        </div>
      );
    }
    return output;
  }

  fetchAdGroupDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit AdGroup');

    dispatch(fetchHierarchy('campaign', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Campaign.details !== undefined){
          updateDocTitle(this.props.Campaign.details.name + ': Create Ad Group');
        }
      });
  }
}

AdGroupCreatePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AdGroupCreatePage);
