import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import AdGroupForm from 'components/AdGroups/AdGroupForm/AdGroupForm';

export default class AdGroupEditPage extends Component {
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
          <div className="form-module">
            <div className="form-module-header">Edit AdGroup - {this.props.AdGroup.details.name}</div>
            <div className="form-module-body">
              { (this.props.AdGroup.details.id && this.props.Init.categories.length)
                ? <AdGroupForm editMode={true} {...this.props} />
                : null
              }
            </div>
          </div>
        </div>
      );
    }
    return output;
  }

  fetchAdGroupDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit AdGroup');

    dispatch(fetchHierarchy('adGroup', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.AdGroup.details !== undefined){
          updateDocTitle('Edit AdGroup - ' + this.props.AdGroup.details.name);
        }
      });
  }
}

AdGroupEditPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Init: state.Init,
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AdGroupEditPage);
