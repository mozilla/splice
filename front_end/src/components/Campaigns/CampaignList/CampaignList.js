import React, { Component, PropTypes } from 'react';
import CampaignRow from './CampaignRow';

export default class CampaignList extends Component {
  render() {
    let rows;
    let spinner;

    if (this.props.isFetching === false) {
      rows = this.props.rows.map((row, index) =>
          <CampaignRow {...row} key={index} init_channels={this.props.init_channels} init_countries={this.props.init_countries}/>
      );
    } else {
      spinner = (<img src={__CONFIG__.WEBPACK_PUBLIC_PATH + 'public/img/ajax-loader-navy.gif'}/>);
    }

    return (
      <div className="module">
        <table className="module-table data-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Channel</th>
            <th>Countries</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
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
    countries: PropTypes.array.isRequired,
    paused: PropTypes.bool.isRequired,
    start_date: PropTypes.string.isRequired,
    end_date: PropTypes.string.isRequired
  }).isRequired).isRequired,
  init_channels: PropTypes.array.isRequired,
  init_countries: PropTypes.array.isRequired
};
