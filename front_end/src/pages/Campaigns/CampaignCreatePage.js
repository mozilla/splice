import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import CampaignForm from 'components/Campaigns/CampaignForm/CampaignForm';

export default class CampaignCreatePage extends Component {
  componentDidMount() {
    this.fetchAccountDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.accountId !== this.props.params.accountId) {
      this.fetchAccountDetails(nextProps);
    }
  }

  render() {
    let output = (<div/>);

    if(this.props.Account.details){
      output = (
        <div>
          <div className="form-module">
            <div className="form-module-header">{this.props.Account.details.name}: Create Campaign</div>
            <div className="form-module-body">
              <CampaignForm editMode={false} {...this.props} />
            </div>
          </div>
        </div>
      );
    }

    return output;
  }

  fetchAccountDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Create Campaign');

    dispatch(fetchHierarchy('account', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Account.details){
          updateDocTitle(this.props.Account.details.name + ': Create Campaign');
        }
      });
  }
}

CampaignCreatePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Campaign: state.Campaign,
    Account: state.Account,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignCreatePage);
