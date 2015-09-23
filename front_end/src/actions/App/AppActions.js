/*export const FILE_UPLOADED = 'FILE_UPLOADED';

 export function fileUploaded(files) {
 return {type: FILE_UPLOADED, files: files};
 }*/
import { saveRecentlyViewed } from 'actions/App/RecentlyViewedActions';

export const LIST_TYPE_SELECT = 'LIST_TYPE_SELECT';

export function updateDocTitle(title) {
  document.subTitle = title;
  document.title = 'Splice | ' + document.subTitle;
}

export function pageVisit(title, context) {
  updateDocTitle(title);
  saveRecentlyViewed(title, context);
}

export function listTypeSelect(value) {
  return {type: LIST_TYPE_SELECT, value: value};
}