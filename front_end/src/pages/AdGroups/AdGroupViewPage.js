import React, { Component } from 'react';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';

import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import AdGroupDetails from 'components/AdGroups/AdGroupDetails/AdGroupDetails';
import TileList from 'components/Tiles/TileList/TileList';

class AdGroupViewPage extends Component {
  componentWillMount() {
    this.fetchAdGroupDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.adGroupId !== this.props.params.adGroupId) {
      this.fetchAdGroupDetails(nextProps);
    }
  }

  render() {
    let output = (<div/>);

    if(this.props.AdGroup.details) {
      output = (
        <div>
          <div className="row">
            <div className="col-xs-6">
              <AdGroupDetails AdGroup={this.props.AdGroup}/>
            </div>
          </div>
          <Link className="create-link" to={'/adgroups/' + this.props.AdGroup.details.id + '/createtile'}>Create Tile <i className="fa fa-plus"></i></Link>
          <TileList rows={this.props.Tile.rows}
                    isFetching={this.props.Tile.isFetching}/>
        </div>
      );
    }

    return output;
  }

  fetchAdGroupDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Ad Group View');

    dispatch(fetchHierarchy('adGroup', props))
      .then(() => {
        if(this.props.AdGroup.details.id) {
          pageVisit('Ad Group - ' + this.props.AdGroup.details.name, this);
        }
        else{
          props.history.replaceState(null, '/error404');
        }
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
