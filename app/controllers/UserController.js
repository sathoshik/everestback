//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/User');

var imageUploader = require('../helpers/Tools').imageUploader();
var fs = require('fs');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;


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

    User.findOne({Email: req.body.Email.toLowerCase()}, (err, user) => {
      if (err || !user) {
        res.status(400);
        res.send({'error': 'The Email or Password entered is incorrect'});
      } else {
        user.comparePassword(req.body.Password, function (err, isMatch) {
          if (err || !isMatch) {
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
  user.Email = req.body.Email.toLowerCase();
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

  //SKU - If the URL has the correct parameter, return object..
  if (req.query.id !== null && req.query.id.length == 24 && req.query.isimageset == "true") {

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
        user.ProfileImageURL = null;
      }

      //SKU - Once the image has been uploaded,
      // check if the image is in the correct path. If not, respond with error
      fs.access(__dirname + "/../../" + user.ProfileImageURL, fs.R_OK | fs.W_OK,
        (err) => {
          if (err) {
            console.log(err);
            res.end(err.toString());
          } else {

            User.update({_id: ObjectID(req.query.id)}, {
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
  }
  else if(req.query.id !== null && req.query.id.length == 24 && req.query.isimageset == "false"){

    var user = new User(req.body);
    user.ProfileImageURL = null;

    User.update({_id: ObjectID(req.query.id)}, {
      FirstName: user.FirstName,
      LastName: user.LastName,
      ProfileImageURL: user.ProfileImageURL
    }, (err, result) => {

      if (err) {
        console.log(err);
        res.status(500);
        res.send();

      } else if (!result.ok) {
        res.status(404);
        res.send();
      } else {
        res.status(200);
        res.send({'ProfileImageURL': user.ProfileImageURL});
      }
    });
  }
  else {
    res.status(400);
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

  User.findOne({_id: ObjectID(req.params.user)},
    {
      _id: 0,
      Events: 1
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
      } else if (user.Events === null || user.Events.length < 1) {
        res.status(404);
        res.send({'error': 'The user is not a member of an event'});
        callback(null);
      } else {

        var AdminEventIDs  = [], AttendeeEventIDs = [];

        //ZKH - Extract event Ids from Admin/Attendee Events array
        var extractEventIDs = (events) => {

          return new Promise((resolve, reject) => {

            for(let i = 0; i < events.length; i++){
              if(events[i].Role === "Admin"){
                AdminEventIDs.push(events[i].EventID);
              }
              else if(events[i].Role === "Attendee"){
                AttendeeEventIDs.push(events[i].EventID);
              }
              else{
                reject();
              }

              if(i === events.length - 1){
                resolve();
              }
            }
          });
        };

        extractEventIDs(user.Events)
          .then(() => {
          callback({
            AdminEventID: AdminEventIDs,
            AttendeeEventID: AttendeeEventIDs
          });
        })
          .catch(() => {
            res.status(500).end();
          });
      }
    }
  );
};

/**
 * Register ChatID in AdminEventID / AttendeeEventID
 * @param {String} eventID
 * @param {Object} chatData
 * @return Promise
 */
UserController.registerChatID = (eventID, chatData) => {

  return new Promise((resolve, reject) => {

    for(let i = 0; i < chatData.Participants.length; i++){
      User.findOneAndUpdate({"_id": chatData.Participants[i], "Events": { $elemMatch: {"EventID" : ObjectID(eventID)}}},
        {$push: {"Events.$.ChatIDs": ObjectID(chatData.ChatID.toString())}},
        {new: true},
        (err, user) => {
          if (err) {
            reject({'StatusCode' : 404 , 'Status' : err.toString()});
          }
          else if (user === null){
            reject({'StatusCode' : 404 , 'Status' : 'Users not found'});
          }
          else{
            if(i === chatData.Participants.length - 1){
              resolve({'StatusCode' : 200 , 'Status' : {'ChatID': chatData.ChatID.toString()}});
            }
          }
        });
    }

  });

};

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

      User.findOneAndUpdate({_id: ObjectID(userID.toString())},
        {$push: {Events: {EventID: ObjectID(eventID.toString()), Role: isAdmin ? "Admin" : "Attendee"}}},
        {new: true},
        (err, user) => {
          if (err) {
            console.log(err);
            reject({'StatusCode' : 404, 'Status': err.toString()});
          }
          else if(user === null || user === undefined){
            reject({'StatusCode' : 404, 'Status':  'User not found'});
          }
          else{
            resolve({'StatusCode' : 200, 'Status' : {'EventID' : eventID}});
          }
        }
      );
  });
};

/**
 * Fetch User(s) details
 * @param {Array} userIDs
 * @return Promise
 */
UserController.fetchUserDetails = (userIDs, filter) => {

  return new Promise((resolve, reject) => {

    User.find({'_id' : {$in : userIDs}},
      filter,
      (err, users) => {
        if (err) {
          reject({'StatusCode' : 404, 'Status': err.toString()});
        }
        else if(users.length < 1){
          reject({'StatusCode' : 404, 'Status':  'User not found'});
        }
        else{
          resolve(users);
        }
      });
  });
};

/**
 * Fetch Chat Participant(s) details
 * @param {Array} chats
 * @return Promise
 */
UserController.fetchChatParticipantDetails = (chats) => {

  return new Promise((resolve, reject) => {
    var responseObject = [], counter = 0;
    var setResponseObject = (data) => {
      counter++;
      responseObject.push(data);
      if(counter == chats.length - 1){
        resolve(responseObject);
      }
    };
    for(let i = 0; i < chats.length; i++){
      User.find({'_id' : {$in : chats[i].Participants}},
        {
          FirstName: 1,
          LastName: 1
        },
        (err, users) => {
          if (err) {
            reject({'StatusCode' : 404, 'Status': err.toString()});
          }
          else if(users.length < 1){
            reject({'StatusCode' : 404, 'Status':  'User not found'});
          }
          else{

            setResponseObject({
              ChatID: chats[i]._id,
              MessageCount: chats[i].MessageCount,
              Participants: users
            });

          }
        });
    }

  });



};
/**
 * Fetch User details
 * @param {String} userID
 * @param {String} eventID
 * @return Promise
 */
UserController.fetchUserChats = (userID, eventID) => {

  return new Promise((resolve, reject) => {

    User.findOne({'_id' :  userID},
      {
        _id: 0,
        Events: 1
      },
      (err, user) => {
        if (err) {
          reject({'StatusCode' : 404, 'Status': err.toString()});
        }
        else if(user == null || user == undefined){
          reject({'StatusCode' : 404, 'Status':  'User not found'});
        }
        else{
          for(let i = 0; i < user.Events.length; i++ ){

            if( user.Events[i].EventID.toString() == eventID){
              user.Events[i].ChatIDs.length > 0 ? resolve(user.Events[i].ChatIDs) : reject({'StatusCode' : 404, 'Status' : 'No Chats are available for this event'});
              break;
            }

            if(i == user.Events.length - 1){
              reject({'StatusCode' : 404, 'Status':  'Event not found'});
            }
          }
        }
      });
  });
} ;

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