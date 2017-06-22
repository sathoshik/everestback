//  Everest_Back
//
//  Created by Sathoshi Kumarawadu on 2016-10-08.
//  Copyright © 2016 Everest. All rights reserved.
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define Event Schema
 */
var newsfeedSchema = new Schema({
  'EventID': { type: mongoose.Schema.Types.ObjectId, required: false },
  'Posts': [{
    'UserID': { type: mongoose.Schema.Types.ObjectId, required: false },
    'FirstName': { type: String, default: null, required: true },
    'LastName': { type: String, default: null, required: true },
    'ProfileImageURL': { type: String, default: null, required: true },
    'Timestamp': { type: Date, default: new Date().toISOString(), required: false },
    'Post': { type: [String], required: false }
  }]
});

/**
 * Add Newsfeed Model to global mongoose model object and newsfeeds collections
 */
mongoose.model('NewsFeed', newsfeedSchema);
