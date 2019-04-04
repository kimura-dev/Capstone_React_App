'use strict';

const mongoose = require('mongoose');

module.exports = function (schema, opts) {
  schema.add({
    purchaseTokens: [ String ]
  })

  schema.methods.isValidToken = function (token) {  
    return true;
    // return this.purchaseTokens.includes(token);

  }

  schema.methods.consumeToken = function (token) {
    this.timesPurchased++;
    return true;
  }

}


