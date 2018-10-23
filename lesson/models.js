
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const LessonSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }
});

// LessonSchema.pre('find', function(next) {
//   this.populate('course');
//   next();
// });


LessonSchema.plugin(require('../plugins/comments'));


module.exports = Lesson = mongoose.model('Lesson', LessonSchema);