//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//
var newsfeedModule = require('./newsfeed_socket');
var chatModule = require('./chat_socket');

//ZKH - I/O stream for client-side Socket instances
var io;

var exports = module.exports = {};

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
