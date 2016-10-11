import React, { Component } from 'react';
import { connect } from 'react-redux';
import { pageVisit } from 'actions/App/AppActions';

class TilesPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    pageVisit('Tiles', this);
  }

  render() {
    return (
      <div>
        <h1>Tiles</h1>
      </div>
    );
  }
}

TilesPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account,
    Tile: state.Tile
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(TilesPage);
