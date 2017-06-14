//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/NewsFeed');
require('../models/Event');

var mongoose = require('mongoose');

var NewsFeed = mongoose.model('NewsFeed');

let NewsfeedController = this;

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
        callBack(false);
      }
      callBack(true);
    }
  );
};

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
        } else if (newsfeed.length < 1) {
          reject({'StatusCode' : 404, 'Status':  'Newsfeed not found'});
        } else {
          resolve(newsfeed[0].Posts);
        }
      });
  });
};

//ZKH - ****TESTING CONTROLLERS***

NewsfeedController.testingGetAllNewsfeeds = (req, res) => {
  NewsFeed.find({}, (err, newsFeeds) => {
    res.send(newsFeeds);
  });
};

module.exports = NewsfeedController;
