import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

require('./TilePreview.scss');

export default class TilePreview extends Component {
  render() {
    let output = (<div/>);
    if(this.props.Tile.details.image_uri){
      output = (
        <div>
          <div className="tiles-container">
            <div className="tile-preview-container tile-default" >
              <div className="tile-preview">
                <div className="tile-image" style={{backgroundColor: this.props.Tile.details.bg_color, backgroundImage: 'url(' + this.props.Tile.details.image_uri + ')' }}></div>
                <div className="tile-title" style={{backgroundColor: this.props.Tile.details.title_bg_color}}>{this.props.Tile.details.title}</div>
              </div>
              <p className="tile-description">Tile Preview</p>
            </div>
            <div className="tile-preview-container tile-hover">
              <div className="tile-preview">
                <div className="tile-image" style={{backgroundColor: this.props.Tile.details.bg_color, backgroundImage: 'url(' + this.props.Tile.details.enhanced_image_uri + ')' }}></div>
                <div className="tile-title" style={{backgroundColor: this.props.Tile.details.title_bg_color}}>{this.props.Tile.details.title}</div>
              </div>
              <p>Rollover Preview</p>
            </div>
          </div>
          <div className="tile-status-buttons">
            <input type="submit" className="btn disapprove" value="Disapprove" onClick={() => this.props.handleDisapprove()}/>
            <input type="submit" className="btn approve" value="Approve" onClick={() => this.props.handleApprove()}/>
          </div>
        </div>
      );
    }
    return output;
  }
}

TilePreview.propTypes = {
  Tile: PropTypes.object.isRequired,
  handleApprove: PropTypes.func.isRequired,
  handleDisapprove: PropTypes.func.isRequired
};
