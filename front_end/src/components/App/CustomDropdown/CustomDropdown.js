import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import './CustomDropdown.scss';

window.$ = require('jquery');

export default class CustomDropdown extends Component {
  constructor(props) {
    super(props);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  render() {
    return (
      <div className="custom-dropdown-wrapper">
        <div className="custom-dropdown">
          <div className="custom-dropdown-button" onClick={this.handleShowHide}>
            {this.props.selectedValue}
          </div>
          <div className="custom-dropdown-options" >
            {this.props.options.map((row, index) =>
              <div key={'custom-dropdown-' + index} className="custom-dropdown-option" data-key={row.key} data-value={row.val} onClick={this.handleOnChange}>{row.val}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  handleShowHide(e){
    const elem = $(e.target);
    if(elem.hasClass('active')){
      elem.removeClass('active');
      elem.siblings('.custom-dropdown-options').slideUp();
    }
    else{
      elem.addClass('active');
      elem.siblings('.custom-dropdown-options').slideDown();
    }
  }

  handleOnChange(e){
    const elem = $(e.target);
    const button = elem.parents('.custom-dropdown-options').siblings('.custom-dropdown-button');
    const options = elem.parents('.custom-dropdown-options');

    button.removeClass('active');
    button.html(elem.attr('data-value'));
    options.slideUp();

    if(this.props.onChange !== undefined){
      this.props.onChange(elem.attr('data-key'));
    }
  }
}

CustomDropdown.propTypes = {
  selectedKey: PropTypes.string.isRequired,
  selectedValue: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func
};
