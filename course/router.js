'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const localAuth = passport.authenticate('local', {session: false});
const jwtAuth = passport.authenticate('jwt', {session: false});
const bodyParser = require('body-parser');
const {Course} = require('./models');

// @route     GET api/course
// @desc      GET courses
// @access    Public
router.get('/', (req, res) => {
  Course.find()
    .populate('user','username firstName lastName')
    .then(courses => {
      console.log(courses);
      res.status(200).json(courses);
    }).catch(err => {
      res.status(500).json({err, message: 'Internal server error'});
    });
});

// @route     GET api/course/my
// @desc      GET all current users courses
// @access    Public
router.get('/my', jwtAuth, (req, res) => {
  Course.find({username: req.user.username})
    .populate('user','username firstName lastName')
    .then(courses => {
      res.status(200).json(courses);
      console.log('/my : ctaegories' +courses);
    }).catch(err => {
      console.error(err);
      res.status(500).json({message:'Internal server error'});
    });
});

// @route     GET api/course/:id
// @desc      GET a single course by id
// @access    Public
router.get('/:id', (req, res) => {
  Course.findOne({
    _id: req.params.id
  }) 
  // .populate('user','username firstName lastName') // user is returning null
  // .populate('comments.user','username firstName lastName') 
  .then(course => { 
   res.status(200).json(course);
  }).catch(err => {
    console.error(err);
    res.status(404).json(err);
  });
});

// @route     POST api/course
// @desc      Create Course
// @access    Private
router.post('/', jwtAuth, (req, res) => {
  const newCourse = {
    user: req.user,
    // username: req.user.username,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price
  }
  // Create Course
  new Course(newCourse)
  .save()
  .then(course => {
    console.log(course);
    res.status(200).json(course);
  }).catch(err => {
    console.log(err);
    res.status(400).json(err);
  });
});

// @route     PUT api/course/:id
// @desc      Edit Course
// @access    Private
router.put('/:id', jwtAuth, (req, res) => {
  Course.findByIdAndUpdate(req.params.id, {
      ...req.body
  }, {
    new: true 
  }).then((data) =>{
    console.log(data);
    res.status(200).json(data);
  }).catch((err) => {
    res.status(404).json(err);
  });
 
});

// @route     DELETE api/course/:id
// @desc      Delete Course
// @access    Private
router.delete('/:id', jwtAuth,  (req, res) => {
  Course.remove({_id: req.params.id})
    .then(() => {
      console.log(req.params.id);
      res.status(200).json({message:'Succussfully deleted'});
    }).catch(err => {
      console.log(err);
      res.status(404).json(err);
    });
});

module.exports = router;