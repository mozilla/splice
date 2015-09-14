import React, { Component } from 'react/addons';
import { connect } from 'react-redux';

import { fetchAccounts } from 'actions/Accounts/AccountActions';
import { fetchRecentlyViewed, fileUploaded } from 'actions/AppActions';
import AccountList from 'components/Accounts/AccountList/AccountList';
import RecentlyViewedList from 'components/App/RecentlyViewed/RecentlyViewedList';
import Calendar from 'rc-calendar';
import 'rc-calendar/assets/index.css';

import GregorianCalendar from 'gregorian-calendar';
const date = new GregorianCalendar(); // defaults to en-us
date.setTime(+new Date('2015-09-14 13:00:00'));
//console.log(date.getDayOfWeek());

import Dropzone from 'react-dropzone';


export default class HomePage extends Component {
	componentDidMount() {
		const { dispatch } = this.props;
		if (this.props.Account.accountRows.length === 0) {
			dispatch(fetchAccounts());
		}

		dispatch(fetchRecentlyViewed());
	}

	render() {
		const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

		let filesMarkup;
		if (_.isEmpty(this.props.App.files) === false) {
			filesMarkup = this.props.App.files.map((file, index) =>
					<img src={file.preview} style={{width: '100px'}} key={'uploaded' + index}/>
			);
		} else {
			filesMarkup = '';
		}

		return (
			<div>
				<ReactCSSTransitionGroup transitionName="fadeIn" transitionAppear={true}>
					<h1>Dashboard</h1>

					<div><strong>Accounts</strong></div>
					<AccountList accountRows={this.props.Account.accountRows}
								 isFetchingAccounts={this.props.Account.isFetchingAccounts}/>
					<RecentlyViewedList recentlyViewedRows={this.props.App.recentlyViewed}/>
					<Calendar defaultValue={date} showToday={true} onSelect={this.handleDateSelect}/>
					<Dropzone onDrop={(files) => this.handleFileUpload(files) } multiple={false} style={
							{
								width: '100px',
								height: '100px',
								borderWidth: '2px',
								borderColor: '#666',
								borderStyle: 'dashed',
								borderRadius: '5px'
							}
						}>
						<div>Try dropping some a file here, or click to select a file to upload.</div>
					</Dropzone>
					{filesMarkup}
				</ReactCSSTransitionGroup>
			</div>
		);
	}

	handleDateSelect(gCal) {
		//console.log(new Date(gCal.getTime() ) );
	}

	handleFileUpload(files) {
		const { dispatch } = this.props;
		dispatch(fileUploaded(files));
	}
}

HomePage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
	return {
		Account: state.Account,
		App: state.App
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(HomePage);
