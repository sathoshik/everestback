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
 * @param {request} req
 * @param {response} res
 * @param {function} resolve
 * @param {function} reject
 * @return {event} object or error message.
 */
ChatController.instantiateChat = (req, res, resolve, reject) => {
  var chat = new Chat({
    EventID: req.params.event,
    Participants: req.query.participants,
    MessageCount: 1
  });

  var chatMessage = new ChatMessage({
    ChatID: chat._id,
    Sender: req.body.Sender,
    Message: req.body.Message,
    MessageNumber: 1,
    Timestamp: req.body.Timestamp ? req.body.Timestamp : Date.now()
  });

  chatMessage.save( (err) => {
    if(err){
      res.status(500);
      res.send({'error' : err.toString()});
      return reject('Chat Message Instantiation Failed : '+ err.toString());
    }
    else{
      chat.save( (err) => {
        if(err){
          res.status(500);
          res.send({'error' : err.toString()});
          return reject('Chat Instantiation Failed : ' + err.toString());
        }
        else{
          return resolve({
            ChatID: chat._id,
            Participants : chat.Participants
          });
        }
      });
    }
  });




};