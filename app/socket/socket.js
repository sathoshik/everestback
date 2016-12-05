//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

var eventController = require('../controllers/EventController');
var newsfeedController = require('../controllers/NewsfeedController');

//ZKH - I/O stream for client-side Socket instances
var io;

/**
 * Set Module package as exports
 * @constructor
 */
var exports = module.exports = {};


/**
 * Invoked upon successfully initializing the server-side socket
 * @return {emit} Emit information back to all connected clients.
 */
var successfullySetSocket = () => {

  //ZKH - Socket-io Connection
  io.on('connection', function (socket) {
    console.log('a user connected');

    //ZKH -The unique identifier for the room will be the same as NewsfeedID
    //ZKH - Subscribing to a Newsfeed Room
    socket.on('newsfeed subscribe', function (data, callback) {
      eventController.checkIfUserIsPartOfEvent(data.event_id, data.user_id, null, true,
        (userIsPartOfEvent, event) => {
          if (userIsPartOfEvent) {
            let room = event.NewsfeedID;
            console.log(data.user_id, 'is joining room', room);
            socket.join(room);
            socket.emit('newsfeed subscribe response');
            return callback({'valid': true});
          } else {
            return callback({'valid': false});
          }
        });
    });

    socket.on('add newsfeed post', function (data, callback) {
      eventController.checkIfUserIsPartOfEvent(data.event_id, data.user_id, "admin", true,
        (adminIsPartOfEvent, event) => {
          if (adminIsPartOfEvent && data.room == event.NewsfeedID) {
            newsfeedController.appendNewPost(event.NewsfeedID, data, (isSuccessful) => {
              if (isSuccessful) {
                //ZKH - data.room keeps each newsfeed on the platform seperate
                io.in(data.room).emit('new newsfeed posts',
                  {
                    name: (data.firstName + ' ' + data.lastName ),
                    profilePicURL: data.profilePicURL,
                    post: data.post
                  }
                );
                callback({'valid': true});
              } else {
                callback({'valid': false});
              }
            });
          } else {
            callback({'valid': false});
          }
        });

    });
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
  });
};


/**
 * Set the socket to the module.
 * @param {connection} _io Socket connection derived from SocketIO
 * @param {function} callBack Acknowledgement call back function
 * @return {function} callBack
 */
exports.setSocket = (_io, callBack) => {
  if (_io !== null) {
    io = _io;
    successfullySetSocket();
    callBack("Socket connected successfully");
  } else {
    callBack("Socket was empty and was not connected successfully");
  }
};
