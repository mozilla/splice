import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';

export default class AdGroupDetails extends Component {
  render() {
    const data = this.props.AdGroup.details;

    let categories = '';
    if(data.categories !== undefined && data.categories.length > 0){
      data.categories.map(function(val, index){
        if(index !== 0){
          categories += ', ';
        }
        categories += val;
      });
    }

    let details;
    if (this.props.AdGroup.isFetching === false) {
      details = (
        <div className="panel panel-default">
          <div className="panel-heading">
            <div className="pull-right">
              {(data.paused) ? 'PAUSED' : 'ACTIVE'}
            </div>
            <div className="pull-left">
              <div>{data.name} <Link to={'/adgroups/edit/' + data.id}> <i className="fa fa-pencil"></i></Link></div>
              <p>ID: {data.id}</p>
            </div>
            <div className="clearfix"></div>
          </div>
          <div className="panel-body">
            <p><strong>Categories:</strong> {categories}</p>
            <p><strong>Explanation:</strong> {data.explanation}</p>
            <p><strong>Frequency Cap Daily:</strong> {data.frequency_cap_daily}</p>
            <p><strong>Frequency Cap Total:</strong> {data.frequency_cap_total}</p>
            <p><strong>Locale:</strong> {data.locale}</p>
            <p><strong>Type:</strong> {_.capitalize(data.type)}</p>
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

AdGroupDetails.propTypes = {
  AdGroup: PropTypes.object.isRequired
};
