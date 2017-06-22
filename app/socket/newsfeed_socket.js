
var exports = module.exports;
var eventController = require('../controllers/EventController');
var newsfeedController = require('../controllers/NewsfeedController');

/**
 * Invoked upon successfully initializing the server-side socket
 */
exports.setNewsfeedSocket = (io) => {

  //ZKH - Creating a newsfeed namespace
  var nsp = io.of('/newsfeed');

  //ZKH - Socket-io Connection
  nsp.on('connection', function (socket) {
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
          if (adminIsPartOfEvent) {
            newsfeedController.appendNewPost(event.NewsfeedID, data, (isSuccessful) => {
              if (isSuccessful) {
                //ZKH - data.room keeps each newsfeed on the platform seperate
                nsp.in(event.NewsfeedID).emit('new newsfeed posts',
                  {
                    name: (data.firstName + ' ' + data.lastName ),
                    profilePicURL: data.profilePicURL,
                    post: data.post,
                    timestamp: data.timeStamp
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
