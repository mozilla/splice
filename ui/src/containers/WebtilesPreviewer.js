import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { selectChannel, selectLocale, selectType, fetchLocalesIfNeeded, fetchTilesIfNeeded } from '../actions';
import Picker from '../components/Picker';
import Tiles from '../components/Tiles';

class WebtilesPreviewer extends Component {
  constructor(props) {
    super(props);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleLocaleChange = this.handleLocaleChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  componentDidMount() {
    const { dispatch, selectedChannel } = this.props;
    dispatch(fetchLocalesIfNeeded(selectedChannel));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedChannel !== this.props.selectedChannel) {
      const { dispatch, selectedChannel } = nextProps;
      dispatch(fetchLocalesIfNeeded(selectedChannel));
    } else if (nextProps.selectedLocale !== this.props.selectedLocale) {
      const { dispatch, selectedChannel, selectedLocale } = nextProps;
      dispatch(fetchTilesIfNeeded(selectedChannel, selectedLocale));
    }
  }

  handleChannelChange(nextChannel) {
    this.props.dispatch(selectChannel(nextChannel));
    this.props.dispatch(selectLocale(null));
    this.props.dispatch(selectType('directory'));
  }

  handleLocaleChange(nextLocale) {
    this.props.dispatch(selectLocale(nextLocale));
    this.props.dispatch(selectType('directory'));
  }

  handleTypeChange(nextType) {
    this.props.dispatch(selectType(nextType));
  }

  render() {
    const {
      selectedChannel,
      selectedLocale,
      selectedType,
      channels,
      locales,
      types,
      tiles
    } = this.props;

    return (
      <div>
        <h1>Live Tiles in Production</h1>
        <div id="pickers">
          <Picker title="Channel" value={selectedChannel}
                  onChange={this.handleChannelChange}
                  options={Object.keys(channels)} />

          {locales && selectedLocale &&
            <Picker title="Country/Locale" value={selectedLocale}
                    onChange={this.handleLocaleChange}
                    options={Object.keys(locales)} />
          }
          {selectedType &&
            <Picker title="Type" value={selectedType}
                    onChange={this.handleTypeChange}
                    options={types} />
          }

          {tiles &&
            tiles.length + ' tiles'
          }

          {!tiles &&
            'Loading...'
          }
        </div>

        {tiles && tiles.length > 0 &&
          <Tiles tiles={tiles} tilesType={selectedType} />
        }

      </div>
    );
  }
}

WebtilesPreviewer.propTypes = {
  selectedChannel: PropTypes.string.isRequired,
  selectedLocale: PropTypes.string,
  selectedType: PropTypes.string,
  channels: PropTypes.object.isRequired,
  locales: PropTypes.object,
  types: PropTypes.array.isRequired,
  tiles: PropTypes.array,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const { selectedChannel, selectedLocale, selectedType, channels } = state;
  const { locales } = channels[selectedChannel];
  const types = ['suggested', 'directory'];
  var tiles = [];
  if (selectedChannel && selectedChannel && selectedLocale &&
      state.channels[selectedChannel].locales) {
    tiles = state.channels[selectedChannel].locales[selectedLocale][selectedType + 'Tiles'];
  }

  return {
    selectedChannel,
    selectedLocale,
    selectedType,
    channels,
    locales,
    types,
    tiles
  };
}

export default connect(mapStateToProps)(WebtilesPreviewer);
