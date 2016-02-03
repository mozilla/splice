import React, { Component, PropTypes } from 'react';

import AccountList from 'components/Accounts/AccountList/AccountList';
import CustomDropdown from 'components/App/CustomDropdown/CustomDropdown';

export default class AppList extends Component {
  render() {
    let listMarkup = '';
    switch (this.props.App.listType) {
      case 'accounts':
        listMarkup = (<AccountList rows={this.props.Account.rows}
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
        <CustomDropdown selectedKey="accounts" selectedValue="Accounts" options={options} onChange={(value) => this.selectType(value)}  />
        {listMarkup}
      </div>
    );
  }

  selectType(value) {
    this.props.handleListTypeSelect(value);
  }
}

AppList.propTypes = {
  Account: PropTypes.object.isRequired,
  App: PropTypes.object.isRequired,
  handleListTypeSelect: PropTypes.func.isRequired
};
