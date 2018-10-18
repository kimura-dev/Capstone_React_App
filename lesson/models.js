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
  video: {
    title: String,
    videoID: String,
    url: String,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }
});

LessonSchema.plugin(require('../plugins/comments'));


module.exports = Lesson = mongoose.model('Lesson', LessonSchema);