const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const {ensureAuthenticated, ensurePublicOrOwner} = require('../auth');
const {Log} = require('./models');

// Log Index
router.get('/', (req, res) => {
  Log.find({status:'public'})
     .populate('user','username firstName lastName')
    .then(logs => {
      res.status(200).json(logs);
    }).catch(err => {
      res.status(500).json({message: 'Internal server error'});
    }); 
});
   
// Show Single Log
router.get('/:id', (req, res, next) => {
  Log.findOne({
    _id: req.params.id
  })
   .populate('user','username firstName lastName')
  .populate('comments.user')
  .then(log => {
    req.log = log;
    next();
  })
 }) //, ensurePublicOrOwner, (req, res) => {
//   res.json(req.log)
// });


// Logged in users logs
router.get('/', (req, res) => {
  Log.find({user: req.user.id})
    .populate('user','username firstName lastName')
    .then(logs => {
      res.status(200).json(logs);
    }).catch(err => {
      console.log(err);
      res.status(500).json({message:'Internal server error'});
    })
});

// Add Log Form
// router.post('/', (req, res) => {
//   res.status(200).json(logs);
//   .catch(err => {
//     console.log(err);
//     res.status(500).json({message:'Internal server error'});
//   });
// })

// Edit Log Form
router.put('/:id', (req, res) => {
  Log.findOne({
    _id: req.params.id
  })
  .then(log => {
    if(log.user != req.user.id){
      console.log(err);
      res.status().json({message:'Internal server error'});
    } else {
      res.status(200).json(log);
    }
  });
});
 

// Process Add Log
router.post('/', (req, res) => {
  const newLog = {
    category: req.body.title,
    status: req.body.status,
    user: req.user.id
  }

  // Create Log
  new Log(newLog)
    .save()
    .then(log => {
      res.status(200).json(log);
    }).catch(err => {
      console.log(err);
      res.status(500).json({message:'Internal server error'});
    })
});

// Edit Log Form Process
router.put('/:id', (req, res) => {
  Log.findOne({
    _id: req.params.id
  })
  .then(log => {
    // New values
    log.exercise = req.body.title; // Needs new logic
    log.status = req.body.status;
    log.save()
      .then(log => {
        res.status(200).json(log);
      }).catch(err => {
        console.log(err);
        res.status(500).json({message:'Internal server error'});
      });
  });
});

// Delete Log
router.delete('/:id', (req, res) => {
  Log.remove({_id: req.params.id})
    .then(() => {
      res.redirect('/dashboard');
    }); 
});

// Add Note
router.post('/:id/notes', (req, res) => {
  Log.findOne({
    _id: req.params.id
  })
  .then(log => {
    const newNotes = {
      exercise: req.body.title,
      notes: req.body.notes
    }

    // Add to notes array
    log.notes.unshift(newNotes);
    log.save()
      .then(log => {
        res.status(200).json(log);
      }).catch(err => {
        console.log(err);
        res.status(500).json({message:'Internal server error'});
      });
  });
});

// Add Rating
router.post('/:id/ratings', (req, res) => {
  Log.findOne({
    _id: req.params.id
  })
  .then(log => {
    const newRating = {
      ratingDate: req.body.ratingDate, // not sure if req.body will work for date
      ratingUser: req.user.id
    }

    // Add to Ratings Array
    log.ratings.unshift(newRatings);

    log.save()
      .then(log => {
        res.status(200).json(log);
      }).catch(err => {
        console.log(err);
        res.status(500).json({message:'Internal server error'});
      });
  });
});


module.exports = router;