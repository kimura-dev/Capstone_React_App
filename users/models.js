'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    min: 1,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    min: 6,
    max: 72,
    required: true
  },
  // unlocked: [{
  //   type: String,
  //   course: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Course'
  //   },
  //   videoViews: [Number]
  // }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  date: {
    type: Date,
    default: Date.now
  },
  // accountType: {
  //   type: String,
  //   default: 'student'
  // },
  firstName: {
    type: String, default: ''
  },
  lastName: {
    type: String, default: ''
  }
});

UserSchema.pre('find', function(next) {
  this.populate('course');
  next();
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };
