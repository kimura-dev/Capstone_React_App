const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateLessonInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  data.videoUrl = !isEmpty(data.videoUrl) ? data.videoUrl : '';

  if (Validator.isEmpty(data.title)) {
    errors.title = 'Course title field is required';
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = 'Description field is required';
  }

 if(!isEmpty(data.videoUrl)){
   if(!validator.isURL(data.videoUrl)){
     errors.videoUrl = 'Not a valid URL';
   }
 }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
