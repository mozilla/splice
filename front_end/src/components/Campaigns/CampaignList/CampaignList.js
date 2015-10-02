import React, { Component, PropTypes } from 'react';
import CampaignRow from './CampaignRow';

export default class CampaignList extends Component {
  render() {
    const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    let rows;
    let spinner;

    if (this.props.isFetching === false) {
      rows = this.props.rows.map((row, index) =>
          <CampaignRow {...row} key={index}/>
      );
    } else {
      spinner = (<img src="./public/img/ajax-loader.gif"/>);
    }

    return (
      <div>
        <table className="table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Channel ID</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
          </thead>
          <ReactCSSTransitionGroup component="tbody" transitionName="fade" transitionLeave={false}>
            {rows}
          </ReactCSSTransitionGroup>
        </table>
        {spinner}
      </div>
    );
  }
}

CampaignList.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired
  }).isRequired).isRequired
};
