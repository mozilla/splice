import Moment from 'moment';

export function formatDate(dateValue, outputFormat) {
  let output;
  if(dateValue !== undefined){
    output = Moment(dateValue).utcOffset('+0000').format(outputFormat);
  }

  return output;
}

export function apiDate(dateValue) {
  return Moment(dateValue).format('YYYY-MM-DDT00:00:00+00:00');
}