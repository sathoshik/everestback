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
      AttendeeEvents: 1,
      AdminEvents: 1
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
      } else if ((user.AdminEvents === null || user.AdminEvents.length < 1) &&
        (user.AttendeeEvents === null || user.AttendeeEvents.length < 1)) {
        res.status(404);
        res.send({'error': 'The user is not a member of an event'});
        callback(null);
      } else {

        var AdminEventIDs  = [], AttendeeEventIDs = [];

        //ZKH - Extract event Ids from Admin/Attendee Events array
        var extractEventIDs = (userEvents) => {

          return new Promise((resolve, reject) => {
            var UserEventID = [];
            for(let i = 0; i < userEvents.length; i++){
              UserEventID.push(userEvents[i].EventID.toString());
              if(userEvents.length === i + 1){
                return resolve(UserEventID)
              }
            }
          });
        };

        extractEventIDs(user.AdminEvents)
          .then((adminEventIds) => {
          AdminEventIDs = adminEventIds;
          extractEventIDs(user.AttendeeEvents);
        })
          .then((attendeeEventIds) => {
          AttendeeEventIDs = attendeeEventIds;
          callback({
            "AdminEventID": AdminEventIDs,
            "AttendeeEventID": AttendeeEventIDs
          });
        });
      }
    }
  );
};

/**
 * Register ChatID in AdminEventID / AttendeeEventID
 * @param {request} req
 * @param {response} res
 * @param {Object} data
 * @return {status} respond with 200 or error
 */

UserController.registerChatID = (req, res, data) => {

    User.find({'_id' : {$in : data.Participants}},
      {
        _id: 0,
        AttendeeEvents: 1,
        AdminEvents: 1
      }, (err, users) => {

          if (err) {
            console.log(err);
            res.status(400);
            res.send({'error': err.toString()});
          }
          else if (users.length < 1){
            console.log(err);
            res.status(404);
            res.send({'error': 'Users not found'});
          }
          else{

            var updatesCompleted = 0, updatesNeeded = users.length;
            for(let k = 0; k < users.length; k++){

              //ZKH - Checks AdminEvents and AttendeeEvents and appends ChatID
              var updateChatID = (UserEvents, resolve) => {
                for(let j = 0; j < UserEvents.length; j++){

                  if(UserEvents[j].EventID.toString() == req.params.event){
                    UserEvents[j].ChatID.push(ObjectID(data.ChatID.toString()));
                    return resolve(true);
                  }

                  //ZKH - If iterated through all UserEvents and did not find a matching event
                  if( UserEvents.length === j + 1 ){
                   return resolve(false);
                  }
                }
              };

              var checkIfAllUsersUpdated = () => {

                //ZKH - Once all users have been successfully assigned a ChatID
                if(updatesCompleted == updatesNeeded){
                  res.status(200);
                  res.send({'ChatID': data.ChatID.toString()});
                }
              };


              let promise = new Promise((resolve, reject) => {
                updateChatID(users[k].AdminEvents, resolve);
              });

              promise.then((foundEventAndUpdatedChat) => {
                //ZKH - If user was not an admin check if user is an attendee of that event
                if(!foundEventAndUpdatedChat){
                  updateChatID(users[k].AttendeeEvents, resolve)
                }
                else{
                  updatesCompleted++;
                  checkIfAllUsersUpdated();
                }
              })
                .then((foundEventAndUpdatedChat) => {
                if(!foundEventAndUpdatedChat){
                  res.status(404);
                  res.send({'error': 'Event not found'});
                }
                else{
                  updatesCompleted++;
                  checkIfAllUsersUpdated();
                }
              });

            }
          }

      });


}

/**
 * Add Event ID in AdminEventID in the User model
 * @param {request} req incoming request
 * @param {response} res callback response
 * @param {ObjectID} eventID Object ID as referenced in the DB
 * @param  {Boolean} isAdmin Is the user admin?
 * @return Promise
 */
UserController.registerEventID = (userID, eventID, isAdmin) => {

  return new Promise((resolve, reject) => {

    var doneQuery = (err, user) => {
      if (err) {
        console.log(err);
        reject({'StatusCode' : 404, 'Status': err.toString()});
      }
      else if(user === null || user === undefined){
        reject({'StatusCode' : 404, 'Status':  'User not found'});
      }
      resolve({'StatusCode' : 200, 'Status' : 'Success'});
    };

    if(isAdmin){
      User.findOneAndUpdate({_id: ObjectId(userID.toString())},
        {$push: {AdminEvents: {EventID: ObjectId(eventID.toString())}}},
        {new: true},
        doneQuery
      );
    }
    else{
      User.findOneAndUpdate({_id: ObjectId(userID.toString())},
        {$push: {AttendeeEvents: {EventID: ObjectId(eventID.toString())}}},
        {new: true},
        doneQuery
      );
    }
  });
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