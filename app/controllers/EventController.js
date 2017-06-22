// Everest_Back
// Copyright © 2016 Everest. All rights reserved.
//

require('../models/Event');
require('../models/NewsFeed');

var imageUploader = require('../helpers/Tools').imageUploader();
var eventHelper = require('../helpers/EventHelper');
var fs = require('fs');
var mongoose = require('mongoose');
var util = require('../helpers/Util');
var ObjectID = require('mongodb').ObjectID;

var Event = mongoose.model('Event');

var NewsFeed = mongoose.model('NewsFeed');

var EventController = this;

var QRCodeAPi = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=';


/**
 * Create event object along with header image upload
 */
EventController.createEvent = (req, res, registerEventInUserModel) => {
  imageUploader(req, res, (err) => {
    if (err) {
      res.status(500);
      res.end(err);
    }

    // SKU - Initialize Event object and Newsfeed object that wil be associated with event.
    var event = new Event(req.body);
    var newsFeed = new NewsFeed();
    event.Admins.push({ 'UserID' : req.body.UserId });

    // SKU - Reference the newsFeedID in the event object
    event.NewsfeedID = newsFeed._id;
    // SKU - Generate two 16 bit tokens for attendee and admin
    event.AttendeeKey = util.generateToken();
    event.AdminKey = util.generateToken();
    event.StartTime = Date.now();
    event.EndTime = Date.now();

    let uRLPrefix = QRCodeAPi + '/Event/' + event._id + '?key=';
    event.AdminQRCodeURL = uRLPrefix + event.AdminKey;
    event.AttendeeQRCodeURL = uRLPrefix + event.AttendeeKey;

    // ZKH - Reference the EventID in the newsFeed object
    newsFeed.EventID = event._id;

    try {
      if(req.files != undefined && req.files != null) {
        if (req.files.length > 0) {
          event.EventImageURL = req.files[0].path;
        } else {
          // SKU - Reference default image.
          event.EventImageURL = '/public/uploads/Everest1478401348492.jpg';
        }
      } else {
        // ZKH - Reference default image.
        event.EventImageURL = '/public/uploads/Everest1478401348492.jpg';
      }
    } catch(e) {
      console.log(e);
      event.EventImageURL = '/public/uploads/Everest1478401348492.jpg';
    }

    // SKU
    /* Once the image has been uploaded, check if the image is in the correct
       path. If not, respond with error */
    fs.access(__dirname + '/../../' + event.EventImageURL, fs.R_OK | fs.W_OK, (err) => {
      if (err) {
        console.log(err);
        res.end(err.toString());
      } else {
        // SKU - Add Event object to the events Collection
        event.save( (err) => {
          if (err) {
            console.log(err);
            res.status(500);
            res.send({ 'error' : err.toString() });
          } else {
            // SKU - If there are no errors,
            //  add newsFeed object to the newsFeeds Collection
            newsFeed.save( (err) => {
              if (err) {
                console.log(err);
                res.status(500);
                res.send({ 'error': err.toString() });
              } else {
                registerEventInUserModel(event._id, req.body.UserId);
              }
            });
          }
        });
      }
    });
  });
};

/**
 * Get event information with admin status.
 */
EventController.getEventDescription = (req, res) => {
  // SKU - If the URL has the correct parameter, return object. Else return 404
  if (req.query.key !== null && req.params.event !== null && req.params.event.length == 24) {
    Event.findOne({ _id: ObjectID(req.params.event) }, {
      _id: 0,
      EventImageURL: 1,
      EventName: 1,
      Description: 1,
      Location: 1,
      StartTime: 1,
      EndTime: 1,
      AdminKey: 1,
      AttendeeKey: 1,
    }, (err, event) => {
      if (err) {
        console.log(err);
        res.status(404);
        res.send({ 'error' : err.toString() });
      } else if (!event) {
        res.status(404);
        res.send({ 'error' : 'The event you are looking for does not exist' });
      } else if (event._doc.AdminKey.length < 1 ||
        event._doc.AttendeeKey.length < 1) {
        res.status(400);
        res.send({ 'error' : 'Oops.. You have invalid permissions to view this event' });
      } else {
        // SKU - Based on the given key, identify admin vs attendee
        let valid = false;
        if (event.AdminKey == req.query.key) {
          event._doc.Admin = true;
          valid = true;
        } else if (event.AttendeeKey == req.query.key) {
          event._doc.Admin = false;
          valid = true;
        }
        if (valid) {
          // SKU - Force remove the Admin key from the event object before sending response
          delete event._doc.AdminKey;
          delete event._doc.AttendeeKey;
          res.status(200);
          res.send(event);
        } else {
          res.status(400);
          res.send({ 'error': 'Oops.. You have invalid permissions to view this event' });
        }
      }
    });
  } else {
    res.status(404);
    res.send({ 'error': 'The event you are looking for does not exist' });
  }
};

/**
 * Checks if the user is part of an event.
 */
