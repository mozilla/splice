import {
  GROUP_BY_FIELDS,
  BASE_FIELDS,
  FILTERS
} from './reportingConsts';

export function queryParser(query) {
  if (!query) return {};
  const output = {};
  FILTERS.forEach(key => {
    const value = query[key];
    if (!value) return;
    else if (['account_id', 'campaign_id'].indexOf(key) !== -1) output[key] = +value;
    else output[key] = value;
  });
  return output;
}

export function createFieldSet(groupBy) {
  if (!groupBy) return null;
  const fields = [];
  groupBy.forEach(field => {
    const groupByField = _.clone(GROUP_BY_FIELDS[field]);
    groupByField.key = field;
    fields.push(groupByField);
  });
  BASE_FIELDS.forEach(field => {
    fields.push(_.clone(field));
  });
  return fields;
}
