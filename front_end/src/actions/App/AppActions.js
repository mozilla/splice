/*export const FILE_UPLOADED = 'FILE_UPLOADED';

export function fileUploaded(files) {
	return {type: FILE_UPLOADED, files: files};
}*/
import { saveRecentlyViewed } from 'actions/App/RecentlyViewedActions';

export function updateDocTitle(title) {
	document.subTitle = title;
	document.title = 'Redux | ' + document.subTitle;
}

export function pageVisit(title, context) {
	updateDocTitle(title);
	saveRecentlyViewed(title, context);
}