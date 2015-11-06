import React, { Component } from 'react';
import { connect } from 'react-redux';
import reactMixin from 'react-mixin';
import { Link, Lifecycle } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';

import AccountForm from 'components/Accounts/AccountForm/AccountForm';

@reactMixin.decorate(Lifecycle)
class AccountCreatePage extends Component {
  constructor(props) {
    super(props);
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

  componentDidMount(){
    updateDocTitle('Create Account');
  }

  render() {
    return (
      <div>
        <div className="form-module">
          <div className="form-module-header">Create Account</div>
          <div className="form-module-body">
            <AccountForm editMode={false} {...this.props}/>
          </div>
        </div>
      </div>
    );
  }

  routerWillLeave(nextLocation) {
    if(this.props.App.formChanged){
      return 'Your progress is not saved. Are you sure you want to leave?';
    }
  }
}

AccountCreatePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    App: state.App,
    Account: state.Account
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AccountCreatePage);
