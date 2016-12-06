//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/Event');
require('../models/NewsFeed');

var imageUploader = require('../helpers/Tools').imageUploader();
var eventHelper = require('../helpers/EventHelper');
var fs = require('fs');
var mongoose = require('mongoose');
var util = require('../helpers/Util');

/**
 * Event mongoose model initializer
 * @constructor
 * @param {Event}
 */
var Event = mongoose.model('Event');


/**
 * NewsFeed mongoose model initializer
 * @constructor
 * @param {NewsFeed}
 */
var NewsFeed = mongoose.model('NewsFeed');


/**
 * EventController Initializer
 * @constructor
 */
var EventController = this;


/**
 * QR Code Api Initializer
 * @constructor
 * http://goqr.me/api/
 */
var QRCodeAPi = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=";


/**
 * Create event object along with header image upload
 * @param {request} req incoming request
 * @param {response} res callback response
 * @param {function} registerEventInUserModel Call back function to register event.
 * @return {void} or {error}
 */
EventController.createEvent = (req, res, registerEventInUserModel) => {

  imageUploader(req, res, (err) => {

    if (err) {
      res.status(500);
      res.end(err);
    }

    //SKU - Initialize Event object and Newsfeed object that wil be associated with event.
    var event = new Event(req.body);
    var newsFeed = new NewsFeed();
    event.AdminID.push(req.body.UserId);

    //SKU - Reference the newsFeedID in the event object
    event.NewsfeedID = newsFeed._id;
    //SKU - Generate two 16 bit tokens for attendee and admin
    event.AttendeeKey = util.generateToken();
    event.AdminKey = util.generateToken();
    event.StartTime = Date.now();
    event.EndTime = Date.now();

    let uRLPrefix = QRCodeAPi + '/Event/' + event._id + '?key=';
    event.AdminQRCodeURL = uRLPrefix + event.AdminKey;
    event.AttendeeQRCodeURL = uRLPrefix + event.AttendeeKey;

    //ZKH - Reference the EventID in the newsFeed object
    newsFeed.EventID = event._id;

    try{

      if (req.files.length > 0) {
        event.EventImageURL = req.files[0].path;
      } else {
        //SKU - Reference default image.
        event.EventImageURL = "/public/uploads/Everest1478401348492.jpg";
      }
    } catch(e) {
      console.log(e);
      event.EventImageURL = "/public/uploads/Everest1478401348492.jpg";
    }

    //SKU
    /* Once the image has been uploaded, check if the image is in the correct
       path. If not, respond with error */
    fs.access(__dirname + "/../../" + event.EventImageURL, fs.R_OK | fs.W_OK, (err) => {
      if (err) {
        console.log(err);
        res.end(err.toString());
      } else {
        //SKU - Add Event object to the events Collection
        event.save( (err) => {
          if (err) {
            console.log(err);
            res.status(500);
            res.send({'error' : err.toString()});
          } else {
            //SKU - If there are no errors,
            // add newsFeed object to the newsFeeds Collection
            newsFeed.save( (err) => {
              if (err) {
                console.log(err);
                res.status(500);
                res.send({'error' : err.toString()});
              } else {
                registerEventInUserModel(event._id);
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
 * @param {request} req incoming request.
 * @param {response} res callback response.
 * @paramURL {Admin/Attendee Key} key, {Event Object ID} event.
 * @return {event} or error message.
 */
EventController.getEventDescription = (req, res) => {

  //SKU - If the URL has the correct parameter, return object. Else return 404
  if (req.query.key !== null && req.params.event !== null &&
    req.params.event.length == 24) {
    var ObjectId = require('mongodb').ObjectID;

    Event.findOne({_id: ObjectId(req.params.event)}, {
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
        res.send({'error' : err.toString()});
      } else if (!event) {
        res.status(404);
        res.send({'error' : 'The event you are looking for does not exist'});
      } else if (event._doc.AdminKey.length < 1 ||
        event._doc.AttendeeKey.length < 1){
        res.status(400);
        res.send({'error' : 'Oops.. You have invalid permissions to view this event'});
      } else {
        //SKU - Based on the given key, identify admin vs attendee
        let valid = false;
        if (event.AdminKey == req.query.key) {
          event._doc.Admin = true;
          valid = true;
        } else if (event.AttendeeKey == req.query.key) {
          event._doc.Admin = false;
          valid = true;
        }
        if (valid) {
          //SKU - Force remove the Admin key from the event object before sending response
          delete event._doc.AdminKey;
          delete event._doc.AttendeeKey;
          res.status(200);
          res.send(event);
        } else {
          res.status(400);
          res.send({'error' : 'Oops.. You have invalid permissions to view this event'});
        }
      }
    });
  } else {
    res.status(404);
    res.send({'error' : 'The event you are looking for does not exist'});
  }
};


/**
 * Checks if the user is part of an event.
 * @param {ObjectId} eventID Event ID as referenced by DB.
 * @param {ObjectId} userID User ID as referenced by DB.
 * @param {admin/attendee/null} restriction Toggle variable.
 * @param {Object} returnEventObject Returned event object.
 * @param {function} callBack Callback function.
 * @return {event} object or error message.
 */
EventController.checkIfUserIsPartOfEvent =
  (eventID, userID, restriction, returnEventObject , callBack) => {

    let ObjectId = require('mongodb').ObjectID;
    let userIsPartOfEvent = false;

    if (eventID !== null && userID !== null &&
      eventID.length == 24 && userID.length == 24) {

      Event.findOne({_id: ObjectId(eventID)}, {
        _id: 0,
        AdminID: 1,
        AttendeeID: 1,
        NewsfeedID: 1
      }, (err, event) => {
        if (err) {
          console.log(err);
          return;
        } else if (event.length < 1) {
          console.log("No event found");
          return;
        }

        if (restriction == "admin" || restriction === null) {
          event.AdminID.map((adminID) => {
            if (adminID == userID) {
              userIsPartOfEvent = true;
            }
          });
        }

        if (restriction == "attendee" || restriction === null) {
          if (!userIsPartOfEvent) {
            event.AttendeeID.map((attendeeID) => {
              if (attendeeID == userID) {
                userIsPartOfEvent = true;
              }
            });
          }
        }

        if (returnEventObject) {
          callBack(userIsPartOfEvent, event);
        } else {
          callBack(userIsPartOfEvent);
        }

      });
    } else {
      callBack(userIsPartOfEvent);
    }
  };


/**
 * Get details of multiple events
 * @param {Object} eventIDList List of ids that associated with a user.
 * { "AdminEventID" : [AdminEventID], "AttendeeEventID" : [AttendeeEventID]}
 * @param {request} req incoming request.
 * @param {response} res callback response.
 * @return {[event]} Array of event objects
 */
EventController.fetchEventObjects = (eventIDList, req, res) => {

  var eventsObject = {
    "AdminEvents": eventIDList.AdminEventID,
    "AttendeeEvents": eventIDList.AttendeeEventID
  };

  eventHelper.retrieveUserEvents(eventsObject, res, (events) => {
    if (events.AdminEvents === null && events.AttendeeEvents === null){
      res.status(500);
      res.send({'error' : 'Events not added correctly'});
    } else {
      res.status(200);
      res.send(events);
    }
  });

};

//ZKH - ****TESTING CONTROLLERS****


/**
 * Create a testing event & newsfeed object without image upload
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return {event} { "event": {}, "newsfeed": {} }
 */
EventController.testingCreateEvent = (req, res) => {
  //SKU - Initialize Event object and Newsfeed object that wil be associated with event.
  var event = new Event(req.body);
  var newsFeed = new NewsFeed();

  //ZKH - Reference the newsFeedID in the event object
  event.NewsfeedID = newsFeed._id;

  //ZKH - Reference the EventID in the newsFeed object
  newsFeed.EventID = event._id;

  event.save( (err) => {
    if (err) {
      console.log(err);
      res.status(500);
      res.end({'error' : err.toString()});
    } else {
      //ZKH - If there are no errors, add newsFeed object to the newsFeeds Collection
      newsFeed.save( (err) => {
        if (err) {
          console.log(err);
          res.status(500);
          res.end({'error' : err.toString()});
        } else {
          res.status(200);
          res.send({event: event, newsfeed: newsFeed});
        }
      });
    }
  });
};
//ZKH - ****END TESTING CONTROLLERS****


/**
 * Add EventController to global module object
 * @constructor
 */
module.exports = EventController;