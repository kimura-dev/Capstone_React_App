'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', {session: false});

// Profile Model
const Lesson = require('./models');

// @route     GET api/lesson
// @desc      GET lessons
// @access    Public
router.get('/', (req, res) => {
  Lesson.find()
    .then(lessons => res.json(lessons))
    .catch(err => {
      console.log(err)
      res.status(404).json(err)
    });
});

// @route     GET api/lesson/:id
// @desc      GET a single lesson by id
// @access    Public
router.get('/:id', jwtAuth, (req, res) => {
  Lesson.findById(req.params.id)
    .then(lesson => res.json(lesson))
    .catch(err => {
      console.log(err);
      res.status(404).json(err);
    });
});

// @route     POST api/lesson
// @desc      Create Lesson
// @access    Private
router.post('/', jwtAuth, (req, res, next) => {
  const newLesson = new Lesson({
    title: req.body.title,
    description: req.body.description
  });

  newLesson
    .save()
    .then(lesson => res.json(lesson))
    .catch(err =>  res.status(400).json(err.message))
});

// @route     Edit api/lesson/:id
// @desc      Edit Lesson
// @access    Private
router.put('/:id', jwtAuth, (req, res, next) => {
  Lesson.findByIdAndUpdate(req.params.id, {
      ...req.body
  }, {
    new: true 
  })
    .then((data) => res.status(200).json(data))
    .catch(err => res.status(404).json(err.message));
});

// @route     POST api/lesson/comment/:lesson_id
// @desc      ADD Comment to Lesson
// @access    Private
router.post('/comment/:id', jwtAuth, (req, res, next) => {
  Lesson.findById(req.params.id)
    .then(lesson => {
      const newComment = {
        body: req.body.body,
        user: req.user.username
      }

      lesson.addComment(newComment).then(lesson => res.json(lesson))
    })
    .catch(err => res.status(400).json(err.message));
});

// @route     DELETE api/lesson/comment/:lesson_id/:comment_id
// @desc      Remove Comment from Post
// @access    Private
router.delete('/comment/:id/:comment_id', jwtAuth, (req, res) => {
  Lesson.findById(req.params.id)
    .then(lesson => {
      // Check to see if the comment exists
      if (lesson.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({
          commentnotfound: 'Comment not found'
        });
      }

      // Get the comment to remove
      const removeIndex = lesson.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      // Splice out of array
      lesson.comments.splice(removeIndex, 1);

      // Save
      lesson.save().then(post => res.json(post));

    })
    .catch(err => res.status(400).json(err));
})

// @route     DELETE api/lesson/:id
// @desc      Delete Lesson
// @access    Private
router.delete('/:id', jwtAuth, (req, res, next) => {
  Lesson.findById(req.params.id)
    .then(lesson => {
      
      // Delete
      lesson.remove().then(() => res.json({
        success: true
      }));
    })
    .catch(err => {
      console.log(err)
      res.status(400).json(err);
    })
});


module.exports = router;