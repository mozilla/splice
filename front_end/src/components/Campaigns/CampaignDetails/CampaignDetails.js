import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class CampaignDetails extends Component {
  render() {
    const data = this.props.Campaign.details;

    let details;
    if (this.props.Campaign.isFetching === false) {
      details = (
        <div className="panel panel-default">
          <div className="panel-heading">Campaign - {data.name}
            <Link to={'/campaigns/edit/' + data.id}> <i className="fa fa-pencil"></i></Link>
          </div>
          <div className="panel-body">
            <p>Campaign ID: {data.id}</p>

            <p>Channel: </p>

            <p>Type: </p>
          </div>
        </div>
      );
    } else {
      details = <img src="./public/img/ajax-loader.gif"/>;
    }

    return (<div>{details}</div>);
  }
}

CampaignDetails.propTypes = {
  Campaign: PropTypes.object.isRequired
};
