//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/User');

var imageUploader = require('../helpers/Tools').imageUploader();
var fs = require('fs');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;


/**
 * User mongoose model initializer
 * @constructor
 * @param {User}
 */
var User = mongoose.model('User');


/**
 * UserController Initializer
 * @constructor
 */
var UserController = this;


/**
 * Check whether the given email address and password are valid. If valid, return user_id
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return {ObjectID} respond with user._id or error
 */
UserController.signInUser = (req, res) => {
  if (req.body.Email !== null && req.body.Email !== '' &&
    req.body.Password !== null && req.body.Password !== '') {

    User.findOne({Email: req.body.Email}, (err, user) => {
      if (err || !user) {
        console.log(err);
        res.status(400);
        res.send({'error': 'The Email or Password entered is incorrect'});
      } else {
        user.comparePassword(req.body.Password, function (err, isMatch) {
          if (err || !isMatch) {
            if (err) console.log(err);
            res.status(400);
            res.send({'error': 'The Email or Password entered is incorrect'});
          } else {
            user.LatestLoginTimestamp = Date.now();
            user.save((err) => {
              if (err) {
                console.log(err);
                res.status(400);
                res.send({'error': err.toString()});
              } else {
                res.status(200);
                res.send({
                  '_id': user._id,
                  'FirstName': user.FirstName,
                  'LastName': user.LastName,
                  'ProfileImageURL': user.ProfileImageURL
                });
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400);
    res.send({'error': 'The Email or Password entered is incorrect'});
  }
};


//SKU - Should we safe guard against extra parameters that could be sent?
/**
 * Add User object to users collections
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return {ObjectID} Respond with user._id or error
 */
UserController.createNewUser = (req, res) => {
  //SKU - Initialize User object with associated with mongoose model.
  console.log(req);
  var user = new User(req.body);
  //SKU - If the request does not have email && password, return 500 error.
  if (user.Email !== null && user.Password !== null) {
    user.OriginTimestamp = Date.now();
    //SKU - Add user object to the users Collection
    user.save((err) => {
      if (err) {
        console.log(err);
        res.status(400);
        res.send({'error': err.toString()});
      } else {
        res.status(200);
        res.send({'_id': user._id});
      }
    });
  } else {
    res.status(400);
    res.send();
  }
};


/**
 * Add additional fields to the User object already created in users collections
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return {status} respond with 200 or error
 */
UserController.addUserProfileFields = (req, res) => {

  //SKU - If the URL has the correct parameter, return object. Else return 404
  if (req.query.id !== null && req.query.id.length == 24) {

    imageUploader(req, res, (err) => {

      if (err) {
        res.status(500);
        res.end(err);
      }

      //SKU - Initialize User object with associated with mongoose model.
      var user = new User(req.body);
      //SKU - If the request does not have email && password, return 500 error.

      if (req.files.length > 0) {
        user.ProfileImageURL = req.files[0].path;
      } else {
        //SKU - Reference default image.
        user.ProfileImageURL = "/public/uploads/Everest1478401348492.jpg";
      }

      //SKU - Once the image has been uploaded,
      // check if the image is in the correct path. If not, respond with error
      fs.access(__dirname + "/../../" + user.ProfileImageURL, fs.R_OK | fs.W_OK,
        (err) => {
          if (err) {
            console.log(err);
            res.end(err.toString());
          } else {

            var ObjectId = require('mongodb').ObjectID;

            User.update({_id: ObjectId(req.query.id)}, {
              FirstName: user.FirstName,
              LastName: user.LastName,
              ProfileImageURL: user.ProfileImageURL
            }, (err, result) => {

              if (err) {
                console.log(err);
                res.status(500);
                res.send();

                //SKU
                /* Safety net is needed for guarding against
                 submitting objects with no changes. */
              } else if (result.nModified < 1 || result.nModified === null) {
                res.status(404);
                res.send();
              } else {
                res.status(200);
                console.log(user.ProfileImageURL);
                res.send({'ProfileImageURL': user.ProfileImageURL});
              }
            });
          }
        });
    });
  } else {
    res.status(404);
    res.send({'error': 'Invalid ID provided. Please try again with a valid ID'});
  }
};


/*jshint unused:false*/
/**
 * Fetch For Eventlists The User Is Part Of
 * @param {request} req incoming request
 * @param {response} res callback response
 * @param {function} callback Function of type eventList => {...} callback
 * @return {void}
 */
UserController.fetchEventList = (req, res, callback) => {

  User.findOne({_id: ObjectId(req.params.user)},
    {
      _id: 0,
      AttendeeEventID: 1,
      AdminEventID: 1
    }, (err, user) => {
      if (err) {
        console.log(err);
        res.status(404);
        res.send({'error': err.toString()});
        callback(null);
      } else if (!user || user === null || user === undefined) {
        res.status(404);
        res.send({'error': 'The user you are looking for does not exist'});
        callback(null);
      } else if ((user.AdminEventID === null || user.AdminEventID.length < 1) &&
        (user.AttendeeEventID === null || user.AttendeeEventID.length < 1)) {
        res.status(404);
        res.send({'error': 'The user is not a member of an event'});
        callback(null);
      } else {
        callback({
          "AdminEventID": user.AdminEventID,
          "AttendeeEventID": user.AttendeeEventID
        });
      }
    }
  );
};


/**
 * Add Event ID in AdminEventID in the User model
 * @param {request} req incoming request
 * @param {response} res callback response
 * @param {ObjectID} eventID Object ID as referenced in the DB
 * @param  {Bool} isAdminID Is the user admin?
 * @return {void} or error
 */
UserController.registerAdminID = (req, res, eventID, isAdminID) => {
  User.findOneAndUpdate({_id: ObjectId(req.body.UserId)},
    {$push: {userType: eventID.toString()}},
    {new: true},
    (err, user) => {
      if (err) {
        console.log(err);
        res.status(404);
        res.send({'error': err.toString()});
      }
      res.status(200);
      res.send({'valid': 'true'});
    }
  );
};


//ZKH - ****TESTING CONTROLLERS****


/**
 * Get all users in the platform
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return {User} respond with an json hash of users
 */
UserController.testingGetAllUsers = function (req, res) {
  User.find({}, function (err, users) {
    res.send(users);
  });
};


//ZKH - ****END TESTING CONTROLLERS****


/**
 * Add UserController to global module object
 * @constructor
 */
module.exports = UserController;