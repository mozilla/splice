import React from 'react';
import moment from 'moment';

export default React.createClass({
  render: function() {
    const campaign = this.props.campaign;
    const query = this.props.query;
    return (<table hidden={this.props.hidden} className="table table-summary">
      <tbody>
        <tr>
          <td>Campaign</td>
          <td>{campaign.name}</td>
        </tr>
        <tr>
          <td>Reporting dates</td>
          <td>{this.formatDate(query.start_date)} – {this.formatDate(query.end_date)}</td>
        </tr>
        <tr>
          <td>Status</td>
          <td>{campaign.paused ? 'Paused' : 'Active'}</td>
        </tr>
      </tbody>
    </table>);
  },
  formatDate: function(date) {
    return moment(date, 'YYYY-MM-DD').format('MMM DD, YYYY');
  }
});
