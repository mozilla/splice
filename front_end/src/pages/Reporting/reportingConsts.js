import moment from 'moment';

// Helper functions for displaying form data
function currency(n) {
  const nString = n * 100 + '';
  return `$${nString.slice(0, -1)}.${nString.slice(-2)}`;
}
function numberWithCommas(n) {
  if (!n) return 0;
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function add(a, b) {
  return a + b;
}

// This is a list of filters supported by the stats api
export const FILTERS = [
  'group_by',
  'campaign_id',
  'account_id',
  'start_date',
  'end_date',
  'adgroup_type',
  'channel_id',
  'country_code',
  'locale'
];

// This is the default settings for a report
export const DEFAULT_REPORT_SETTINGS = {
  account_id: null,
  campaign_id: null,
  group_by: ['date'],
  start_date: null,
  end_date: null,

  // Optional filters
  adgroup_type: null,
  channel_id: null,
  country_code: null,
  locale: null
};

// These are fields you are allowed to aggregate on
export const GROUP_BY_OPTIONS = [
  {value: 'date', label: 'Date'},
  {value: 'week', label: 'Week'},
  {value: 'month', label: 'Month'},
  {value: 'category', label: 'Category'},
  {value: 'locale', label: 'Locale'},
  {value: 'country_code', label: 'Country'}
];

// Field definitions for group by options
export const GROUP_BY_FIELDS = {
  date: {
    label: 'Date',
    format: function(date) {
      return moment(date, 'YYYY-MM-DD').format('MMM DD');
    }
  },
  week: {
    label: 'Week',
    format: function(week) {
      return `Week ${week}`;
    }
  },
  month: {
    label: 'Month',
    format: function(month) {
      return moment(month, 'MM').format('MMMM');
    }
  },
  category: {label: 'Category'},
  locale: {label: 'Locale'},
  country_code: {label: 'Country'}
};

// Base field definitions for all tables
export const BASE_FIELDS = [
  {
    label: 'Impressions',
    key: 'impressions',
    format: numberWithCommas,
    sum: add
  },
  {
    label: 'Clicks',
    key: 'clicks',
    format: numberWithCommas,
    sum: add
  },
  {
    label: 'CTR',
    key: 'ctr',
    raw: function(row) {
      return row.impressions ? (row.clicks / row.impressions) : 0;
    },
    format: function(ctr) {
      return `${Math.round(ctr * 10000) / 100}%`;
    },
    sum: add
  },
  {
    label: 'Pinned',
    key: 'pinned',
    format: numberWithCommas,
    sum: add
  },
  {
    label: 'Blocked',
    key: 'blocked',
    format: numberWithCommas,
    sum: (a, b) => a + b
  }
];

