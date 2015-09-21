import React, { Component, PropTypes } from 'react';
import CampaignRow from './CampaignRow';

export default class CampaignList extends Component {
	render() {
		let rows;
		if (this.props.isFetchingCampaigns === false) {
			rows = this.props.campaignRows.map((campaignRow, index) =>
					<CampaignRow {...campaignRow} key={index}/>
			);
		} else {
			rows = (
				<tr>
					<td><img src="./public/img/ajax-loader.gif"/></td>
				</tr>
			);
		}

		return (
			<table className="table">
				<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>Status</th>
					<th>Created</th>
				</tr>
				</thead>
				<tbody>{rows}

				</tbody>
			</table>
		);
	}
}

CampaignList.propTypes = {
	campaignRows: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
		status: PropTypes.string.isRequired,
		created_at: PropTypes.string.isRequired
	}).isRequired).isRequired
};
