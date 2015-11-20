import React, { Component } from 'react';
import { connect } from 'react-redux';
import reactMixin from 'react-mixin';
import { Link, Lifecycle } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';
import { fetchAccounts } from 'actions/Accounts/AccountActions';

import TileForm from 'components/Tiles/TileForm/TileForm';

@reactMixin.decorate(Lifecycle)
class TileCreatePage extends Component {
  constructor(props) {
    super(props);
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

  componentWillMount(){
    this.props.Campaign.rows = [];
    this.props.AdGroup.rows = [];
    this.props.Tile.details = {};
  }
  componentDidMount(){
    this.fetchTileDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.adGroupId !== this.props.params.adGroupId) {
      this.fetchTileDetails(nextProps);
    }
  }

  render() {
    let output = null;

    if(this.props.AdGroup.details){
      output = (
        <div>
          <div className="form-module">
            <div className="form-module-header">{(this.props.params.adGroupId && this.props.AdGroup.details.name) ? this.props.AdGroup.details.name + ':  ' : '' }Create Tile</div>
            <div className="form-module-body">
              <TileForm editMode={false} {...this.props}/>
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

    updateDocTitle('Create Tile');

    if(this.props.params.adGroupId !== undefined) {
      dispatch(fetchHierarchy('adGroup', props))
        .catch(function(){
          props.history.replaceState(null, '/error404');
        })
        .then(() => {
          if (this.props.AdGroup.details !== undefined) {
            updateDocTitle(this.props.AdGroup.details.name + ': Create Tile');
          }
        });
    }
    else {
      dispatch(fetchAccounts());
    }
  }
}

TileCreatePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    App: state.App,
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Tile: state.Tile,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(TileCreatePage);
