import React, { Component, PropTypes } from 'react';
import CampaignRow from './CampaignRow';

export default class CampaignList extends Component {
  render() {
    const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

    let rows;
    let spinner;

    if (this.props.isFetching === false) {
      rows = this.props.rows.map((row, index) =>
          <CampaignRow {...row} key={index} channels={this.props.channels}/>
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
          <ReactCSSTransitionGroup component="tbody" transitionName="fade" transitionAppearTimeout={300} transitionEnterTimeout={300} transitionLeaveTimeout={300}>
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
    channel_id: PropTypes.number.isRequired,
    paused: PropTypes.bool.isRequired,
    created_at: PropTypes.string.isRequired
  }).isRequired).isRequired,
  channels: PropTypes.array.isRequired
};
