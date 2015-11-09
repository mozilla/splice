import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import TileForm from 'components/Tiles/TileForm/TileForm';

export default class TileEditPage extends Component {
  componentWillMount() {
    this.fetchTileDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.tileId !== this.props.params.tileId) {
      this.fetchTileDetails(nextProps);
    }
  }

  render() {
    let output = (<div/>);

    if(this.props.Tile.details) {
      output = (
        <div>
          <div className="form-module">
            <div className="form-module-header">Edit Tile - {this.props.Tile.details.name}</div>
            <div className="form-module-body">
              { (this.props.Tile.details.id)
                ? <TileForm editMode={true} {...this.props} />
                : null
              }
            </div>
          </div>
        </div>
      );
    }
    return output;
  }

  fetchTileDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit Tile');

    dispatch(fetchHierarchy('tile', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Tile.details !== undefined){
          updateDocTitle('Edit Tile - ' + this.props.Tile.details.name);
        }
      });
  }
}

TileEditPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Init: state.Init,
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Tile: state.Tile
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(TileEditPage);
