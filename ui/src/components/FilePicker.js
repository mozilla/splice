import React, { Component, PropTypes } from 'react';

export default class FilePicker extends Component {
  render() {
    const { title, onChange, disabled } = this.props;

    return (
      <span>
        <label>{title + ':'}</label>
        <input type="file"
               onChange={e => onChange((e.srcElement || e.target).files[0])}
               disabled={disabled}/>
      </span>
    );
  }
}

FilePicker.propTypes = {
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};
