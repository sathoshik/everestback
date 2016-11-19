var exports = module.exports = {};
var eventController = require('../controllers/EventController');
var newsfeedController = require('../controllers/NewsfeedController');

//ZKH - I/O stream for client-side Socket instances
var io;

/**
 * Invoked upon successfully initializing the server-side socket
 */
var successfullySetSocket = () => {

    //ZKH - Socket-io Connection
    io.on('connection', function(socket){
        console.log('a user connected');

        //ZKH -The unique identifier for the room will be the same as NewsfeedID
        //ZKH - Subscribing to a Newsfeed Room
        socket.on('newsfeed subscribe', function(data, callback) {
            eventController.checkIfUserIsPartOfEvent(data.event_id, data.user_id, null, true, (userIsPartOfEvent, event) => {
                if(userIsPartOfEvent){
                    let room = event.NewsfeedID;
                    console.log(data.user_id, 'is joining room', room);
                    socket.join(room);

                    //ZKH - TODO: emit the last 10 messages as soon as the user is subscribed so the feed is not empty
                    callback("Successfully subscribed to the Newsfeed room");
                }
                else{
                    callback("Connecting to the Newsfeed failed");
                }
            });
        });

        socket.on('add newsfeed post', function(data, callback) {
            eventController.checkIfUserIsPartOfEvent(data.event_id, data.user_id, "admin", true, (adminIsPartOfEvent, event) => {
                if(adminIsPartOfEvent && data.room == event.NewsfeedID){

                    newsfeedController.appendNewPost(event.NewsfeedID, data, (isSuccessful) => {
                        if(isSuccessful){

                            //ZKH - data.room keeps each newsfeed on the platform seperate
                            socket.broadcast.to(data.room).emit('new newsfeed posts',
                                //ZKH - TODO refactor this return object to our needs in the front end
                                [{
                                    name:null,
                                    profilePicURL: null,
                                    post: data.post
                                }]
                            );
                            callback("Post was successfully added");
                        }
                        else{
                            callback("Could not complete the request");
                        }
                    });


                }
                else{
                    callback("User is not an admin of this event or an incorrect room number was provided");
                }
            });

        });
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });
};

//ZKH - Exports
exports.setSocket = (_io, callback) => {
    if(_io != null){
        io = _io;
        successfullySetSocket();
        callback("Socket connected successfully");
    }
    else{
        callback("Socket was empty and was not connected successfully");
    }
};
