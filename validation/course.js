const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateCourseInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.description = !isEmpty(data.company) ? data.company : '';
  data.price = !isEmpty(data.from) ? data.from : '';

  if (Validator.isEmpty(data.title)) {
    errors.title = 'Course title field is required';
  }

  if (Validator.isEmpty(data.company)) {
    errors.description = 'Description field is required';
  }

  if (Validator.isEmpty(data.from)) {
    errors.price = 'A price field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
