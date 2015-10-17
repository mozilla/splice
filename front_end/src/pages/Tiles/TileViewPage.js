import React, { Component } from 'react';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';

import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import TileDetails from 'components/Tiles/TileDetails/TileDetails';
import TilePreview from 'components/Tiles/TilePreview/TilePreview';

export default class TileViewPage extends Component {
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
        <div className="row">
          <div className="col-xs-12">
            <TileDetails Tile={this.props.Tile}/>
            <TilePreview Tile={this.props.Tile}/>
          </div>
        </div>
      );
    }
    return output;
  }

  fetchTileDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Tile View');

    dispatch(fetchHierarchy('tile', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Tile.details) {
          pageVisit('Tile - ' + this.props.Tile.details.title, this);
        }
    });
  }
}

TileViewPage.propTypes = {};

function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Tile: state.Tile
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(TileViewPage);
