//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/Chat');
require('../models/ChatMessage');

var mongoose = require('mongoose');

/**
 * Chat mongoose model initializer
 * @constructor
 * @param {Chat}
 */
var Chat = mongoose.model('Chat');

/**
 * ChatMessage mongoose model initializer
 * @constructor
 * @param {ChatMessage}
 */
var ChatMessage = mongoose.model('ChatMessage');

/**
 * ChatController Initializer
 * @constructor
 */
var ChatController = this;

/**
 * Create a new chat instance and create a new message
 * @param {String} eventID
 * @param {Array} participants
 * @param {Object} messageData
 * @return Promise
 */
ChatController.instantiateChat = (eventID, participants, messageData ) => {

  return new Promise((resolve, reject) => {

    var chat = new Chat({
      EventID: eventID,
      Participants: participants,
      MessageCount: 1
    });

    var chatMessage = new ChatMessage({
      ChatID: chat._id,
      Sender: messageData.Sender,
      Message: messageData.Message,
      MessageNumber: 1,
      Timestamp: messageData.Timestamp ? messageData.Timestamp : Date.now()
    });

    chatMessage.save((err) => {
      if(err){
        return reject({'StatusCode' : 500, 'Status':  'Chat Message Instantiation Failed - '+ err.toString()});
      }
      else{
        chat.save( (err) => {
          if(err){
            return reject({'StatusCode' : 500, 'Status':  'Chat Instantiation Failed - '+ err.toString()});
          }
          else{
            return resolve({
              'ChatID': chat._id,
              'Participants' : chat.Participants
            });
          }
        });
      }
    });

  });




};