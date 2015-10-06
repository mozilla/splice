import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';

export default class TileDetails extends Component {
	render() {
		const data = this.props.Tile.details;

		let details;
		if (this.props.Tile.isFetching === false) {
			details = (
				<div className="panel panel-default">
					<div className="panel-heading">
						<div className="pull-right">
							{(data.paused) ? 'PAUSED' : 'ACTIVE'}
						</div>
						<div className="pull-left">
							<div>{data.title}<Link to={'/adgroups/edit/' + data.id}> <i className="fa fa-pencil"></i></Link></div>
							<p>ID: {data.id}</p>
						</div>
						<div className="clearfix"></div>
					</div>
					<div className="panel-body">
						<p><strong>Status:</strong> {_.capitalize(data.status)}</p>
						<p><strong>Url:</strong> {data.target_url}</p>
						<p><strong>Type:</strong> {_.capitalize(data.type)}</p>
						<p><strong>Enhanced Image URI:</strong> {data.enhanced_image_uri}</p>
						<p><strong>Image URI:</strong> {data.image_uri}</p>
						<p><strong>BG Color:</strong> {data.bg_color}</p>
						<p><strong>Title BG Color:</strong> {data.title_bg_color}</p>
						<p><strong>Created:</strong> {formatDate(data.created_at, 'M/D/YYYY')}</p>
					</div>
				</div>
			);
		} else {
			details = <img src="./public/img/ajax-loader.gif"/>;
		}

		return (<div>{details}</div>);
	}
}

TileDetails.propTypes = {
	Tile: PropTypes.object.isRequired
};
