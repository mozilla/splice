import React, { Component } from 'react/addons';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';

import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import AdGroupDetails from 'components/AdGroups/AdGroupDetails/AdGroupDetails';
import TileList from 'components/Tiles/TileList/TileList';

export default class AdGroupViewPage extends Component {
  componentWillMount() {
    this.fetchAdGroupDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.adGroupId !== this.props.params.adGroupId) {
      this.fetchAdGroupDetails(nextProps);
    }
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-6">
            <h1>Ad Group</h1>
            <AdGroupDetails AdGroup={this.props.AdGroup}/>
          </div>
        </div>
        <br/>
        <strong>Tiles</strong>
        <TileList rows={this.props.Tile.rows}
                  isFetching={this.props.Tile.isFetching}/>
      </div>
    );
  }

  fetchAdGroupDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Ad Group View');

    dispatch(fetchHierarchy('adGroup', props)).then(() => {
      pageVisit('Ad Group - ' + this.props.AdGroup.details.name, this);
    });
  }
}

AdGroupViewPage.propTypes = {};

function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Tile: state.Tile
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AdGroupViewPage);
