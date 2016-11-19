//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/Event');
require('../models/NewsFeed');

var imageUploader = require('../helpers/Tools').imageUploader();
var fs = require('fs');
var mongoose = require('mongoose');


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
 * Create event object along with header image upload
 * @param {request} req, {response} res
 * @return void or error
 */
EventController.createEvent = (req, res) => {

  imageUploader(req, res, (err) => {

    if (err) {
      res.status(500);
      res.end(err);
    }

    //SKU - Initialize Event object and Newsfeed object that wil be associated with event.
    var event = new Event(req.body);
    var newsFeed = new NewsFeed();

    //SKU - Reference the newsFeedID in the event object
    event.NewsfeedID = newsFeed._id;

    //ZKH - Reference the EventID in the newsFeed object
    newsFeed.EventID = event._id;

    if (req.files.length > 0) {
      event.EventImageURL = req.files[0].path;
    } else {
      //SKU - Reference default image.
      event.EventImageURL = "/public/uploads/Everest1478401348492.jpg"
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
            console.log(err)
            res.status(500)
            res.end(err.toString())
          } else {
            //SKU - If there are no errors, add newsFeed object to the newsFeeds Collection
            newsFeed.save( (err) => {
              if (err) {
                console.log(err)
                res.status(500)
                res.end(err.toString())
              } else {
                res.status(200)
                res.send()
              }
            });
          }
        });
      }
    });

  });
};


/**
 * Get event object main information
 * @param {request} req, {response} res
 * @paramURL {Event Object Id} id
 * @return event object or error message
 */
EventController.getEventDescription = (req, res) => {

  //SKU - If the URL has the correct parameter, return object. Else return 404
  if (req.query.id != null && req.query.id.length == 24) {
    var ObjectId = require('mongodb').ObjectID;

    Event.find({_id: ObjectId(req.query.id)}, {
      _id: 0,
      EventImageURL: 1,
      EventName: 1,
      Description: 1,
      Location: 1,
      StartTime: 1,
      EndTime: 1
    }, (err, event) => {

      if (err) {
        console.log(err);
        res.status(404);
        res.send();
      } else if (event.length < 1) {
        res.status(404);
        res.send();
      } else {
        res.status(200);
        res.send(event[0]);
      }
    });
  } else {
    res.status(404);
    res.send();
  }
};


/**
 * Checks if the user is part of an event
 * @param {int eventID} event_id, {int userID} user_id, {admin/attendee/null} restriction
 * @return  event object or error message
 */
EventController.checkIfUserIsPartOfEvent = (event_id, user_id, restriction,  returnEventObject , callback) => {

    //ZKH - Connecting user to a Newsfeed room if user is an admin or an attendee or admin/attendee
    Event.findOne({_id: event_id}, {_id: 0, AdminID: 1,  AttendeeID: 1, NewsfeedID: 1}, (err, event) =>{
        
        if (err) {
          console.log(err);
          return;
        }
        else if(event.length < 1){
          console.log("No event found");
          return;
        }

        var userIsPartOfEvent = false;

        if(restriction == "admin" || restriction == null){
            event.AdminID.map((adminID) => {
              if(adminID == user_id){
                userIsPartOfEvent = true;
                }
            });
        }

        if(restriction == "attendee" || restriction == null){
            if(!userIsPartOfEvent){
                event.AttendeeID.map((attendeeID) => {
                    if(attendeeID == user_id){
                    userIsPartOfEvent = true;
                    }
                });
            }
        }

        if(returnEventObject){
            callback(userIsPartOfEvent, event);
        }
        else{
            callback(userIsPartOfEvent);
        }

    });
};

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
                console.log(err)
                res.status(500)
                res.end(err.toString())
            }
            else {
                //ZKH - If there are no errors, add newsFeed object to the newsFeeds Collection
                newsFeed.save( (err) => {
                    if (err) {
                        console.log(err)
                        res.status(500)
                        res.end(err.toString())
                    }
                    else {
                        res.status(200)
                        res.send({event: event, newsfeed: newsFeed})
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