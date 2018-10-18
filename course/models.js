'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Shema
const CourseSchema = new Schema({
  username: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  price: {
    type: Number,
    default: 0
  },
  timesPurchased: {
    value: Number,
    default: 0
  }
}, {
  toJSON: {
    virtuals: true
  }
});

CourseSchema.virtual('user', {
  ref: 'User',
  localField: 'username',
  foreignField: 'username',
  justOne: true
});

CourseSchema.plugin(require('../plugins/comments'));

const Course = mongoose.model('Course', CourseSchema);


module.exports = {
  Course
};