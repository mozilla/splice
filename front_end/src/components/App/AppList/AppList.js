import React, { Component, PropTypes } from 'react';

import AccountList from 'components/Accounts/AccountList/AccountList';

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

    return (
      <div>
        <select ref="typeSelector" onChange={(e) => this.selectType(e)}>
          <option value="accounts">Accounts</option>
          <option value="campaigns">Campaigns</option>
          <option value="ad_groups">Ad Groups</option>
          <option value="tiles">Tiles</option>
        </select>
        {listMarkup}
      </div>
    );
  }

  selectType(e) {
    const value = e.target.value;
    this.props.handleListTypeSelect(value);
  }
}

AppList.propTypes = {
  Account: PropTypes.object.isRequired,
  App: PropTypes.object.isRequired,
  handleListTypeSelect: PropTypes.func.isRequired
};
