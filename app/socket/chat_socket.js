var exports = module.exports;
var eventController = require('../controllers/EventController');
var chatController = require('../controllers/ChatController');

/**
 * Invoked upon successfully initializing the server-side socket
 * @param {Object} io (Server side io stream)
 * @return {emit} Emit information back to all connected clients.
 */
exports.setChatSocket = (io) => {

  //ZKH - Creating a Chat Namespace
  var nsp = io.of('/chat');

  //ZKH - Socket-io Connection
  nsp.on('connection', function (socket) {
    //ZKH - Perform Chat Logic Here

    //ZKH - Chat Subscribe

    /** Subscribing to a Chat
     * @param {Object} data
     * @param {Function} callback
     * @return callback
     */
    socket.on('chat subscribe', function (data, callback) {
      eventController.checkIfUserIsPartOfEvent(data.EventID, data.UserID, null, false,
        (userIsPartOfEvent) => {
          if (userIsPartOfEvent) {
            let room = data.ChatID;
            console.log(data.UserID, 'is joining room', room);
            socket.join(room);
            return callback({'valid': true});
          } else {
            return callback({'valid': false});
          }
        });
    });

    /** Sending a Message in a Chat
     * @param {Object} data
     * {ChatID: {String},
     * UserID: {String},
     * FirstName: {String},
     * LastName: {String},
     * ProfileImageURL: {String},
     * Message: {String},
     * TimeStamp: {Date}}
     * @param {Function} callback
     * @return callback
     */
    socket.on('add chat message', function (data, callback) {
      chatController.createMessage(data)
        .then((chatMessage) => {
          //ZKH - data.ChatID keeps each chat on the platform seperate
          nsp.in(data.ChatID).emit('new chat message',
            {
              ChatID: chatMessage.ChatID,
              UserID: chatMessage.UserID,
              FirstName: chatMessage.FirstName,
              LastName: chatMessage.LastName,
              ProfileImageURL: chatMessage.ProfileImageURL,
              Message: chatMessage.Message,
              MessageCount: chatMessage.MessageCount,
              TimeStamp: chatMessage.TimeStamp
            }
          );
          return callback({'valid' : true});
        })
        .catch((err) => {
          return callback({'valid' : false, 'status' : err.error});
        });
    });

  });
};

