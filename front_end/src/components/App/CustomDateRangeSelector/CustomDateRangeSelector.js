import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatDate, apiDate } from 'helpers/DateHelpers';
import Moment from 'moment';

import './CustomDateRangeSelector.scss';

window.$ = require('jquery');
window.jQuery = $;
require('eonasdan-bootstrap-datetimepicker');
require('eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css');

export default class CustomDateRangeSelector extends Component {
  constructor(props) {
    super(props);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.setDateRange = this.setDateRange.bind(this);
  }

  componentDidMount(){
    const context = this;
    const options = {
      useCurrent: true,
      format: 'YYYY-MM-DD',
      showTodayButton: true
    };

    $('.custom-date-range .date-input').datetimepicker(options);
  }

  getSelectedValue(value){
    let text;
    if(value === '30days'){
      text = 'Last 30 days';
    }
    else if(typeof value === 'object'){
      if(value.start_date && value.end_date){
        text = value.start_date + ' to ' + value.end_date;
      }
      else if(value.start_date){
        text = 'After ' + value.start_date;
      }
      else if(value.end_date){
        text = 'Before ' + value.end_date;
      }
    }

    return text;
  }

  render() {
    return (
      <div className="custom-date-range-wrapper">
        <div className="custom-date-range">
          <div className="custom-date-range-button" onClick={this.handleShowHide}>
            {this.getSelectedValue(this.props.selectedKey)}
          </div>
          <div className="custom-date-range-options" >
            <div key="30days" className="custom-date-range-option" data-key="30days" data-value="Last 30 Days" onClick={this.handleOnChange}>Last 30 Days</div>
            <div>
              <div className="date-input-group">
                <input className="date-input" name="start_date" placeholder="Start Date"/>
                <input className="date-input" name="end_date" placeholder="End Date"/>
                <input className="apply-btn" type="button" value="Set Date Range" onClick={this.setDateRange}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleShowHide(e){
    const elem = $(e.target);
    if(elem.hasClass('active')){
      elem.removeClass('active');
      elem.siblings('.custom-date-range-options').slideUp();
    }
    else{
      elem.addClass('active');
      elem.siblings('.custom-date-range-options').slideDown();
    }
  }

  handleOnChange(e){
    const elem = $(e.target);
    const button = elem.parents('.custom-date-range-options').siblings('.custom-date-range-button');
    const options = elem.parents('.custom-date-range-options');

    button.removeClass('active');
    button.html(elem.attr('data-value'));
    options.slideUp();

    if(this.props.onChange !== undefined){
      this.props.onChange(elem.attr('data-key'));
    }
  }

  setDateRange(e){
    const elem = $(e.target);
    const button = elem.parents('.custom-date-range-options').siblings('.custom-date-range-button');
    const options = elem.parents('.custom-date-range-options');
    const startInput = elem.parents('.date-input-group').find('input[name="start_date"]');
    const endInput = elem.parents('.date-input-group').find('input[name="end_date"]');

    button.removeClass('active');

    const text = this.getSelectedValue({start_data: startInput.val(), end_date: endInput.val()});

    if(text !== null) {
      button.html(text);

      if(this.props.onChange !== undefined){
        this.props.onChange({start_date: startInput.val(), end_date: endInput.val()});
      }
    }

    options.slideUp();
  }
}

CustomDateRangeSelector.propTypes = {
  onChange: PropTypes.func
};
