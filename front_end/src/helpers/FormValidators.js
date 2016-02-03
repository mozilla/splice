import Moment from 'moment';

export function bindFormConfig() {
  window.ParsleyConfig = {
    classHandler: function(elem, isRadioOrCheckbox){
      // specify where parsley error-success classes are set
      return $(elem.$element).parents('.form-group');
    },
    errorsContainer: function(elem, isRadioOrCheckbox){
      // specify where parsley error-success classes are set
      return $(elem.$element).parents('.form-group');
    },
    errorsWrapper: '<span class="help-block"></span>',
    errorTemplate: '<span class="text-danger"></span>',
    //successClass: 'has-success',
    errorClass: 'has-error',
    excluded: 'input[type=button], input[type=submit], input[type=reset], [disabled]'
  };
}

export function bindFormValidators() {
  if(window.ParsleyValidator.validators.dateformat === undefined){
    window.ParsleyValidator
      .addValidator('dateformat', function(value, requirement) {
        return Moment(value, 'YYYY-MM-DD', true).isValid();
      })
      .addMessage('en', 'dateformat', 'Invalid date format.');
  }

  if(window.ParsleyValidator.validators.filetype === undefined){
    window.ParsleyValidator
      .addValidator('filetype', function(value, requirement) {
        return value.split('.').pop().toLowerCase() === requirement;
      })
      .addMessage('en', 'filetype', 'Invalid file extension.');
  }
}