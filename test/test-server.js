"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const {app, runServer, closeServer} = require("../server.js");
const {TEST_DATABASE_URL} = require('../config');
const expect = chai.expect;

chai.use(chaiHttp);


describe("index page", function() {
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });
  
  after(function () {
    return closeServer();
  });
  
  it("should exist", function() {
    return chai
      .request(app)
      .get("/")
      .then(function(res) {
        expect(res).to.have.status(200);
      });
  });
});


