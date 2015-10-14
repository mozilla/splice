import React, { Component } from 'react';
import { connect } from 'react-redux';
import { pageVisit } from 'actions/App/AppActions';

export default class AdGroupsPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    pageVisit('Ad Groups', this);
  }

  render() {
    return (
      <div>
        <h1>Ad Groups</h1>
      </div>
    );
  }
}

AdGroupsPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account,
    AdGroup: state.AdGroup
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AdGroupsPage);


