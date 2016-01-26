import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';

export default class TileDetails extends Component {
	render() {
		const data = this.props.Tile.details;

		let details;
		if (this.props.Tile.isFetching === false) {
			details = (
				<div className="details-panel">
					<div className="details-panel-header">
						<div className={'details-panel-status ' + ((data.paused) ? 'paused' : 'active')}>{(data.paused) ? 'PAUSED' : 'ACTIVE'}</div>
						<div className="table-cell">
							<h2 className="details-panel-name">{data.title}</h2>
							<div className="details-panel-id">ID: {data.id}</div>
						</div>

						<div className="details-edit-link">
							<Link className="" to={'/tiles/' + data.id + '/edit'} title="Edit">
								<i className="fa fa-pencil"></i>
							</Link>
						</div>
					</div>
					<div className="details-panel-body">
						<p><strong>Status:</strong> {_.capitalize(data.status)}</p>
						<p><strong>Position Priority:</strong> {_.capitalize(data.position_priority)}</p>
						<p><strong>Target Url:</strong> <a href={data.target_url} target="_blank">{data.target_url}</a></p>
						<p><strong>Enhanced Image URI:</strong> <a href={data.enhanced_image_uri} target="_blank">{data.enhanced_image_uri}</a></p>
						<p><strong>Image URI:</strong> <a href={data.image_uri} target="_blank">{data.image_uri}</a></p>
						<p><strong>BG Color:</strong> {(data.bg_color !== '' && data.bg_color !== null) ? <i className="fa fa-square" style={{color: data.bg_color}}></i> : '' } {data.bg_color}</p>
						<p><strong>Title BG Color:</strong> {(data.title_bg_color !== '' && data.title_bg_color !== null) ? <i className="fa fa-square" style={{color: data.title_bg_color}}></i> : '' }  {data.title_bg_color}</p>
						<p><strong>Type:</strong> {_.capitalize(data.type)}</p>
						<p><strong>Created:</strong> {formatDate(data.created_at, 'M/D/YYYY')}</p>
					</div>
				</div>
			);
		} else {
			details = <img src={__CONFIG__.WEBPACK_PUBLIC_PATH + 'public/img/ajax-loader-navy.gif'}/>;
		}

		return details;
	}
}

TileDetails.propTypes = {
	Tile: PropTypes.object.isRequired
};
