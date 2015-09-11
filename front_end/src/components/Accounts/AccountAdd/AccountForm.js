import React, { Component, PropTypes, findDOMNode } from 'react';

export default class AccountForm extends Component {
	render() {
		return (
			<div>
				<input type="text" ref="input" onKeyDown={(e) => this.handleEnter(e)}/>
				<input type="submit" value="Add" onClick={(e) => this.handleSubmit(e)}/>
				{(this.props.isSavingAccount) ? <img src="./public/img/ajax-loader.gif"/> : ''}
			</div>
		);
	}

	handleSubmit(e) {
		e.preventDefault();
		//Using lodash to check if Object is empty
		if (!_.isEmpty(this.refs.input)) {
			const node = findDOMNode(this.refs.input);
			const data = {text: node.value.trim()};
			this.props.onAddClick(data);
			node.value = '';
		}
	}

	handleEnter(e) {
		const text = e.target.value.trim();
		if (e.which === 13) {
			this.handleSubmit(e);
		}
	}
}

AccountForm.propTypes = {
	onAddClick: PropTypes.func.isRequired,
	isSavingAccount: PropTypes.bool.isRequired
};
