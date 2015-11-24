import React, { Component } from 'react';
import { connect } from 'react-redux';
import reactMixin from 'react-mixin';
import { Link, Lifecycle } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';
import { fetchAccounts } from 'actions/Accounts/AccountActions';

import AdGroupForm from 'components/AdGroups/AdGroupForm/AdGroupForm';

@reactMixin.decorate(Lifecycle)
class AdGroupCreatePage extends Component {
  constructor(props) {
    super(props);
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

  componentWillMount(){
    this.props.Campaign.rows = [];
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
    let output = null;

    if(this.props.Campaign.details){
      output = (
        <div>
          <div className="form-module">
            <div className="form-module-header">{(this.props.params.campaignId && this.props.Campaign.details.name) ? this.props.Campaign.details.name + ': ' : ''} Create Ad Group</div>
            <div className="form-module-body">
              <AdGroupForm editMode={false} {...this.props}/>
            </div>
          </div>
        </div>
      );
    }
    return output;
  }

  routerWillLeave() {
    if(this.props.App.formChanged){
      return 'Your progress is not saved. Are you sure you want to leave?';
    }
  }

  fetchAdGroupDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit AdGroup');

    if(this.props.params.campaignId !== undefined){
      dispatch(fetchHierarchy('campaign', props))
        .then(() => {
          if(this.props.Campaign.details.id){
            updateDocTitle(this.props.Campaign.details.name + ': Create Ad Group');
          }
          else{
            props.history.replaceState(null, '/error404');
          }
        });
    }
    else{
      dispatch(fetchAccounts());
    }
  }
}

AdGroupCreatePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    App: state.App,
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AdGroupCreatePage);
