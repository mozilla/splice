import React, { PropTypes, Component } from 'react/addons';
import { connect } from 'react-redux';

import { fetchAccounts } from 'actions/Accounts/AccountActions';

import TopBar from 'components/App/Navigation/TopBar.js';
import AccountNavigation from 'components/App/Navigation/AccountNavigation.js';
import BreadCrumbs from 'components/App/Navigation/BreadCrumbs.js';

export default class AppPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    if (this.props.Account.rows.length === 0) {
      dispatch(fetchAccounts());
    }
  }

  getNavigations(){
    const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    let output = '';
    if (this.props.location.pathname.match(/\/accounts\/.*/) ||
      this.props.location.pathname.match(/\/campaigns\/.*/) ||
      this.props.location.pathname.match(/\/adgroups\/.*/) ||
      this.props.location.pathname.match(/\/tiles\/.*/) ) {
      output = (
        <div>
          <AccountNavigation {...this.props} key="account-navigation"/>
          <BreadCrumbs {...this.props} key="bread-crumbs"/>
        </div>
      );
    }
    return output;
  }

  render() {
    const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
    const key = this.props.location.pathname;

    return (
      <div className="app-container" style={{minWidth: '1170px'}}>
        <TopBar {...this.props} />

        <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionLeave={false}>
          {this.getNavigations()}
        </ReactCSSTransitionGroup>

        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <div className="content-container">
                <ReactCSSTransitionGroup transitionName="page-transition" transitionAppear={true} transitionLeave={false}>
                  {React.cloneElement(this.props.children || <div />, {key: key})}
                </ReactCSSTransitionGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AppPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return state;
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AppPage);
