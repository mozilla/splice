import React, { Component } from 'react';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';
import { fetchCampaigns, campaignSetPast, campaignSetScheduled, campaignSetInFlight } from 'actions/Campaigns/CampaignActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import AccountDetails from 'components/Accounts/AccountDetails/AccountDetails';
import CampaignList from 'components/Campaigns/CampaignList/CampaignList';

export default class AccountViewPage extends Component {
  componentWillMount() {
    this.fetchAccountDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.accountId !== this.props.params.accountId) {
      this.fetchAccountDetails(nextProps);
    }
  }

  render() {
    let output = (<div/>);

    if(this.props.Account.details) {
      output = (
        <div>
          <div className="row">
            <div className="col-xs-3">
              <AccountDetails Account={this.props.Account}/>
            </div>
          </div>

          <div className="list-actions">
            <Link className="create-link" to={'/accounts/' + this.props.Account.details.id + '/createcampaign'}>Create Campaign <i className="fa fa-plus"></i></Link>

            <div className="list-filters">
              {this.generateFilter('past', 'Past', this.props.Campaign.past)}
              {this.generateFilter('scheduled', 'Scheduled', this.props.Campaign.scheduled)}
              {this.generateFilter('inFlight', 'In Flight', this.props.Campaign.inFlight)}
            </div>
          </div>

          <CampaignList rows={this.props.Campaign.rows}
                        isFetching={this.props.Campaign.isFetching}
                        channels={this.props.Init.channels}/>
        </div>
      );
    }

    return output;
  }

  handleToggleFilter(varName, value){
    const { dispatch } = this.props;

    switch(varName){
      case 'past':
        dispatch(campaignSetPast(value));
        break;
      case 'scheduled':
        dispatch(campaignSetScheduled(value));
        break;
      case 'inFlight':
        dispatch(campaignSetInFlight(value));
        break;
      default:
        break;
    }

    dispatch(fetchCampaigns(this.props.Account.details.id));
  }

  generateFilter(varName, fieldName, value){
    return (
      <div className="list-filter" onClick={() => this.handleToggleFilter(varName, !value) } >
        <i className={'fa ' + ((value) ? 'fa-check-square-o' : 'fa-square-o' )}></i> {fieldName}
      </div>
    );
  }

  fetchAccountDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Account View');

    dispatch(fetchHierarchy('account', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Account.details){
          pageVisit('Account - ' + this.props.Account.details.name, this);
        }
    });
  }
}

AccountViewPage.propTypes = {};

function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AccountViewPage);
