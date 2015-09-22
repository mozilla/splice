import Moment from 'moment';

export function formatPsDateTime(dateValue, outputFormat){
	return Moment(dateValue, 'dddd, D MMM YYYY HH:mm:ss ZZ').format(outputFormat);
}