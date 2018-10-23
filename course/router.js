'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const localAuth = passport.authenticate('local', {session: false});
const jwtAuth = passport.authenticate('jwt', {session: false});
const bodyParser = require('body-parser');
const {Course} = require('./models');
const {User} = require('./models');

// @route     GET api/course
// @desc      GET all courses
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

// @route     GET api/course/user/:username
// @desc      GET all the courses authored by a current user
// @access    Public
// Working
router.get('/author/:username', jwtAuth, (req, res) => {
  Course.find({username: req.params.username})
    .populate('user','username firstName lastName')
    .then(courses => {
      res.status(200).json(courses);
      console.log('/course/user/:username : courses' + courses);
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
// Issue       
router.post('/', jwtAuth, (req, res) => {
  const newCourse = {
    username: req.user.username,
    title: req.body.title,
    description: req.body.description,
    lessons: req.body.lessons,
    price: req.body.price
  }
  
  // Create Course
  new Course(newCourse)
  .populate('Lesson')
  .save()
  .then(course => {
    console.log(course);
    res.status(200).json(course);
  }).catch(err => {
    console.log(err);
    res.status(422).json(err.message);
  });
});

// @route     POST api/course/:courseID/purchase
// @desc      Purchase Course
// @access    Private
router.post('/:id/purchase', jwtAuth, (req, res) => {
  Course.findById(req.params.id)
    .then(course => {
      // Add to timesPurchased on Course.timesPurchased
       
      // Add to User.courses[]
      return  User.findByIdAndUpdate (user.courses, {
        $push: { courses: course }
        
      }, { new: true }) 
      
      .then(user => {
        res.status(200).json(course)
      })
    })
    .catch(err => {
      console.log(err);
      res.status(422).json(err.message);
    });
})

// @route     PUT api/course/:id
// @desc      Edit Course
// @access    Private
router.put('/:id', jwtAuth, (req, res) => {
  Course.findByIdAndUpdate(req.params.id, {
      ...req.body
  }, {
    new: true 
  }).then((data) =>{
    // If no course deal with error
    if(!data){
      return res.status(400).json({message:'Course not found'});
    }
    console.log(data);
    res.status(200).json(data);
  }).catch((err) => {
    res.status(404).json(err);
  });
 
});

// @route     POST api/course/comment/:course_id
// @desc      ADD Comment to Lesson
// @access    Private
router.post('/comment/:id', jwtAuth, (req, res) => {
  Course.findById(req.params.id)
    .then(course => {
      const newComment = {
        body: req.body.body,
        // User is not showing up on comments
        user: req.user.username
      }

      course.addComment(newComment).then(course => res.json(course))
    })
    .catch(err => res.status(400).json(err.message));
});

// @route     DELETE api/course/comment/:course_id/:comment_id
// @desc      Remove Comment from Post
// @access    Private
router.delete('/comment/:id/:comment_id', jwtAuth, (req, res) => {
  Course.findById(req.params.id)
    .then(course => {
      let error = new Error('Comment not found');
      error.code = 401
      // Check to see if the comment exists
      if (course.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json(error);
      }

      // Get the comment to remove
      const removeIndex = course.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      // Splice out of array
      course.comments.splice(removeIndex, 1);

      // Save
      course.save().then(lesson => res.json(lesson));

    })
    .catch(err => res.status(400).json(err));
})


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