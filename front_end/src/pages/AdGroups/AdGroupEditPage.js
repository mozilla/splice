import React, { Component } from 'react';
import { connect } from 'react-redux';
import reactMixin from 'react-mixin';
import { Link, Lifecycle } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import AdGroupForm from 'components/AdGroups/AdGroupForm/AdGroupForm';

@reactMixin.decorate(Lifecycle)
class AdGroupEditPage extends Component {
  constructor(props) {
    super(props);
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

  componentWillMount() {
    this.fetchAdGroupDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.adGroupId !== this.props.params.adGroupId) {
      this.fetchAdGroupDetails(nextProps);
    }
  }

  render() {
    let output = null;

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

  routerWillLeave() {
    if(this.props.App.formChanged){
      return 'Your progress is not saved. Are you sure you want to leave?';
    }
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
    App: state.App,
    Init: state.Init,
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AdGroupEditPage);
