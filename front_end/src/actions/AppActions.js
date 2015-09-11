import Cookie from 'react-cookie';

export const GET_RECENTLY_VIEWED = 'GET_RECENTLY_VIEWED';

export const FILE_UPLOADED = 'FILE_UPLOADED';

export function fileUploaded(files) {
	return {type: FILE_UPLOADED, files: files};
}

function getRecentlyViewed(recentlyViewed) {
	return {type: GET_RECENTLY_VIEWED, recentlyViewed: recentlyViewed};
}

export function fetchRecentlyViewed() {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		const recentlyViewed = Cookie.load('recentlyViewed');
		dispatch(getRecentlyViewed(recentlyViewed));
	};
}

export function updateDocTitle(title) {
	document.subTitle = title;
	document.title = 'Redux | ' + document.subTitle;
}

export function saveRecentlyViewed(title, context) {
	//Limit recentlyViewed
	const limit = 10;
	let recents = Cookie.load('recentlyViewed');

	if (recents === undefined) {
		recents = [];
	}

	const url = context.props.location.pathname;

	//No duplicates allowed, so remove it and push a new one.
	recents.map((row, index) => {
		if (row.url === url) {
			recents.splice(index, 1);
			return false;
		}
	});

	recents.unshift({title: title, url: context.props.location.pathname});

	if (recents.length > limit) {
		recents = recents.slice(0, limit);
	}

	//Save Cookie for 7 days.
	Cookie.save('recentlyViewed', recents, {maxAge: 7 * 24 * 60 * 60});

	//Cookie.remove('recentlyViewed');
}

export function pageVisit(title, context) {
	updateDocTitle(title);
	saveRecentlyViewed(title, context);
}