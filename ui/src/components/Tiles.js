import React, { PropTypes, Component } from 'react';

export default class Tiles extends Component {
  render() {
    var rows = [];
    var tilesType = this.props.tilesType;
    this.props.tiles.forEach(function(webtile) {
      var thumbStyle = {
        backgroundImage: 'url(' + webtile.imageURI + ')'
      };
      var enhancedThumbStyle = {
        backgroundImage: 'url(' + webtile.enhancedImageURI + ')'
      };
      var frecent = [];
      if (tilesType === 'suggested') {
        webtile.frecent_sites.forEach(function(url){
          frecent.push(
            <li>{url}</li>
          );
        });
      }
      rows.push(
        <div key={webtile.directoryId} className="newtab-cell">
          <div className={'newtab-site ' + tilesType} type={webtile.type}>
            <a className="newtab-link" href={webtile.url} title={webtile.title}>
              <span className="newtab-thumbnail" style={thumbStyle}></span>
              <span className="newtab-thumbnail enhanced-content" style={enhancedThumbStyle}></span>
              <span className="newtab-title">{webtile.title}</span>
            </a>
            <span className="newtab-suggested">
              <span className="newtab-suggested-bounds">
                {webtile.explanation}
              </span>
            </span>
          </div>
          {tilesType === 'suggested' &&
            <div className="frecent-sites">
              <strong>Frecent Sites:</strong>
              <ul>
                {frecent}
              </ul>
            </div>
          }
        </div>
      );
    });

    return (
      <div id="newtab-grid">
        {rows}
      </div>
    );
  }
}

Tiles.propTypes = {
  tiles: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      imageURI: PropTypes.string.isRequired,
      enhancedImageURI: PropTypes.string,
      type: PropTypes.string,
      url: PropTypes.string.isRequired,
      frecent_sites: PropTypes.arrayOf(PropTypes.string),
      explanation: PropTypes.string
    })
  ).isRequired,
  tilesType: PropTypes.string
};
