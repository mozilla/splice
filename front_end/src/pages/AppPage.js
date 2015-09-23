import React, { PropTypes, Component } from 'react/addons';
import { connect } from 'react-redux';

import { fetchAccounts } from 'actions/Accounts/AccountActions';

import TopBar from 'components/App/Navigation/TopBar.js';
import SideBar from 'components/App/Navigation/SideBar.js';
import AccountNavigation from 'components/App/Navigation/AccountNavigation.js';

export default class AppPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    if (this.props.Account.rows.length === 0) {
      dispatch(fetchAccounts());
    }
  }

  render() {
    const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
    const key = this.props.location.pathname;

    return (
      <div>
        <TopBar {...this.props} />

        <div className="container">
          <div className="row">
            <SideBar {...this.props} />

            <div className="col-md-9">
              <AccountNavigation {...this.props} />

              <ReactCSSTransitionGroup transitionName="page-transition" transitionLeave={false}>
                {React.cloneElement(this.props.children || <div />, {key: key})}
              </ReactCSSTransitionGroup>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AppPage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  return state;
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AppPage);
