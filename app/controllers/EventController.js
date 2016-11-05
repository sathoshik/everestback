//  Everest_Back
//
//  Created by Sathoshi Kumarawadu on 2016-10-08.
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/Event')
require('../models/NewsFeed')

var imageUploader = require('../helpers/Tools').imageUploader();
var fs = require('fs');
var mongoose = require('mongoose');

var Event = mongoose.model('Event');
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

  imageUploader(req, res, function (err) {

    if (err) {
      res.status(500);
      return res.end(err);
    }

    //SKU - Initialize Event object and Newsfeed object that wil be associated with event.
    var event = new Event(req.body);
    var newsFeed = new NewsFeed();

    //SKU - Reference the newsFeedID in the event object
    event.NewsfeedID = newsFeed._id;
    if(req.files.length > 0 ) {
      event.EventImageURL = req.files[0].path;
    }

    //SKU - Once the image has been uploaded, check if the image is in the correct path. If not, respond with error
    try {
      if (fs.statSync(__dirname + "/../../" + event.EventImageURL).isFile()) {
        res.status(200);
      }
    } catch (err) {
      res.status(500);
      res.end(err.toString());
    }

    //SKU - Add Event object to the events Collection
      event.save( function (err) {
        if (err) {
          console.log(err)
          res.status(500)
          res.end(err.toString())
        } else {
          //SKU - If there are no errors, add newsFeed object to the newsFeeds Collection
          newsFeed.save( function (err) {
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
  });
};


/**
 * Add EventController to global module object
 * @constructor
 */
module.exports = EventController;