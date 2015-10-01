import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { selectChannel, fetchInitDataIfNeeded, loadDistributionFile } from '../actions/Authoring';

export default class Authoring extends Component {
  constructor(props) {
    super(props);
    this.handleChannelChange = this.handleChannelChange.bind(this);
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
  render () {
    return (
      <div>
        <h1>Authoring</h1>
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
