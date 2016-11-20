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


/**
 * Append new post to the newsfeed object
 * @param {newsFeedID} newsfeed_id, {data} data, {callBack return} callback
 * @return callback function
 */
newsfeedController.appendNewPost = (newsfeed_id, data, callback) => {

	NewsFeed.findByIdAndUpdate(
		newsfeed_id,
		{ $push: { "Posts": { UserID: data.user_id, Timestamp: null, Post: data.post }}},
		{},
		(err, model) => {
			if(err){
				console.log(err);
				callback(false);
			}
			callback(true);
		}
	);
};

//ZKH - ****TESTING CONTROLLERS***


/**
 * Returns all newsfeed objects within the DB
 * @param {request} req, {response} res
 */
newsfeedController.testingGetAllNewsfeeds = (req, res) => {
	NewsFeed.find({}, (err, newsfeeds) => {
		res.send(newsfeeds);
	});
}


/**
 * Add NewsFeedController to global module object
 * @constructor
 */
module.exports = newsfeedController;