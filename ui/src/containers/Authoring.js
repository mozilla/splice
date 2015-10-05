import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { selectChannel, selectLocale, selectType, fetchInitDataIfNeeded, loadDistributionFile } from '../actions/Authoring';
import FilePicker from '../components/FilePicker';
import Picker from '../components/Picker';
import Tiles from '../components/Tiles';

export default class Authoring extends Component {
  constructor(props) {
    super(props);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleLocaleChange = this.handleLocaleChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleNewDistribution = this.handleNewDistribution.bind(this);
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

  handleNewDistribution(file) {
    this.props.dispatch(loadDistributionFile(file));
  }

  render () {
    const {
      selectedChannel,
      selectedLocale,
      selectedType,
      initData,
      distribution,
      types,
      tiles
    } = this.props;

    return (
      <div>
        <h1>Authoring</h1>

        {initData.isFetching &&
          <p className="status">Loading init data...</p>
        }

        {initData.errorMessage &&
          <p className="error">{initData.errorMessage}</p>
        }

        {initData.isLoaded &&
          <div>
          <Picker title="Channel" value={selectedChannel}
                  onChange={this.handleChannelChange}
                  options={initData.channels.map(x => x.name)} />

          <FilePicker title="Load a new distribution from file" onChange={this.handleNewDistribution} />
          </div>
        }

        {distribution.isLoading &&
          <p className="status">Loading the distribution...</p>
        }

        {distribution.errorMessage &&
          <p className="error">{distribution.errorMessage}</p>
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
    );
  }
}

Authoring.propTypes = {
  selectedChannel: PropTypes.string.isRequired,
  selectedLocale: PropTypes.string,
  selectedType: PropTypes.string,
  initData: PropTypes.object.isRequired,
  distribution: PropTypes.object.isRequired,
  tiles: PropTypes.array,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const { selectedChannel, initData, distribution } = state.Authoring;
  const { selectedLocale, selectedType } = distribution;
  const types = ['suggested', 'directory'];
  var tiles = [];
  if (selectedChannel && selectedLocale && selectedType &&
      distribution.tiles.ui.hasOwnProperty(selectedLocale)) {
    tiles = distribution.tiles.ui[selectedLocale][selectedType + 'Tiles'];
  }

  return {
    selectedChannel,
    selectedLocale,
    selectedType,
    initData,
    distribution,
    types,
    tiles
  };
}

export default connect(mapStateToProps)(Authoring);
