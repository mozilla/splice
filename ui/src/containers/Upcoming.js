import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
  selectChannel,
  selectLocale,
  selectType,
  fetchInitDataIfNeeded,
  unscheduleDistribution,
  previewDistribution
} from '../actions/Upcoming';
import Picker from '../components/Picker';
import Tiles from '../components/Tiles';

export default class Authoring extends Component {
  constructor(props) {
    super(props);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleLocaleChange = this.handleLocaleChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleUnschedule = this.handleUnschedule.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchInitDataIfNeeded());
  }

  componentWillReceiveProps(nextProps) {
  }

  handleChannelChange(nextChannel) {
    this.props.dispatch(selectChannel(nextChannel));
  }

  handleLocaleChange(nextLocale) {
    this.props.dispatch(selectLocale(nextLocale));
  }

  handleTypeChange(nextType) {
    this.props.dispatch(selectType(nextType));
  }

  handleUnschedule(distributionId) {
    var handler = ev => {
      ev.preventDefault();
      this.props.dispatch(unscheduleDistribution(distributionId));
    };
    handler.bind(this);
    return handler;
  }

  handlePreview(distribution) {
    var handler = ev => {
      ev.preventDefault();
      this.props.dispatch(previewDistribution(distribution));
    };
    handler.bind(this);
    return handler;
  }

  render () {
    const {
      selectedChannel,
      selectedChannelId,
      selectedLocale,
      selectedType,
      initData,
      distribution,
      types,
      tiles
    } = this.props;

    // Get the list of distributions we want to show.
    var distributionsListed = [];
    if (selectedChannelId in initData.distributions) {
      distributionsListed = initData.distributions[selectedChannelId];
    }

    return (
      <div>
        {initData.isFetching &&
          <p className="status">Loading init data...</p>
        }

        {initData.errorMessage &&
          <p className="error">{initData.errorMessage}</p>
        }

        {initData.isLoaded &&
          <div id="env" className={initData.env + ' container'}>
            <label>Environment:</label>
            <span>{initData.env}</span>
          </div>
        }

        {initData.isLoaded &&
          <div className="container distributions">
            <h2>Upcoming Distributions:</h2>

            <Picker title="Channel" value={selectedChannel}
                    onChange={this.handleChannelChange}
                    options={initData.channels.map(x => x.name)} />

            {distributionsListed.length + ' '} upcoming distributions

            <table>
              <thead>
                <tr>
                  <th>id</th>
                  <th>schedule</th>
                  <th>actions</th>
                </tr>
              </thead>
              <tbody>
                {distributionsListed.map(function(val, i){
                  return (
                    <tr key={val.id}>
                      <td className="id">
                        {val.id}
                      </td>
                      <td className="scheduled">
                        {val.scheduled_at}
                      </td>
                      <td className="actions">
                        <a href="#" onClick={this.handleUnschedule(val.id)}>unschedule</a>
                        <button className="nice" onClick={this.handlePreview(val)}>preview</button>
                      </td>
                    </tr>
                  );
                }, this)}
              </tbody>
            </table>

          </div>
        }

        <div className="container">
          {distribution.isLoading &&
            <p className="status">Loading the distribution...</p>
          }

          {distribution.errorMessage &&
            <p className="error">{distribution.errorMessage}</p>
          }
        </div>


        <div className="container">
          {distribution.isLoaded &&
            <h2>Preview: (distribution id={distribution.distributionId}: {distribution.scheduled})</h2>
          }

          {selectedLocale &&
            <Picker title="Country/Locale" value={selectedLocale}
                    onChange={this.handleLocaleChange}
                    options={Object.keys(distribution.tiles.ui)} />
          }
          {selectedType &&
            <Picker title="Type" value={selectedType}
                    onChange={this.handleTypeChange}
                    options={types} />
          }

          {distribution.isLoaded && tiles &&
            tiles.length + ' tiles'
          }

          {tiles && tiles.length > 0 &&
            <Tiles tiles={tiles} tilesType={selectedType} />
          }
        </div>
      </div>
    );
  }
}

Authoring.propTypes = {
  selectedChannel: PropTypes.string.isRequired,
  selectedChannelId: PropTypes.number,
  selectedLocale: PropTypes.string,
  selectedType: PropTypes.string,
  initData: PropTypes.object.isRequired,
  distribution: PropTypes.object.isRequired,
  tiles: PropTypes.array,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const { selectedChannel, initData, distribution } = state.Upcoming;
  const { selectedLocale, selectedType } = distribution;
  const types = ['suggested', 'directory'];
  var tiles = [];
  if (selectedChannel && selectedLocale && selectedType &&
      distribution.tiles.ui.hasOwnProperty(selectedLocale)) {
    tiles = distribution.tiles.ui[selectedLocale][selectedType + 'Tiles'];
  }

  var selectedChannelId = initData.channels && initData.channels.find(
    (element, index, array) => {
      return element.name === selectedChannel;
    }
  );
  selectedChannelId = selectedChannelId && selectedChannelId.id;

  return {
    selectedChannel,
    selectedChannelId,
    selectedLocale,
    selectedType,
    initData,
    distribution,
    types,
    tiles
  };
}

export default connect(mapStateToProps)(Authoring);
