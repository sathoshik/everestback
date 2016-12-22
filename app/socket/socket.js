//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//
var newsfeedModule = require('./newsfeed_socket');
var chatModule = require('./chat_socket');

//ZKH - I/O stream for client-side Socket instances
var io;

/**
 * Set Module package as exports
 * @constructor
 */
var exports = module.exports = {};

/**
 * Set the socket to the module.
 * @param {connection} _io Socket connection derived from SocketIO
 * @param {function} callBack Acknowledgement call back function
 * @return {function} callBack
 */
exports.socketBroker = (_io, callBack) => {
  if (_io !== null) {
    io = _io;
    newsfeedModule.setNewsfeedSocket(_io);
    chatModule.setChatSocket(_io);
    callBack("Socket connected successfully");
  } else {
    callBack("Socket was empty and was not connected successfully");
  }
};
