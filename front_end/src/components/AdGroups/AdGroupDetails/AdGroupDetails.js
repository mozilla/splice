import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class AdGroupDetails extends Component {
  render() {
    const data = this.props.AdGroup.details;

    let details;
    if (this.props.AdGroup.isFetching === false) {
      details = (
        <div className="panel panel-default">
          <div className="panel-heading">Ad Group - {data.name}
            <Link to={'/adgroups/edit/' + data.id}> <i className="fa fa-pencil"></i></Link>
          </div>
          <div className="panel-body">
            <p>Ad Group ID: {data.id}</p>

            <p>Category: </p>

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

AdGroupDetails.propTypes = {
  AdGroup: PropTypes.object.isRequired
};
