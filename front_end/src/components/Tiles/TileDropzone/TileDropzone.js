import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import Dropzone from 'react-dropzone';

require('./TileDropzone.scss');

export default class TileDropzone extends Component {
  render() {
    return (
      <Dropzone onDrop={(file) => this.props.handleFileUpload(file) } multiple={false} className="tile-dropzone">
        {(this.props.Tile.details[this.props.fieldName] === undefined || this.props.Tile.details[this.props.fieldName] === '') ?
          (<div>
            <div className="tile-text">Drag File Here</div>
            <div className="tile-text-or"> or </div>
            <div className="tile-upload-btn">Upload Image</div>
          </div>)
          :
          (<div className="tile-preview">
            <div className="tile-image" style={{backgroundColor: this.props.Tile.details.bg_color, backgroundImage: 'url(' + this.props.Tile.details[this.props.fieldName] + ')' }}></div>
            <div className="tile-title" style={{backgroundColor: this.props.Tile.details.title_bg_color}}>{this.props.Tile.details.title}</div>
          </div>)}
      </Dropzone>
    );
  }
}

TileDropzone.propTypes = {
  Tile: PropTypes.object.isRequired,
  fieldName: PropTypes.string.isRequired,
  handleFileUpload: PropTypes.func.isRequired
};