EventController.checkIfUserIsPartOfEvent = (eventID, userID, restriction, returnEventObject, callback) => {
  if (eventID !== null && userID !== null && eventID.length == 24 && userID.length == 24) {
    Event.findOne({ _id: ObjectID(eventID) }, {
      _id: 0,
      Admins: 1,
      Attendees: 1,
      NewsfeedID: 1
    }, (err, event) => {
      if (err) {
        console.log(err);
        return;
      } else if (event == null) {
        console.log('No event found');
        return;
      }

      var checkUsers = (participants, cb) => {
        for(let i = 0; i < participants.length; i++) {
          if (participants[i].UserID.toString() == userID) {
            return cb(true);
          }

          if(i == participants.length - 1) {
            return cb(false);
          }
        }
      };

      if (restriction == 'admin') {
        checkUsers(event.Admins, (isAdmin) => {
          returnEventObject ? callback(isAdmin, event) : callback(isAdmin);
        });
      } else if (restriction == 'attendee') {
        checkUsers(event.Attendees, (isAttendee) => {
          returnEventObject ? callback(isAttendee, event) : callback(isAttendee);
        });
      } else if (restriction == null) {
        checkUsers(event.Admins, (isAdmin) => {
          if(isAdmin) {
            returnEventObject ? callback(isAdmin, event) : callback(isAdmin);
          } else {
            checkUsers(event.Attendees, (isAttendee) => {
              returnEventObject ? callback(isAttendee, event) : callback(isAttendee);
            });
          }
        });
      }
    });
  } else {
    returnEventObject ? callback(false, null) : callback(false);
  }
};

/**
 * Get details of multiple events
 */
EventController.fetchEventObjects = (eventIDList, req, res) => {
  var eventsObject = {
    AdminEvents: eventIDList.AdminEventID,
    AttendeeEvents: eventIDList.AttendeeEventID
  };

  eventHelper.retrieveUserEvents(eventsObject, res, (events) => {
    if (events.AdminEvents === null && events.AttendeeEvents === null) {
      res.status(500);
      res.send({ 'error': 'Events not added correctly' });
    } else {
      res.status(200);
      res.send(events);
    }
  });
};

/**
 * Get details of multiple events
 */
EventController.fetchAllUserIDs = (eventID, filter) => {
  return new Promise((resolve, reject) => {
    var queryFilter;
    if(filter) {
      queryFilter = filter === 'Admin' ? { Admins : 1 } : { Attendees: 1 };
    } else {
      queryFilter = { Admins: 1, Attendees: 1 };
    }
    Event.findOne({ _id: ObjectID(eventID) },
      queryFilter,
      (err, event) => {
        if(err) {
          return reject({ 'StatusCode': 404, 'Status' : err.toString() });
        } else if (event === null || event === undefined) {
          return reject({ 'StatusCode': 404, 'Status': 'Event could not be found' });
        } else {
          if(filter) {
            if (filter == 'Admin') {
              resolve({ 'Admins': event.Admins.map((admin) => {
                return admin.UserID;
              }) });
            } else {
              resolve({ 'Attendees': event.Attendees.map((attendee) => {
                return attendee.UserID;
              }) });
            }
          } else {
            resolve({
              'Admins': event.Admins.map((admin) => {
                return admin.UserID;
              }),
              'Attendees': event.Attendees.map((attendee) => {
                return attendee.UserID;
              })
            });
          }
        }
      });
  });
};

EventController.registerUserID = (eventID, userID, isAdmin, userKey) => {
  return new Promise((resolve, reject) => {
    var doneQuery = (err, event) => {
      if(err) {
        return reject({ 'StatusCode': 404, 'Status' : err.toString() });
      } else if (event === null || event === undefined) {
        return reject({ 'StatusCode': 404, 'Status' : 'Event could not be found' });
      }
      return resolve({ 'StatusCode' : 200, 'Status' : 'Valid' });
    };

    if(isAdmin) {
      Event.findOneAndUpdate({ $and: [{ _id: ObjectID(eventID.toString()) },
          { AdminKey: userKey }] },
        { $push: { Admins: { UserID: ObjectID(userID.toString()) } } },
        { new: true },
        doneQuery);
    } else {
      Event.findOneAndUpdate({ $and: [{ _id: ObjectID(eventID.toString()) },
          { AttendeeKey: userKey }] },
         { $push: { Attendees: { UserID: ObjectID(userID.toString()) } } },
        { new: true },
        doneQuery
      );
    }
  });
};

// ZKH - ****TESTING CONTROLLERS****

EventController.testingGetAllEvents = function(req, res) {
  Event.find({}, function(err, events) {
    res.send(events);
  });
};

EventController.testingCreateEvent = (req, res) => {
  // SKU - Initialize Event object and Newsfeed object that wil be associated with event.
  var event = new Event(req.body);
  var newsFeed = new NewsFeed();

  // ZKH - Reference the newsFeedID in the event object
  event.NewsfeedID = newsFeed._id;

  // ZKH - Reference the EventID in the newsFeed object
  newsFeed.EventID = event._id;

  event.save( (err) => {
    if (err) {
      console.log(err);
      res.status(500);
      res.end({ 'error' : err.toString() });
    } else {
      // ZKH - If there are no errors, add newsFeed object to the newsFeeds Collection
      newsFeed.save( (err) => {
        if (err) {
          console.log(err);
          res.status(500);
          res.end({ 'error' : err.toString() });
        } else {
          res.status(200);
          res.send({ event: event, newsfeed: newsFeed });
        }
      });
    }
  });
};
// ZKH - ****END TESTING CONTROLLERS****

module.exports = EventController;
