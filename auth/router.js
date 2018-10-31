'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');

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

// Create a New User
router.post('/users', localAuth, (req, res) => {
  const user = req.user.serialize();
  const authToken = createAuthToken(req.user.serialize());
  res.json({authToken});
});
// The user provides a username and password to login
router.post('/login', localAuth, (req, res) => {
  const user = req.user.serialize();
  const authToken = createAuthToken(user);
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const user = req.user;
  const authToken = createAuthToken(user);
  res.json({authToken, user});
});

module.exports = {router, createAuthToken};


