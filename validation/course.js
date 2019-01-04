const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateCourseInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  data.price = (data.price >= 0) ? data.price : 0;


 
  if (Validator.isEmpty(data.title)) {
    errors.title = 'Course title field is required';
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = 'Description field is required';
  }

  // if (data.price < 0) {
  //   errors.price = 'A price field is required';
  // }

  
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

