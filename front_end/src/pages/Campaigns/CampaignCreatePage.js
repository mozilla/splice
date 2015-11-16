import React, { Component } from 'react';
import { connect } from 'react-redux';
import reactMixin from 'react-mixin';
import { Link, Lifecycle } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import CampaignForm from 'components/Campaigns/CampaignForm/CampaignForm';

@reactMixin.decorate(Lifecycle)
class CampaignCreatePage extends Component {
  constructor(props) {
    super(props);
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

  componentDidMount() {
    this.fetchAccountDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.accountId !== this.props.params.accountId) {
      this.fetchAccountDetails(nextProps);
    }
  }

  render() {
    let output = null;

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

  routerWillLeave() {
    if(this.props.App.formChanged){
      return 'Your progress is not saved. Are you sure you want to leave?';
    }
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
    App: state.App,
    Campaign: state.Campaign,
    Account: state.Account,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignCreatePage);
