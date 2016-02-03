import React, { Component } from 'react';
import { connect } from 'react-redux';
import reactMixin from 'react-mixin';
import { Link, Lifecycle } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import TileForm from 'components/Tiles/TileForm/TileForm';

@reactMixin.decorate(Lifecycle)
class TileEditPage extends Component {
  constructor(props) {
    super(props);
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

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
            <div className="form-module-header">Edit Tile - {this.props.Tile.details.title}</div>
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

  routerWillLeave() {
    if(this.props.App.formChanged){
      return 'Your progress is not saved. Are you sure you want to leave?';
    }
  }

  fetchTileDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit Tile');

    dispatch(fetchHierarchy('tile', props))
      .then(() => {
        if(this.props.Tile.details.id){
          updateDocTitle('Edit Tile - ' + this.props.Tile.details.title);
        }
        else{
          props.history.replaceState(null, '/error404');
        }
      });
  }
}

TileEditPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    App: state.App,
    Init: state.Init,
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Tile: state.Tile
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(TileEditPage);
