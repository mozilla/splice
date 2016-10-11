import React, { Component } from 'react';
import { connect } from 'react-redux';
import { pageVisit } from 'actions/App/AppActions';

class ApprovalsPage extends Component {
  componentDidMount() {

  }

  render() {
    return (
      <div>
        <h1>Approval Queue</h1>
      </div>
    );
  }
}

ApprovalsPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account,
    Tile: state.Tile
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(ApprovalsPage);
