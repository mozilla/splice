import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
  selectChannel,
  selectLocale,
  selectType,
  fetchInitDataIfNeeded,
  loadDistributionFile,
  setPublishDate,
  setDeployNow,
  publishDistribution } from '../actions/Authoring';
import FilePicker from '../components/FilePicker';
import Picker from '../components/Picker';
import Tiles from '../components/Tiles';
import DateTime from 'react-datetime';
import moment from 'moment';

export default class Authoring extends Component {
  constructor(props) {
    super(props);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleLocaleChange = this.handleLocaleChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleNewDistribution = this.handleNewDistribution.bind(this);
    this.handlePublishDateChange = this.handlePublishDateChange.bind(this);
    this.handleDeployNowChange = this.handleDeployNowChange.bind(this);
    this.handlePublish = this.handlePublish.bind(this);
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

  handlePublishDateChange(momentObj) {
    this.props.dispatch(setPublishDate(momentObj));
  }

  handleDeployNowChange(event) {
    this.props.dispatch(setDeployNow(event.target.checked));
  }

  handlePublish() {
    this.props.dispatch(publishDistribution());
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

    const yesterday = moment().subtract(1, 'day');
    function isValidDate(current) {
      return current.isAfter(yesterday);
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
          <div>
            <div id="env" className={initData.env + ' container'}>
              <label>Environment:</label>
              <span>{initData.env}</span>
            </div>

            <div id="distribution-picker" className="container">
              <Picker title="Channel" value={selectedChannel}
                      onChange={this.handleChannelChange}
                      options={initData.channels.map(x => x.name)} />

              <FilePicker title="Load a new distribution from file" onChange={this.handleNewDistribution} />
            </div>
          </div>
        }

        <div className="container">
          {distribution.isLoading &&
            <p className="status">Loading the distribution...</p>
          }

          {distribution.errorMessage &&
            <p className="error">{distribution.errorMessage}</p>
          }

          {distribution.isLoaded &&
            <div>
              <h2>Publish:</h2>

              <div>
                <label>Datetime:</label>
                <DateTime isValidDate={isValidDate}
                          onChange={this.handlePublishDateChange}
                          dateFormat="dddd, MMMM Do YYYY,"
                          timeFormat="h:mma (UTCZ)"
                          value={distribution.scheduled} />
              </div>

              {distribution.scheduled === '' &&
                <div>
                  <label>Deploy Now:</label>
                  <input type="checkbox" checked={distribution.deployNow} onChange={this.handleDeployNowChange} />
                </div>
              }

              <button className="publish" onClick={this.handlePublish}>Publish</button>
            </div>
          }

          {distribution.isPublishing &&
            <p className="status">Compressing and publishing the distribution...</p>
          }


          {distribution.publishResults &&
            <p className="success">Publish successful!</p>
          }
        </div>

        <div className="container">
          {distribution.publishResults &&
            <div>
              <h2>Results:</h2>

              <label>Deployed:</label>
              <span>{distribution.publishResults.deployed ? 'Yes' : 'No'}</span>

              <br/>

              <label>URLs:</label>
              <ul>
                {distribution.publishResults.urls.map(function(val, i){
                    return (
                      <li>
                        <strong>{val[1] ? 'New' : 'Cached'}</strong>
                        <a href={val[0]}>{val[0]}</a>
                      </li>
                    );
                })}
              </ul>

            </div>
          }
        </div>

        <div className="container">
          {distribution.isLoaded &&
            <h2>Preview:</h2>
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
