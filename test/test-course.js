const chai = require("chai");
const chaiHttp = require("chai-http");
const {User} = require('../users');
const {TEST_DATABASE_URL} = require('../config');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');

const expect = chai.expect;

const { app, runServer, closeServer } = require("../server");

chai.use(chaiHttp);

function expectCourse(course) {
  expect(course).to.be.a("object");
  expect(course).to.include.keys(
    "id",
    "title",
    "description",
    "price",
    "username",
    "lessons",
    "timesPurchased",
    "user"
  );
}

describe("Course", function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  let token = '';
  const username = 'exampleUser';

  beforeEach(function(){
    const email = 'exampleUser@example.com';
    const password = 'examplePass';
    const firstName = 'Example';
    const lastName = 'User';

    return User.hashPassword(password).then(password =>
      User.create({
        username,
        email,
        password,
        // unlocked,
        firstName,
        lastName
      })).then(() => {
        
        token = jwt.sign(
          {
            user: {
              username,
              firstName,
              lastName
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: username,
            expiresIn: '7d'
          }
        );
      });
  })

  afterEach(function() {
    return User.remove({});
  });



  it("should add a course on POST", function() {
    const newCourse = {
      // username: "exampleUser",
      title: "Lorem ip some",
      description: "foo foo foo foo",
      price: 5,
      timesPurchased: 0
    };
    const expectedKeys = ["id"].concat(Object.keys(newCourse));
    
    return chai
      .request(app)
      .post("/api/course")
      .set('authorization', `Bearer ${token}`)
      .send(newCourse)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("object");
        expect(res.body).to.include.keys(expectedKeys);
        expect(res.body.title).to.equal(newCourse.title);
        expect(res.body.description).to.equal(newCourse.description);
        expect(res.body.price).to.equal(newCourse.price);
        expect(res.body.timesPurchased).to.equal(newCourse.timesPurchased);
        expect(res.body.username).to.equal(username);
      });
  });

  it("should error if POST missing expected values", function() {
    const badRequestData = {};
    return chai
      .request(app) 
      .post("/api/course")
      .set('authorization', `Bearer ${token}`)
      .send(badRequestData)
      .then(function(res) {
        expect.fail(null, null, 'Request should not succeed')
      }).catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }
        const res = err.response;
        expect(res).to.have.status(422);
      })
  });

  it("should list items on GET", function() {
    return chai
      .request(app)
      .get("/api/course")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.above(0);
        const courses  = res.body;
        courses.forEach(expectCourse);
      });
  });

  it("should update course on PUT", function() {
    return (
      chai
        .request(app)
        // first have to get
        .get("/api/course")
        .then(function(res) {
          const updatedCourse = Object.assign(res.body[0], {
            title: "connect the dots",
            description: "la la la la la"
          });
          return chai
            .request(app)
            .put(`/api/course/${res.body[0].id}`)
            .set('authorization', `Bearer ${token}`)
            .send(updatedCourse)
            .then(function(res) {
              expect(res).to.have.status(200);
            });
        })
    );
  });

  it("should delete course on DELETE", function() {
    return (
      chai
        .request(app)
        // first have to get
        .get("/api/course")
        .then(function(res) {
          return chai
            .request(app)
            .delete(`/api/course/${res.body[0].id}`)
            .set('authorization', `Bearer ${token}`)
            .then(function(res) {
              expect(res).to.have.status(200);
            });
        })
    );
  });
});

