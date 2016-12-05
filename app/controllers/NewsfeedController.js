//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/NewsFeed');
require('../models/Event');

var mongoose = require('mongoose');


/**
 * NewsFeed mongoose model initializer
 * @constructor
 * @param {NewsFeed}
 */
var NewsFeed = mongoose.model('NewsFeed');


/**
 * NewsFeedController Initializer
 * @constructor
 */
let newsfeedController = this;

/*jshint unused:false*/
/**
 * Append new post to the newsfeed object
 * @param {ObjectID} newsfeedID NewsfeedID referenced by DB.
 * @param {data} data The data object being recieved from client.
 * @param {function} callBack Call back function.
 * @return {callback} callback
 */
newsfeedController.appendNewPost = (newsfeedID, data, callBack) => {

  NewsFeed.findByIdAndUpdate(
    newsfeedID,
    {$push: {"Posts": {UserID: data.user_id, Timestamp: null, Post: data.post}}},
    {},
    (err, model) => {
      if (err) {
        console.log(err);
        callBack(false);
      }
      callBack(true);
    }
  );
};

//ZKH - ****TESTING CONTROLLERS***


/**
 * Returns all newsfeed objects within the DB
 * @param {request} req incoming request.
 * @param {response} res callback response.
 * @return {NewsFeed} Return a list of all newsfeeds
 */
newsfeedController.testingGetAllNewsfeeds = (req, res) => {
  NewsFeed.find({}, (err, newsFeeds) => {
    res.send(newsFeeds);
  });
};


/**
 * Add NewsFeedController to global module object
 * @constructor
 */
module.exports = newsfeedController;