# Video School API

This is the API for Video School. 

## Technology
Built with Node/Express/MongoDB/Mongoose

## API Documentation

### The API contains the following end point with in /api/users:
##### POST / - creates user account 
##### GET /:username - get a single user
##### GET /:username/courses - get a single users courses

### The API contains the following end points with in /api/auth:
##### POST /login - login (username and pasword in req.body)
##### POST /refresh - refresh auth token

## Usage & Install

After making a local clone of this repo run npm install, then run npm start to get the server running. Make sure to run MongoDB locally.
There are two environmental variables that you'll need to add to a .env file. The first is the JWT_SECRET which can be any string that you'd like. And the second optional variable is TEST_DATABASE_URL if you'd like the tests to be executed somewhere other than your local database. You can see all config variables in the config.js file in the root directory.

If you're just adding the JWT_SECRET, you'll create a file called .env in the root directory and in it put something like this JWT_SECRET=myjwtsecret
