let newsfeedController = this;
var mongoose = require('mongoose');
var fs = require('fs');
var normalizedPath = require("path").join(__dirname, "../models");
require('../models/NewsFeed');

var NewsFeed = mongoose.model('NewsFeed');

//ZKH - Load all of the models
fs.readdirSync(normalizedPath).forEach(function(filename){
	if(~filename.indexOf('.js')) require (normalizedPath+"/"+filename)
});

/**
 * Append new post to the newsfeed object
 */
newsfeedController.appendNewPost = (newsfeed_id, data, callback) => {

	NewsFeed.findByIdAndUpdate(
		newsfeed_id,
		{$push: {"Posts": {UserID: data.user_id, Timestamp: null, Post: data.post}}},
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
 */
newsfeedController.testingGetAllNewsfeeds = (req, res) => {
	NewsFeed.find({}, (err, newsfeeds) => {
		res.send(newsfeeds);
	});
}
//ZKH - **** END TESTING CONTROLLERS***
module.exports = newsfeedController;