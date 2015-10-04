import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { selectChannel, fetchInitDataIfNeeded, loadDistributionFile } from '../actions/Authoring';
import FilePicker from '../components/FilePicker';

export default class Authoring extends Component {
  constructor(props) {
    super(props);
    this.handleChannelChange = this.handleChannelChange.bind(this);
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

  handleNewDistribution(file) {
    this.props.dispatch(loadDistributionFile(file));
  }

  render () {
    return (
      <div>
        <h1>Authoring</h1>
        <FilePicker title="Load a new distribution from file" onChange={this.handleNewDistribution} />
      </div>
    );
  }
}

Authoring.propTypes = {
  selectedChannel: PropTypes.string.isRequired,
  initData: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  const { selectedChannel, initData } = state.Authoring;

  return {
    selectedChannel,
    initData
  };
}

export default connect(mapStateToProps)(Authoring);
