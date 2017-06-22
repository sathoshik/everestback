//  Everest_Back
//
//  Created by Zain Khan on 2016-12-24.
//  Copyright © 2016 Everest. All rights reserved.
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define Chat Schema
 *
 */
var chatSchema = new Schema({
  'EventID': { type: mongoose.Schema.Types.ObjectId, required: true },
  'Participants': [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  'MessageCount': { type: Number, required: true }
});

/**
 * Add Chat Model to global mongoose model object and chat collections
 */
mongoose.model('Chat', chatSchema);
