import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class TileDetails extends Component {
	render() {
		const data = this.props.Tile.details;

		let details;
		if (this.props.Tile.isFetching === false) {
			details = (
				<div className="panel panel-default">
					<div className="panel-heading">Tile - {data.title}
						<Link to={'/adgroups/edit/' + data.id}> <i className="fa fa-pencil"></i></Link>
					</div>
					<div className="panel-body">
						<p>Tile ID: {data.id}</p>
						<p>Url: {data.target_url}</p>
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
