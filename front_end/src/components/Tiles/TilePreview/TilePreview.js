import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

require('./TilePreview.scss');

export default class TilePreview extends Component {
  render() {
    let output = (<div/>);
    if(this.props.Tile.details.image_uri){
      output = (
        <div className="tile-preview-container">
          <div className="tile-preview tile-default">
            <div className="tile-image" style={{backgroundColor: this.props.Tile.details.bg_color, backgroundImage: 'url(' + this.props.Tile.details.image_uri + ')' }}></div>
            <div className="tile-title" style={{backgroundColor: this.props.Tile.details.title_bg_color}}>{this.props.Tile.details.title}</div>
          </div>
          <div className="tile-preview tile-hover">
            <div className="tile-image" style={{backgroundColor: this.props.Tile.details.bg_color, backgroundImage: 'url(' + this.props.Tile.details.enhanced_image_uri + ')' }}></div>
            <div className="tile-title" style={{backgroundColor: this.props.Tile.details.title_bg_color}}>{this.props.Tile.details.title}</div>
          </div>
        </div>
      );
    }
    return output;
  }
}

TilePreview.propTypes = {
  Tile: PropTypes.object.isRequired
};
