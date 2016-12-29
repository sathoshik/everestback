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
var eventSchema = new Schema({
  "EventName": {type: String, required: true},
  "EventImageURL": {type: String, required: true},
  "Description": {type: String, required: false},
  "Location": {type: String, required: false},
  "StartTime": {type: Date, required: false},
  "EndTime": {type: Date, required: false},
  "AttendeeQRCodeURL": {type: String, required: false},
  "AttendeeKey": {type: String, required: false},
  "AdminQRCodeURL": {type: String, required: false},
  "AdminKey": {type: String, required: false},
  "EventQuestions": [{type: String, required: false}],
  "Admins": [{
    "UserID" : {type: mongoose.Schema.Types.ObjectId, required: false}
  }],
  "Attendees": [{
    "UserID": {type: mongoose.Schema.Types.ObjectId, required: false}
  }],
  "NewsfeedID": {type: mongoose.Schema.Types.ObjectId, required: true}
});


/**
 * Add Event Model to global mongoose model object and events collections
 * @constructor
 * @param {Schema} eventSchema, {string} Event
 */
mongoose.model('Event', eventSchema);