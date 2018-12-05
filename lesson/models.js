
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
  // duration: {
  //   value: Number,
  //   default: 0
  // },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
});

// LessonSchema.pre('find', function(next) {
//   this.populate('course');
//   next();
// });

LessonSchema.methods.serialize = function() {
  return {
    title: this.title,
    description: this.description,
    videoUrl: this.videoUrl,
    courseId: this.courseId.serialize ? this.courseId.serialize() : this.courseId
  }
}



LessonSchema.plugin(require('../plugins/comments'));


module.exports = Lesson = mongoose.model('Lesson', LessonSchema);