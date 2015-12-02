import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setListType, setListDateRange } from 'actions/App/AppActions';
import { fetchAccounts, fetchAccountStats } from 'actions/Accounts/AccountActions';
import { formatDate } from 'helpers/DateHelpers';

import AccountList from 'components/Accounts/AccountList/AccountList';
import CustomDropdown from 'components/App/CustomDropdown/CustomDropdown';
import CustomDateRangeSelector from 'components/App/CustomDateRangeSelector/CustomDateRangeSelector';
import Moment from 'moment';

export default class AppList extends Component {
  componentDidMount(){
    this.props.dispatch(fetchAccountStats(this.getDateRangeParams(this.props.App.listDateRange))).then(
      this.props.dispatch(fetchAccounts())
    );
  }

  getDateRangeParams(value){
    let params;
    if(value === '30days'){
      params = {
        start_date: Moment().subtract(30, 'days').format('YYYY-MM-DD'),
        end_date: Moment().format('YYYY-MM-DD')
      };
    }
    else if(typeof value === 'object'){
      params = value;
    }
    return params;
  }

  render() {
    let listMarkup = '';
    switch (this.props.App.listType) {
      case 'accounts':
        listMarkup = (<AccountList rows={this.props.Account.rows}
                                   stats={this.props.Account.stats}
                                   isFetching={this.props.Account.isFetching}/>);
        break;
      default:
        break;
    }

    const options = [
      {key: 'accounts', val: 'Accounts'},
      {key: 'campaigns', val: 'Campaigns'},
      {key: 'adGroups', val: 'AdGroups'},
      {key: 'tiles', val: 'Tiles'}
    ];

    return (
      <div>
        <div className="list-actions">
          <div className="pull-left">
            <CustomDropdown selectedKey={this.props.App.listType} selectedValue={_.capitalize(this.props.App.listType)} options={options} onChange={(value) => this.selectType(value)}  />
          </div>

          <div className="pull-right">
            <CustomDateRangeSelector selectedKey={this.props.App.listDateRange} onChange={(value) => this.selectDateRange(value)}  />
          </div>
          <div className="clearfix"></div>
        </div>

        {listMarkup}
      </div>
    );
  }

  selectType(value) {
    this.props.dispatch(setListType(value));
    switch (value) {
      case 'accounts':
        this.props.dispatch(fetchAccountStats()).then(
          this.props.dispatch(fetchAccounts())
        );
        break;
      case 'campaigns':
        //this.props.dispatch(fetchCampaigns());
        break;
      default:
        break;
    }
  }

  selectDateRange(value) {
    this.props.dispatch(setListDateRange(value));

    switch (this.props.App.listType) {
      case 'accounts':
        this.props.dispatch(fetchAccountStats(this.getDateRangeParams(value)));
        break;
      default:
        break;
    }
  }
}

AppList.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account,
    App: state.App
  };
}

export default connect(select)(AppList);