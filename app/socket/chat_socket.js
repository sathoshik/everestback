var exports = module.exports;
var eventController = require('../controllers/EventController');

/**
 * Invoked upon successfully initializing the server-side socket
 * @param {Object} io (Server side io stream)
 * @return {emit} Emit information back to all connected clients.
 */
exports.setChatSocket = (io) => {

  //ZKH - Socket-io Connection
  io.on('connection', function (socket) {
    //ZKH - Perform Chat Logic Here

    //ZKH - Chat Subscribe
    /** Subscribing to a Chat
     * @param
     */
    socket.on('chat subscribe', function (data, callback) {
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
  });
};

