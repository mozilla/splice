export function getAccountId(props){
	let accountId = null;
	if(props.Account.accountDetails.id !== undefined){
		accountId = props.Account.accountDetails.id;
	}
	else if(props.location.query.accountId !== undefined){
		accountId = props.location.query.accountId;
	}
	else {
		/*const { dispatch } = props;

		dispatch(fetchAccount(accountId)).then(() => {
			pageVisit('Account - ' + this.props.Account.accountDetails.name, this);
			dispatch(fetchCampaigns(this.props.Account.accountDetails.id));
		});*/
	}
	return accountId;
}