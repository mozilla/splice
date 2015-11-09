import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import './CustomRadio.scss';

window.$ = require('jquery');

export default class CustomRadio extends Component {
  constructor(props) {
    super(props);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  render() {
    return (
      <div className="custom-radio-wrapper">
        <div className="custom-radio">
          <div className="custom-radio-options" >
            {this.props.options.map((row, index) =>
              <div className="custom-radio-option" key={'custom-radio-' + index}>
                <label htmlFor={this.props.inputName + index}>
                {(row.id === this.props.selected)
                  ? <i className="fa fa-circle" ></i>
                  : <i className="fa fa-circle-thin" ></i>
                }
                 {_.capitalize(row.name)}
                </label>
                <input type="radio" name={this.props.inputName} id={this.props.inputName + index} className="custom-radio-input" onChange={this.handleOnChange} value={row.id} defaultChecked={(row.id === this.props.selected)} data-parsley-required/>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  handleOnChange(e){
    const elem = $(e.target);
    const button = elem.parents('.custom-radio-option');
    const options = elem.parents('.custom-radio-options');

    options.find('i.fa-circle').removeClass('fa-circle').addClass('fa-circle-thin');
    button.find('i.fa').removeClass('fa-circle-thin').addClass('fa-circle');

    if(this.props.onChange !== undefined){
      this.props.onChange(elem.attr('data-key'));
    }
  }
}

CustomRadio.propTypes = {
  inputName: PropTypes.string.isRequired,
  selected: PropTypes.number,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func
};
