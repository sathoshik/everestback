//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/Chat');
require('../models/ChatMessage');

var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;

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
ChatController.instantiateChat = (eventID, participants, messageData) => {

  return new Promise((resolve, reject) => {

    var chat = new Chat({
      EventID: eventID,
      Participants: participants,
      MessageCount: 1
    });

    var chatMessage = new ChatMessage(messageData);

    //ZKH - First message in the chat
    chatMessage.MessageNumber = 1;

    chatMessage.ChatID = chat._id;

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

/**
 * Create a new message
 * @param {Object} messageData
 * {ChatID: {String},
  * UserID: {String},
  * FirstName: {String},
  * LastName: {String},
  * ProfileImageURL: {String},
  * Message: {String},
  * TimeStamp: {Date}}
 * @return Promise
 */
ChatController.createMessage = (messageData) => {

  return new Promise((resolve, reject) => {

    Chat.findOneAndUpdate({_id: ObjectID(messageData.ChatID)},
      {$inc: {MessageCount: 1}},
      {new: true},
      (err, chat) => {
        if(err){
         return reject({'error' : err.toString()});
        }
        else if(chat == null || chat == undefined){
         return reject({'error' : 'Chat object could not be found'});
        }
        else{
          var chatMessage = new ChatMessage(Object.assign({}, messageData, {MessageNumber: chat.MessageCount}));
          chatMessage.save((err, newDoc) => {
            if(err){
              chat.MessageCount--;
              chat.save();
              return reject({'error' : err.toString()});
            }
            return resolve(chatMessage);
          })
        }
      });
  });
};

/**
 * Fetch chat(s) details
 * @param {Array} chatIDs
 * @return Promise
 */
ChatController.fetchChatDetails = (chatIDs, filter) => {

  return new Promise((resolve, reject) => {

    Chat.find({_id: {$in: chatIDs}},
      filter,
      (err, chats) => {
        if(err){
          reject({'error' : err.toString()});
        }
        else if(chats.length < 1){
          reject({'error' : 'Chat object could not be found'});
        }
        else{
          resolve(chats);
        }
      });
  });
};


/**
 * Fetch Latest Message per chat with Participants
 * @param {Array} chatData
 * @return Promise
 */
ChatController.fetchLatestMessageWithParticipants = (chatData) => {

  return new Promise((resolve, reject) => {
    var messagesAndParticipants = [], counter = 0;
    var setMessagesAndParticipants = (data) => {
      counter++;
      messagesAndParticipants.push(data);
      if(counter == chatData.length - 1){
        resolve(messagesAndParticipants);
      }
    };

    for(let i = 0; i < chatData.length; i++){
      ChatMessage.findOne({$and: [{"ChatID" : chatData[i].ChatID}, {"MessageNumber" : {$eq: chatData[i].MessageCount}}]},
        {
          _id: 0,
          ChatID: 0
        },
        (err, message) => {
          if(err){
            reject({'StatusCode': 404,'Status' : err.toString()});
          }
          else if(!message){
            reject({'StatusCode': 404,'Status' : "Message not found"});
          }
          else{

            setMessagesAndParticipants({
              ChatID: chatData[i].ChatID,
              Participants: chatData[i].Participants,
              LatestMessage: message
            });
          }
        });
    }
  });
};