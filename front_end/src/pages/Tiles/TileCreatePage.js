import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import TileForm from 'components/Tiles/TileForm/TileForm';

export default class TileCreatePage extends Component {
  componentDidMount(){
    this.fetchTileDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.adGroupId !== this.props.params.adGroupId) {
      this.fetchTileDetails(nextProps);
    }
  }

  render() {
    let output = (<div/>);

    if(this.props.AdGroup.details){
      output = (
        <div>
          <div className="module">
            <div className="module-header">{this.props.AdGroup.details.name}: Create Tile</div>
            <div className="module-body">
              <TileForm editMode={false} {...this.props}/>
            </div>
          </div>
        </div>
      );
    }
    return output;
  }

  fetchTileDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Create Tile');

    dispatch(fetchHierarchy('adGroup', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.AdGroup.details !== undefined){
          updateDocTitle(this.props.AdGroup.details.name + ': Create Tile');
        }
      });
  }
}

TileCreatePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Tile: state.Tile,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(TileCreatePage);
