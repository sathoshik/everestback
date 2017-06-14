//  Everest_Back
//
//  Created by Zain Khan on 2016-12-24.
//  Copyright © 2016 Everest. All rights reserved.
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define Chat Message Schema
 *
 */
var chatMessageSchema = new Schema({
  "ChatID": {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
  "UserID": {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
  "FirstName": {type: String, default: null, required: true},
  "LastName": {type: String, default: null, required: true},
  "ProfileImageURL": {type: String, default: null, required: false},
  "Message": {type: String, required: true},
  "MessageNumber": {type: Number, required: true},
  "Timestamp": { type: Date, default: new Date().toISOString(), required: false}
});

/**
 * Add Chat Model to global mongoose model object and chat collections
 */
mongoose.model('ChatMessage', chatMessageSchema);
