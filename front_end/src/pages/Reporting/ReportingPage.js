import React from 'react';
import { connect } from 'react-redux';
import { pageVisit } from 'actions/App/AppActions';
import Nav from './ReportingNav';

const navItems = [
  {link: '/reporting', icon: 'fa-file-o', label: 'Reports'}
];

const ReportingPage = React.createClass({

  componentDidMount: function() {
    const { dispatch } = this.props;
    pageVisit('Reporting', this);
  },

  render: function() {
    return (
      <div id="reporting">
        <aside className="sidebar icons">
          <Nav items={navItems} />
        </aside>
        {this.props.children}
      </div>
    );
  }

});

function select(state) {
  return {};
}

export default connect(select)(ReportingPage);
