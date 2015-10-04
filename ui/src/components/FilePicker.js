import React, { Component, PropTypes } from 'react';

export default class FilePicker extends Component {
  render() {
    const { title, value, onChange } = this.props;

    return (
      <span>
        <label>{title + ':'}</label>
        <input type="file" onChange={e => onChange((e.srcElement || e.target).files[0])} />
      </span>
    );
  }
}

FilePicker.propTypes = {
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
