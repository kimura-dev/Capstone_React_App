const mongoose = require('mongoose');


module.exports = function (schema, opts) {
  // Add Comment Data to schema
  schema.add({
    comments: [{
      body: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      user: String
    }]

  })

  schema.methods.addComment = function (data) {
    const newComment = {
      body: data.body,
      user: data.username
    }
    // Add to comments array
    this.comments.push(newComment);

    return this.save();
  }


}