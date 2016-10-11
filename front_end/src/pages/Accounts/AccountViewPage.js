import React, { Component } from 'react';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';
import { fetchCampaigns, campaignSetFilter } from 'actions/Campaigns/CampaignActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import AccountDetails from 'components/Accounts/AccountDetails/AccountDetails';
import CampaignList from 'components/Campaigns/CampaignList/CampaignList';

window.$ = require('jquery');

class AccountViewPage extends Component {
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
              <div className="list-filter-button" onClick={this.handleShowHideFilters}>
                Filters
              </div>
              <div className="list-filter-dropdown" >
                {this.generateFilter('past', 'Past', this.props.Campaign.filters.past)}
                {this.generateFilter('scheduled', 'Scheduled', this.props.Campaign.filters.scheduled)}
                {this.generateFilter('inFlight', 'In Flight', this.props.Campaign.filters.inFlight)}
                <div className="clearfix"></div>
              </div>
            </div>
            <div className="clearfix"></div>
          </div>

          <CampaignList rows={this.props.Campaign.rows}
                        isFetching={this.props.Campaign.isFetching}
                        init_channels={this.props.Init.channels}
                        init_countries={this.props.Init.countries} />
        </div>
      );
    }

    return output;
  }

  handleShowHideFilters(e){
    const elem = $(e.target);
    if(elem.hasClass('active')){
      elem.removeClass('active');
      elem.siblings('.list-filter-dropdown').slideUp();
    }
    else{
      elem.addClass('active');
      elem.siblings('.list-filter-dropdown').slideDown();
    }
  }

  handleToggleFilter(varName, value){
    const { dispatch } = this.props;

    dispatch(campaignSetFilter(varName, value));
    dispatch(fetchCampaigns(this.props.Account.details.id));
  }

  generateFilter(varName, fieldName, value){
    return (
      <div className="list-filter-item" onClick={() => this.handleToggleFilter(varName, !value) } >
        <i className={'fa ' + ((value) ? 'fa-check-square-o' : 'fa-square-o' )}></i> {fieldName}
      </div>
    );
  }

  fetchAccountDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Account View');

    dispatch(fetchHierarchy('account', props))
      .then(() => {
        if(this.props.Account.details.id){
          pageVisit('Account - ' + this.props.Account.details.name, this);
        }
        else{
          props.history.replaceState(null, '/error404');
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
