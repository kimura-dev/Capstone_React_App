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
  },
  date: {
    type: Date,
    default: Date.now
  },
}, {
  toJSON: {
    virtuals: true
  }
});

CourseSchema.pre('findOne', function(next) {
  this.populate('user lessons');
  next();
});

CourseSchema.virtual('user', {
  ref: 'User',
  localField: 'username',
  foreignField: 'username',
  justOne: true
});

CourseSchema.methods.serialize = function() {
  return {
    _id: this._id || '',
    username: this.username || '',
    title: this.title || '',
    description: this.description || '',
    lessons: this.lessons || [],
    timesPurchased: this.timesPurchased || [],
    price: this.price || 0,
    user: this.user && this.user.serialize() 
  };
};

CourseSchema.plugin(require('../plugins/comments'));
CourseSchema.plugin(require('../plugins/purchaseTokens'));


const Course = mongoose.model('Course', CourseSchema);


module.exports = {
  Course
};