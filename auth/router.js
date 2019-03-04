'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');

// Load Validation
const validateLoginInput = require('../validation/login');

const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};
 
const router = express.Router();

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());

// The user provides a username and password to login
router.post('/login', localAuth, (req, res) => {
  const {errors, isValid} = validateLoginInput(req.body)

  // Check validation
  if(!isValid) {
    return res.status(400).json(errors)
    console.log(errors)
  }

  const user = req.user.serialize();
  const authToken = createAuthToken(user);
  res.json({authToken, user});
})
// .catch(err => {
//   console.log(err);
//   res.status(422).json(err.message);
// });


const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const user = req.user;
  const authToken = createAuthToken(user);
  res.json({authToken, user});
});

module.exports = {router, createAuthToken};


