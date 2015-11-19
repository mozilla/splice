import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DateTime from 'react-datetime';

import {
  selectDate,
  selectChannel,
  selectLocale,
  selectType,
  fetchDistribution
} from '../actions/WebtilesPreviewer';
import Picker from '../components/Picker';
import Tiles from '../components/Tiles';

class WebtilesPreviewer extends Component {
  constructor(props) {
    super(props);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleLocaleChange = this.handleLocaleChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  componentDidMount() {
    const { dispatch, selectedDate } = this.props;
    dispatch(fetchDistribution(selectedDate));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedDate !== this.props.selectedDate) {
      this.props.dispatch(fetchDistribution(nextProps.selectedDate));
    }
  }

  handleDateChange(nextDate) {
    this.props.dispatch(selectDate(nextDate));
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

  render() {
    const {
      selectedDate,
      distribution,
      channels,
      locales,
      types,
      tiles,
      selectedChannel,
      selectedLocale,
      selectedType,
      errorMessage
    } = this.props;

    return (
      <div>
        <h1 className="ib">Distribution for</h1>
        <DateTime onChange={this.handleDateChange}
                  dateFormat="dddd, MMMM Do YYYY"
                  timeFormat={false}
                  value={selectedDate} />

        <div className="pickers">
          {selectedChannel &&
            <Picker title="Channel" value={selectedChannel}
                    onChange={this.handleChannelChange}
                    options={channels} />
          }

          {selectedLocale &&
            <Picker title="Country/Locale" value={selectedLocale}
                    onChange={this.handleLocaleChange}
                    options={locales} />
          }
          {selectedType &&
            <Picker title="Type" value={selectedType}
                    onChange={this.handleTypeChange}
                    options={types} />
          }

          {distribution.isLoaded && tiles &&
            tiles.length + ' tiles'
          }

          {distribution.isLoading &&
            <p className="info">Loading tiles...</p>
          }

          {errorMessage &&
            <p className="error">{errorMessage}</p>
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
  selectedDate: PropTypes.object.isRequired,
  distribution: PropTypes.object.isRequired,
  channels: PropTypes.array.isRequired,
  locales: PropTypes.array.isRequired,
  types: PropTypes.array.isRequired,
  tiles: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  selectedChannel: PropTypes.string,
  selectedLocale: PropTypes.string,
  selectedType: PropTypes.string,
  errorMessage: PropTypes.object,
};

function mapStateToProps(state) {
  const { selectedDate, distribution } = state.WebtilesPreviewer;
  const { selectedChannel, selectedLocale, selectedType, errorMessage } = distribution;
  const channels = Object.keys(distribution.channels);
  const locales = selectedChannel ? Object.keys(distribution.channels[selectedChannel]) : [];
  const types = ['suggested', 'directory'];
  var tiles = [];
  if (selectedChannel && selectedLocale && selectedType) {
    tiles = distribution.channels[selectedChannel][selectedLocale][selectedType];
  }

  return {
    selectedDate,
    distribution,
    channels,
    locales,
    types,
    selectedChannel,
    selectedLocale,
    selectedType,
    errorMessage,
    tiles
  };
}

export default connect(mapStateToProps)(WebtilesPreviewer);
