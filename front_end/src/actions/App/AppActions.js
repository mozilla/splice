/*export const FILE_UPLOADED = 'FILE_UPLOADED';

 export function fileUploaded(files) {
 return {type: FILE_UPLOADED, files: files};
 }*/
import { saveRecentlyViewed } from 'actions/App/RecentlyViewedActions';

export const DISPLAY_MESSAGE = 'DISPLAY_MESSAGE';
export const SHOWN_MESSAGE = 'SHOWN_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';

export const LIST_TYPE_SELECT = 'LIST_TYPE_SELECT';

export function updateDocTitle(title) {
  document.subTitle = title;
  document.title = 'Splice | ' + document.subTitle;
}

export function pageVisit(title, context) {
  updateDocTitle(title);
  saveRecentlyViewed(title, context);
}

export function displayMessage(messageType, message){
  return {
    type: DISPLAY_MESSAGE,
    messageType: messageType,
    messageBody: message
  };
}

export function shownMessage(){
  return {
    type: SHOWN_MESSAGE
  };
}

export function removeMessage(){
  return {
    type: REMOVE_MESSAGE
  };
}

export function listTypeSelect(value) {
  return {type: LIST_TYPE_SELECT, value: value};
}

