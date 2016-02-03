/*export const FILE_UPLOADED = 'FILE_UPLOADED';

 export function fileUploaded(files) {
 return {type: FILE_UPLOADED, files: files};
 }*/
import { saveRecentlyViewed } from 'actions/App/RecentlyViewedActions';

export const DISPLAY_MESSAGE = 'DISPLAY_MESSAGE';
export const SHOWN_MESSAGE = 'SHOWN_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';

export const LIST_TYPE_SELECT = 'LIST_TYPE_SELECT';

export const FORM_CHANGED = 'FORM_CHANGED';
export const FORM_SAVED = 'FORM_SAVED';

export const SAVE_LOCATION_LOG = 'SAVE_LOCATION_LOG';

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

export function formChanged(){
  return {type: FORM_CHANGED};
}

export function formSaved(){
  return {type: FORM_SAVED};
}

export function saveLocationLog(log) {
  return {type: SAVE_LOCATION_LOG, log: log};
}