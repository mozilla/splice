import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import './CustomRadio.scss';

window.$ = require('jquery');

export default class CustomRadio extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    return (
      <div className="custom-radio-wrapper">
        <div className="custom-radio">
          <div className="custom-radio-options" >
            {this.props.options.map((row, index) =>
              <div className="custom-radio-option" key={'custom-radio-' + index}>
                <label htmlFor={this.props.inputName + index}>
                 <i className={'custom-radio-icon ' + ((row.id === this.props.selected) ? 'active' : '') }>
                 </i>
                 {_.capitalize(row.name)}
                </label>
                <input type="radio" name={this.props.inputName} id={this.props.inputName + index} className="custom-radio-input" onChange={this.handleChange} value={row.id} defaultChecked={(row.id === this.props.selected)} data-parsley-required/>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  handleChange(e){
    const elem = $(e.target);
    const button = elem.parents('.custom-radio-option');
    const options = elem.parents('.custom-radio-options');

    options.find('.custom-radio-icon.active').removeClass('active');
    button.find('.custom-radio-icon').addClass('active');

    if(this.props.handleChange !== undefined){
      this.props.handleChange(elem.attr('data-key'));
    }
  }
}

CustomRadio.propTypes = {
  inputName: PropTypes.string.isRequired,
  selected: PropTypes.number,
  options: PropTypes.array.isRequired,
  handleChange: PropTypes.func
};
