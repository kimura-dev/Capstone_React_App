const chai = require("chai");
const chaiHttp = require("chai-http");
const {User} = require('../users');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');

const expect = chai.expect;

const { app, runServer, closeServer } = require("../server");

chai.use(chaiHttp);

function expectLesson(lesson) {
  expect(lesson).to.be.a("object");
  expect(lesson).to.include.keys(
    "id",
    "title",
    "description",
    "videoUrl",
    "courseId"
  );
}

describe("Lesson", function() {
  before(function() {
    return runServer();
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


  it("should list items on GET", function() {
    return chai
      .request(app)
      .get("/api/lesson")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.above(0);
        const lessons  = res.body;
        lessons.forEach(expectLesson);
      });
  });

  it("should add a lesson on POST", function() {
    const newLesson = {
      title: "Lorem ip some",
      description: "foo foo foo foo",
      videoUrl: "http://examplevideoUrl.com"
    };

    const expectedKeys = ["id"].concat(Object.keys(newLesson));
 
    // const expectedLessonKeys = ["_id"].concat(Object.keys(newCourse.lessons[0]));

    return chai
      .request(app)
      .post("/api/lesson")
      .set('authorization', `Bearer ${token}`)
      .send(newLesson)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(course_id).to.be.a('string');
        expect(res.body).to.be.a("object");
        expect(res.body).to.include.keys(expectedKeys);
        expect(res.body.title).to.equal(newLesson.title);
        expect(res.body.description).to.equal(newLesson.description);
        expect(res.body.videoUrl).to.equal(newLesson.videoUrl);
      });
  });

  it("should error if POST missing expected values", function() {
    const badRequestData = {};
    return chai
      .request(app) 
      .post("/api/lesson")
      .set('authorization', `Bearer ${token}`)
      .send(badRequestData)
      .then(function(res) {
        expect.fail(null, null,  'Request should not succeed')
      }).catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }
        const res = err.response;
        expect(res).to.have.status(422);
      })
  });

  it("should update lesson on PUT", function() {
    return (
      chai
        .request(app)
        // first have to get
        .get("/api/lesson")
        .then(function(res) {
          const updatedLesson = Object.assign(res.body[0], {
            title: "connect the dots",
            description: "la la la la la"
          });
          return chai
            .request(app)
            .put(`/api/lesson/${res.body[0].id}`)
            .set('authorization', `Bearer ${token}`)
            .send(updatedLesson)
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
        .get("/api/lesson")
        .then(function(res) {
          return chai
            .request(app)
            .delete(`/api/lesson/${res.body[0].id}`)
            .set('authorization', `Bearer ${token}`)
            .then(function(res) {
              expect(res).to.have.status(200);
            });
        })
    );
  });
});

