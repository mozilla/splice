import React, { Component, PropTypes } from 'react';
import RecentlyViewedRow from './RecentlyViewedRow';

export default class RecentlyViewedList extends Component {
  render() {
    let output = null;
    let rows;
    if (this.props.recentlyViewedRows !== undefined && this.props.recentlyViewedRows.length > 0) {
      rows = this.props.recentlyViewedRows.map((recentlyViewedRow, index) =>
          <RecentlyViewedRow {...recentlyViewedRow} key={index}/>
      );

      output = (
        <div className="module">
          <div className="module-header">
            Recently Viewed
          </div>
          <table className="module-table">
            <tbody>
            {rows}
            </tbody>
          </table>
        </div>
      );
    }

    return output;
  }
}

RecentlyViewedList.propTypes = {
  recentlyViewedRows: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }).isRequired).isRequired
};
