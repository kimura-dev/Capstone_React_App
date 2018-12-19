'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const localAuth = passport.authenticate('local', {session: false});
const jwtAuth = passport.authenticate('jwt', {session: false});
const bodyParser = require('body-parser');
const {Course} = require('./models');
const {User} = require('../users/models');

// const validateCourseInput = require('../validation/course');


// @route     GET api/course
// @desc      GET all courses
// @access    Public
// 10/23 works
router.get('/', (req, res) => {
  Course.find()
    .populate('user','username firstName lastName')
    .then(courses => {
      res.status(200).json(courses);
    }).catch(err => {
      res.status(500).json({err, message: 'Internal server error'});
    });
});

router.post('/process-payment', (req, res) => {
  // req.body will have some payment id and course id
  // if payment is valid then add token to user course
  // user will then need to purchase the course using that token /api/course/:id/purchase/:token

})

// @route     GET api/course/user/:username
// @desc      GET all the courses authored by a current user
// @access    Public
// Working
router.get('/author/:username', jwtAuth, (req, res) => {
  Course.find({username: req.params.username})
    .populate('user','username firstName lastName')
    .then(courses => {
      res.status(200).json(courses);
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
  // .populate('lessons') 
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
// Working       
router.post('/', jwtAuth, bodyParser.json(), (req, res) => {

  // const { errors, isValid } = validateCourseInput(req.body);

  // // Check Validation 
  // if (!isValid) {
  //   // Return any errors with 400 status
  //   return res.status(400).json(errors);
  // }

  // // Get fields 
  // const courseFields = {};
  // courseFields.user = req.user.id;
  // if (req.body.title) courseFields.title = req.body.title;
  // if (req.body.description) courseFields.description = req.body.description;
  // if (req.body.price) courseFields.price = req.body.price;


  const newCourse = {
    username: req.user.username,
    title: req.body.title,
    description: req.body.description,
    // lessons: req.body.lessons,
    price: req.body.price
  }
  
  // Create Course
  new Course(newCourse)
  // .populate('Lesson')
  .save()
  .then(course => {
    // Make all lessons then update the old course lessons with new course lessons
    let lessons = req.body.lessons.map(lesson => {
       lesson.courseId = course._id;
       return lesson;
    })
    return Lesson.insertMany( lessons ) 
      .then(lessons => {
        // add lessons to course
        course.lessons = lessons
        return course.save()
      })
      .then(course => {
        res.status(200).json(course);
      })
  }).catch(err => {
    console.log(err);
    res.status(422).json(err.message);
  });
});

// @route     POST api/course/:courseID/purchase/:token
// @desc      Purchase Course, then adds course to User.courses as an ID
// @access    Private
router.post('/:id/purchase/:token', jwtAuth, (req, res) => {

  Course.findById(req.params.id)
    .then(course => {

      User.findOne({ username: req.user.username })
      .then( user => {
        let found = user.courses.includes(course._id)
        if(found){
          throw new Error('Cannot purchase the same course twice');      
        }
        if(course.username === req.user.username) {
          throw new Error('Cannot purchase your own course');        
        }
  
        let token = req.params.token;
  
        if(!course.isValidToken(token)){
          throw new Error('Invalid purchase token')
        }
  
        course.consumeToken(token)
  
        return course.save()
        
        .then( course => {
          user.courses.push(course._id)
          return user.save()
        })  
        .then(user => {
          res.status(200).json(course)
        })
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
   
    res.status(200).json(data.serialize());
  }).catch((err) => {
    console.log(err);
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
// @desc      Remove Comment from Course
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
      res.status(200).json({message:'Succussfully deleted'});
    }).catch(err => {
      console.log(err);
      res.status(404).json(err);
    });
});

module.exports = router;