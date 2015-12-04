import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { getCountry } from 'actions/Init/InitActions';

window.$ = require('jquery');

export default class CampaignCountries extends Component {
  render() {
    const context = this;

    let countries = null;
    const preCountries = [];
    const postCountries = [];
    if(this.props.countries !== undefined && this.props.countries !== null &&
      this.props.initCountries !== undefined && this.props.initCountries !== null){
      this.props.countries.map(function(val, index){
        const country = getCountry(val, context.props.initCountries);
        if(country) {
          if(index <= 2){
            preCountries.push(country.country_name);
          }
          else{
            postCountries.push(country.country_name);
          }
        }
      });

      countries = (
        <span>
          {preCountries.join(', ')}
          {(postCountries.length > 0 )
            ? (<span>
                 , <a href="#" className="countries-expand" onClick={this.handleCountriesExpand}>...</a>
                 <span className="hide"> {postCountries.join(', ')} </span>
               </span>)
            : null
          }
        </span>
      );
    }

    return countries;
  }

  handleCountriesExpand(e){
    e.preventDefault();
    const elem = $(e.target);

    elem.next().removeClass('hide');
    elem.remove();
  }
}

CampaignCountries.propTypes = {
  countries: PropTypes.array,
  initCountries: PropTypes.array
};
