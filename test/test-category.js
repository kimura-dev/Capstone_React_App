const chai = require("chai");
const chaiHttp = require("chai-http");
const {User} = require('../users');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');

const expect = chai.expect;

const { app, runServer, closeServer } = require("../server");

chai.use(chaiHttp);

function expectCategory(category) {
  expect(category).to.be.a("object");
  expect(category).to.include.keys(
    "id",
    "title",
    "description",
    "status",
    "username",
    "videos",
    "comments",
    "user"
  );
}

describe("Category", function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  let token = '';
  const username = 'exampleUser';

  beforeEach(function(){
    const password = 'examplePass';
    const firstName = 'Example';
    const lastName = 'User';

    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
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
      .get("/api/categories")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.above(0);
        const categories  = res.body;
        categories.forEach(expectCategory);
      });
  });

  it("should add a category on POST", function() {
    const newCategory = {
      title: "Lorem ip some",
      description: "foo foo foo foo",
      status: "Public",
      videos: [{title:"Video Title", url:"http://example@example.com", videoID:'3452qtyz'}]
    };
    const expectedKeys = ["id"].concat(Object.keys(newCategory));
    const expectedVideoKeys = ["_id"].concat(Object.keys(newCategory.videos[0]));

    return chai
      .request(app)
      .post("/api/categories")
      .set('authorization', `Bearer ${token}`)
      .send(newCategory)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("object");
        expect(res.body).to.include.keys(expectedKeys);
        expect(res.body.videos).to.be.a('array');
        expect(res.body.videos).to.have.lengthOf(1);
        expect(res.body.videos[0]).to.include.keys(expectedVideoKeys);
        expect(res.body.title).to.equal(newCategory.title);
        expect(res.body.description).to.equal(newCategory.description);
        expect(res.body.status).to.equal(newCategory.status);
        expect(res.body.username).to.equal(username);
      });
  });

  it("should error if POST missing expected values", function() {
    const badRequestData = {};
    return chai
      .request(app)
      .post("/api/categories")
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

  it("should update category on PUT", function() {
    return (
      chai
        .request(app)
        // first have to get
        .get("/api/categories")
        .then(function(res) {
          const updatedPost = Object.assign(res.body[0], {
            title: "connect the dots",
            description: "la la la la la"
          });
          return chai
            .request(app)
            .put(`/api/categories/${res.body[0].id}`)
            .set('authorization', `Bearer ${token}`)
            .send(updatedPost)
            .then(function(res) {
              expect(res).to.have.status(200);
            });
        })
    );
  });

  it("should add a video", function(){
    return (
      chai
        .request(app)
        .get('/api/categories')
        .then(function(res) {
          const category = res.body[0];
          const video = {
            title: "connect the dots",
            videoID: "345edfghsd",
            url:"http://example@example.com"
          };

          const expectedKeys = Object.keys(video)
          expectedKeys.push('_id');
         
          category.videos.push(video);

          return chai
          .request(app)
          .put(`/api/categories/${category.id}`)
          .set('authorization', `Bearer ${token}`)
          .send(category)
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res.body.videos).to.be.an('array');
            expect(res.body.videos).to.be.an('array');
            expect(res.body.videos.length).to.be.greaterThan(0);

            const lastVideo = res.body.videos[res.body.videos.length-1];

            expect(lastVideo).to.be.an('object');
            expect(lastVideo).to.include.keys(expectedKeys);
            expect(lastVideo.title).to.equal(video.title);
            expect(lastVideo.videoID).to.equal(video.videoID);
            expect(lastVideo.url).to.equal(video.url);
          });
        })
    )
  })

  it("should delete category on DELETE", function() {
    return (
      chai
        .request(app)
        // first have to get
        .get("/api/categories")
        .then(function(res) {
          return chai
            .request(app)
            .delete(`/api/categories/${res.body[0].id}`)
            .set('authorization', `Bearer ${token}`)
            .then(function(res) {
              expect(res).to.have.status(200);
            });
        })
    );
  });
});

