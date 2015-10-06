import Moment from 'moment';

export function formatDate(dateValue, outputFormat) {
  return Moment(dateValue).utcOffset('+0000').format(outputFormat);
}

export function apiDate(dateValue) {
  return Moment(dateValue).format('YYYY-MM-DDT00:00:00+00:00');
}