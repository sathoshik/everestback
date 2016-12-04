//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/Event');
require('../models/NewsFeed');

var imageUploader = require('../helpers/Tools').imageUploader();
var fs = require('fs');
var mongoose = require('mongoose');
var util = require('../helpers/Util');
var env = require('../config/constants/Environment');

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
 * @param {request} req, {response} res, {() => {...}) registerEventInUserObject
 * @return void or error
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
    event.AdminID.push(req.body.UserID);

    //SKU - Reference the newsFeedID in the event object
    event.NewsfeedID = newsFeed._id;
    //SKU - Generate two 16 bit tokens for attendee and admin
    event.AttendeeKey = util.generateToken();
    event.AdminKey = util.generateToken();
    event.AdminQRCodeURL = QRCodeAPi + env.Host + '/Event/' + event._id + '?key=' +  event.AdminKey;
    event.AttendeeQRCodeURL = QRCodeAPi + env.Host + '/Event/' + event._id + '?key=' +  event.AttendeeKey;
    //ZKH - Reference the EventID in the newsFeed object
    newsFeed.EventID = event._id;

    try{
      if (req.files.length > 0) {
        event.EventImageURL = req.files[0].path;
      }
      else {
        //SKU - Reference default image.
        event.EventImageURL = "/public/uploads/Everest1478401348492.jpg";
      }
    }
    catch(e){
      console.log(e);
      event.EventImageURL = "/public/uploads/Everest1478401348492.jpg";
    }


    //SKU - Once the image has been uploaded, check if the image is in the correct path. If not, respond with error
    fs.access(__dirname + "/../../" + event.EventImageURL, fs.R_OK | fs.W_OK, (err) => {
      if (err) {
        console.log(err);
        res.end(err.toString());
      }
      else {
        //SKU - Add Event object to the events Collection
        event.save( (err) => {
          if (err) {
            console.log(err);
            res.status(500);
            res.send({'error' : err.toString()});
          } else {
            //SKU - If there are no errors, add newsFeed object to the newsFeeds Collection
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
 * Get event information with admin status
 * @param {request} req, {response} res
 * @paramURL {Admin/Attendee Key} key, {Event Object ID} event
 * @return event object or error message
 */
EventController.getEventDescription = (req, res) => {

  //SKU - If the URL has the correct parameter, return object. Else return 404
  if (req.query.key !== null && req.params.event !== null && req.params.event.length == 24) {
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
        } else if  (event.AttendeeKey == req.query.key) {
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
 * Checks if the user is part of an event
 * @param {int eventID} event_id, {int userID} user_id, {admin/attendee/null} restriction
 * @return  event object or error message
 */
EventController.checkIfUserIsPartOfEvent = (event_id, user_id, restriction,  returnEventObject , callback) => {
  let ObjectId = require('mongodb').ObjectID;
  let userIsPartOfEvent = false;

  if (event_id !== null && user_id !== null && event_id.length == 24 && user_id.length == 24) {
    //ZKH - Connecting user to a Newsfeed room if user is an admin or an attendee or admin/attendee
    Event.findOne({_id: ObjectId(event_id)}, {
      _id: 0,
      AdminID: 1,
      AttendeeID: 1,
      NewsfeedID: 1
    }, (err, event) => {
      if (err) {
        console.log(err);
        return;
      }
      else if (event.length < 1) {
        console.log("No event found");
        return;
      }

      if (restriction == "admin" || restriction == null) {
        event.AdminID.map((adminID) => {
          if (adminID == user_id) {
            userIsPartOfEvent = true;
          }
        });
      }

      if (restriction == "attendee" || restriction == null) {
        if (!userIsPartOfEvent) {
          event.AttendeeID.map((attendeeID) => {
            if (attendeeID == user_id) {
              userIsPartOfEvent = true;
            }
          });
        }
      }

      if (returnEventObject) {
        callback(userIsPartOfEvent, event);
      }
      else {
        callback(userIsPartOfEvent);
      }

    });
  } else {
    callback(userIsPartOfEvent)
  }
};

/**
 * Get details of multiple events
 * @param { "AdminEventID" : [AdminEventID], "AttendeeEventID" : [AttendeeEventID]} eventIDList, {request} req, {response} res
 * @return array of event objects
 */

EventController.fetchEventObjects = (eventIDList, req, res) =>{

  var eventsObject = {
    "AdminEvents": eventIDList.AdminEventID,
    "AttendeeEvents": eventIDList.AttendeeEventID
  };

  eventHelper.retrieveUserEvents(eventsObject, res, (events) => {
    if(events.AdminEvents == null && events.AttendeeEvents == null){
      res.status(500);
      res.send({'error' : 'Events not added correctly'});
    }
    else{
      res.status(200);
      res.send(events);
    }
  });

};

//ZKH - ****EVENT HELPERS****

var eventHelper = {
/**
 * Queries The Event Model With an Array Of Events
 * @param  {} eventsObject, {response} res, {() => {...}} callback
 * @return {} or null
 *
 * NOTE: This function will always return an object with
 *       the same key values as the arg "eventsObject"
 */
  retrieveUserEvents : (eventsObject, res, callback) => {

    var returnObject = {}, numberOfKeys = Object.keys(eventsObject).length, counter = 0;

    for(let key in eventsObject){
      let additionalObject ={};

      try{
        eventsObject[key].length;
      }
      catch(e){
        console.log(e);
        res.status(404);
        res.send({'error' : 'Unsuccessful operation'});
        return;
      }

      if(eventsObject[key] != null || eventsObject[key] != undefined || eventsObject[key].length >= 1 ){
        Event.find({'_id' : {$in : eventsObject[key]}},{
          _id: 0,
          EventName : 1,
          EventImageURL : 1,
          Description : 1,
          Location : 1,
          StartTime : 1,
          EndTime : 1
        }, (err, events) => {
          counter++;
          if(err){
            console.log(err);
            res.status(404);
            res.send({'error' : err.toString()});
            return;
          }
          else if(events.length < 1 || events == null || events == undefined){
            additionalObject[key] = [];
            returnObject = Object.assign({},
                returnObject,
                additionalObject);
          }
          else{
            additionalObject[key] = events;
            returnObject = Object.assign({},
                returnObject,
                additionalObject);
          }

          if(counter == numberOfKeys){
            done();
          }
        });
      }
      else{
        counter++;
        additionalObject[key] = [];
        returnObject = Object.assign({},
            returnObject,
            additionalObject);
        
        if(counter == numberOfKeys){
          done();
        }
      }
    }

    //ZKH - Called upon completion of logic checks or querying of all the data provided
    var done = () =>{
      if(callback){
        callback(returnObject);
      }
      else{
        return returnObject;
      }
    };


  }

}
//ZKH - ****END EVENT HELPERS****

//ZKH - ****TESTING CONTROLLERS****


/**
 * Create a testing event & newsfeed object without image upload
 * @return {  "event": {},
 *            "newsfeed": {}
 *          }
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
    }
    else {
      //ZKH - If there are no errors, add newsFeed object to the newsFeeds Collection
      newsFeed.save( (err) => {
        if (err) {
          console.log(err);
          res.status(500);
          res.end({'error' : err.toString()});
        }
        else {
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