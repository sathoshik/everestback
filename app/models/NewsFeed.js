//  Everest_Back
//
//  Created by Sathoshi Kumarawadu on 2016-10-08.
//  Copyright © 2016 Everest. All rights reserved.
//


var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * Define Event Schema
 *
 */
var newsfeedSchema = new Schema({
  "EventID": { type: mongoose.Schema.Types.ObjectId, required: false},
  "Posts": [{
    "UserID": { type: mongoose.Schema.Types.ObjectId, required: false},
    "Timestamp": { type: Date, default: null, required: false},
    "Post": { type: [String], required: false}
  }]
});


/**
 * Add Newsfeed Model to global mongoose model object and newsfeeds collections
 * @constructor
 * @param {Schema} newsfeedSchema, {string} NewsFeed
 */
mongoose.model('NewsFeed', newsfeedSchema);
