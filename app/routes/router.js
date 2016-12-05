var router = require('express').Router();
var userController = require('../controllers/UserController');
var eventController = require('../controllers/EventController');
var newsfeedController = require('../controllers/NewsfeedController');
var jwt = require('jsonwebtoken');
var secret = require('../config/Secret');
var imageUploader = require('../helpers/Tools').imageUploader();
var path = require('path');

//ZKH - ******PUBLIC ROUTES******

//ZKH - GET
router.get('/', function (req, res) {
  res.send('Welcome to EverestBack');
});


/**
 * Sign in user api end point at {ip}:3000/signInUser
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "Email" : "",
 *                "Password" : ""
 *              }
 * @return user._id or error
 */
router.post('/signInUser', (req, res) => {
  userController.signInUser(req, res);
});


/**
 * Sign up user api end point at {ip}:3000/createNewUser
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "Email" : "",
 *                "Password" : ""
 *              }
 * @return user._id or error
 */
router.post('/createNewUser', (req, res) => {
  userController.createNewUser(req, res);
});


/**
 * Add additional user information api end point at
 * {ip}:3000/setUserProfileFields?id={user._id}
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "FirstName" : "",
 *                "LastName" : ""
 *              }
 * @paramObject {jpg} image [optional]
 * @return status 200 or error
 */
router.post('/setUserProfileFields', (req, res) => {
  userController.addUserProfileFields(req, res);
});


//SKU - This route is subject to change
/**
 * Create event api end point at {ip}:3000/createEvent
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "EventName" : "",
 *                "Description" : "",
 *                "Location": "",
 *                "StartTime": {DateTime},
 *                "EndTime" : {DateTime},
 *                "EventQuestions" : [],
 *                "UserId" : "_id"
 *               }
 * @return void or error
 */
router.post('/createEvent', (req, res) => {
  eventController.createEvent(req, res);
});


/**
 * Retrieve admin event api end point at {ip}:3000/Event/{EventObjectID}?key={AdminKey}
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return void or error
 */
router.get('/Event/:event', (req, res) => {
  eventController.getEventDescription(req, res);
});


//SKU - This route is probably useless.
/**
 * Upload Image api end point at {ip}:3000/uploadImage
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return void or error
 */
router.post('/uploadImage', function (req, res) {
  imageUploader(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.end("Error uploading file.");
    }
    res.end("File is uploaded");
  });
});

//ZKH - ******END PUBLIC ROUTES******


//ZKH - ******PROTECTED ROUTES******

router.get('/api/token', function (req, res) {
  var token = jwt.sign({foo: 'bar'}, secret);
  res.send({token: token});
});

router.get('/api/protected', function (req, res) {
  res.send('Welcome to /api/protected route.');
});

//ZKH - ******END PROTECTED ROUTES******


//ZKH - ******TESTING ROUTES*********


/**
 * Get all users api end point at {ip}:3000/testing/getAllUsers
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return Json hash of users or error
 */
router.get('/testing/getAllUsers', function (req, res) {
  userController.testingGetAllUsers(req, res);
});


/**
 * Newsfeed testing page end point at {ip}:3000/testing/newsfeed
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return Web page of platform to test newsfeed
 */
router.get('/testing/newsfeed', (req, res) => {
  let joinedPath = path.join(__dirname +
    '/../../test_clients/newsfeed_client/newsfeed_client.html');
  let normalizedPath = path.normalize(joinedPath);
  res.sendFile(normalizedPath);
});


/**
 * Get all newsfeed api end point at {ip}:3000/testing/getAllNewsfeeds
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return Json hash of newsfeed or error
 */
router.get('/testing/getAllNewsfeeds', (req, res) => {
  newsfeedController.testingGetAllNewsfeeds(req, res);
});


/**
 * Create new event api end point at {ip}:3000/testing/createNewEvent
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "EventName" : "",
 *                "Description" : "",
 *                "Location": "",
 *                "StartTime": {DateTime},
 *                "EndTime" : {DateTime},
 *                "EventQuestions" : {  "Skills" : "" ,
 *                                      "Interests" : "" }
 *               }
 * @return Json hash of newsfeed or error
 */
router.post('/testing/createNewEvent', (req, res) => {
  eventController.testingCreateEvent(req, res);
});

//ZKH - ******END TESTING ROUTES******


/**
 * Add Router to global module object
 * @constructor
 */
module.exports = router;