/**
 * Created by Zain Khan on 2016-12-24.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * Define Chat Message Schema
 *
 */
var chatMessageSchema = new Schema({
  "ChatID": {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
  "Sender": {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
  "Message": {type: String, required: true},
  "MessageNumber": {type: Number, required: true},
  "Timestamp": { type: Date, default: Date.now(), required: false}
});


/**
 * Add Chat Model to global mongoose model object and chat collections
 * @constructor
 * @param  {string} ChatMessage, {Schema} chatMessageSchema
 */
mongoose.model('ChatMessage', chatMessageSchema);