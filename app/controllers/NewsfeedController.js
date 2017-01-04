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
let NewsfeedController = this;

/*jshint unused:false*/
/**
 * Append new post to the newsfeed object
 * @param {ObjectID} newsfeedID NewsfeedID referenced by DB.
 * @param {data} data The data object being recieved from client.
 * @param {function} callBack Call back function.
 * @return {callback} callback
 */
NewsfeedController.appendNewPost = (newsfeedID, data, callBack) => {

  NewsFeed.findByIdAndUpdate(
    newsfeedID,
    {$push: {"Posts": {
      UserID: data.user_id,
      Timestamp: data.timeStamp,
      ProfileImageURL: data.profilePicURL,
      FirstName: data.firstName,
      LastName: data.lastName,
      Post: data.post}
    }},
    {},
    (err, model) => {
      if (err) {
        console.log(err);
        callBack(false);
      }
      if(!model){
        callback(false);
      }
      callBack(true);
    }
  );
};

/**
 * Fetch All Posts
 * @param {String} newsfeedID
 * @return Promise
 */
NewsfeedController.fetchAllPosts = (newsfeedID) => {

  return new Promise((resolve, reject) => {
    NewsFeed.aggregate([
      {$match: {
        '_id' : newsfeedID
      }},
      //ZKH - Sort in descending order
      {$sort: {
        'Posts.Timestamp': -1
      }},
      //ZKH - Only fetch 1 doc
      {$limit: 1 }
    ],
      (err, newsfeed) => {
        if (err) {
          reject({'StatusCode' : 404, 'Status': err.toString()});
        }
        else if(newsfeed.length < 1){
          reject({'StatusCode' : 404, 'Status':  'Newsfeed not found'});
        }
        else{
          resolve(newsfeed[0].Posts);
        }
      });
  });
};

//ZKH - ****TESTING CONTROLLERS***


/**
 * Returns all newsfeed objects within the DB
 * @param {request} req incoming request.
 * @param {response} res callback response.
 * @return {NewsFeed} Return a list of all newsfeeds
 */
NewsfeedController.testingGetAllNewsfeeds = (req, res) => {
  NewsFeed.find({}, (err, newsFeeds) => {
    res.send(newsFeeds);
  });
};


/**
 * Add NewsFeedController to global module object
 * @constructor
 */
module.exports = NewsfeedController;