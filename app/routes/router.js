var router = require('express').Router();
var userController = require('../controllers/UserController');
var eventController = require('../controllers/EventController');
var newsfeedController = require('../controllers/NewsfeedController');
var chatController = require('../controllers/ChatController');
var jwt = require('jsonwebtoken');
var secret = require('../config/Secret');
var imageUploader = require('../helpers/Tools').imageUploader();
var path = require('path');
var ObjectID = require('mongoose').Types.ObjectId;

// ZKH - ******PUBLIC ROUTES******

// ZKH - GET
router.get('/', (req, res) => {
  res.send('Welcome to EverestBack');
});

/**
 * Sign in user api end point at {ip}:3000/signInUser
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "Email" : "",
 *                "Password" : ""
 *              }
 * @return user._id or error
 */
router.post('/signInUser', (req, res) => {
  userController.signInUser(req, res);
});

/**
 * Sign up user api end point at {ip}:3000/createNewUser
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "Email" : "",
 *                "Password" : ""
 *              }
 * @return user._id or error
 */
router.post('/createNewUser', (req, res) => {
  userController.createNewUser(req, res);
});

// SKU - This route is subject to change
/**
 * Create event api end point at {ip}:3000/createEvent
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "EventName" : "",
 *                "Description" : "",
 *                "Location": "",
 *                "StartTime": {DateTime},
 *                "EndTime" : {DateTime},
 *                "EventQuestions" : [],
 *                "UserId" : "_id"
 *               }
 * @return {void} or error
 */
router.post('/createEvent', (req, res) => {
  eventController.createEvent(req, res, (eventID, UserId) => {
    userController.registerEventID(UserId, eventID, true)
      .then((data) => {
        res.status(data.StatusCode);
        res.send(data.Status);
      })
      .catch((error) => {
        res.status(error.StatusCode);
        res.send({ 'error' : data.Status });
      });
  });
});

/**
 * Join event api end point at {ip}:3000/Event/{EventID}/JoinEvent/{"admin" OR "attendee"}/{UserID}?key={"adminKey" OR "attendeeKey"}
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return {void} or error
 */
router.post('/Event/:event/JoinEvent/:userType/:user', (req, res) => {
  if((req.query.key != null || req.query.key != undefined)
    && ObjectID.isValid(req.params.event)
    && ObjectID.isValid(req.params.user)
    && (req.params.userType.toLowerCase() ==='admin' || (req.params.userType.toLowerCase() === 'attendee'))) {
    eventController.registerUserID(req.params.event, req.params.user, req.params.userType === 'admin', req.query.key)
      .then((data) => {
        return userController.registerEventID(req.params.user, req.params.event, req.params.userType === 'admin');
      })
      .then((data) => {
        res.status(data.StatusCode);
        res.send(data.Status);
      })
      .catch((error) => {
        res.status(error.StatusCode);
        res.send({ 'error': error.Status });
      });
  } else {
    res.status(400);
    res.send({ 'error': 'Bad Request' });
  }
});

/**
 * Add additional user information api end point at
 * {ip}:3000/setUserProfileFields?id={user._id}
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "FirstName" : "",
 *                "LastName" : ""
 *              }
 * @paramObject {jpg} image [optional]
 * @return status 200 or error
 */
router.post('/setUserProfileFields', (req, res) => {
  userController.addUserProfileFields(req, res);
});

/**
 * Fetch all events user is part of at {ip}:3000/User/{UserObjectID}/FetchAllEvents
 * @param {request} req, {response} res
 * @return {
 *          AdminEvents:[],
 *          AttendeeEvents:[]
 *         }
 */
router.get('/User/:user/FetchAllEvents', (req, res) => {
  userController.fetchEventList(req, res, (eventList) => {
    if(eventList !== null || eventList !== undefined) {
      if(eventList.AdminEventID.length >= 1 || eventList.AttendeeEventID.length >= 1) {
        eventController.fetchEventObjects(eventList, req, res);
      } else {
        res.status(404);
        res.send({ 'error': 'The user is not a member of an event' });
      }
    } else {
      res.status(404);
      res.send({ 'error': 'The user is not a member of an event' });
    }
  });
});

/**
 * Fetch all members of an event at {ip}:3000/Event/{EventID}/FetchAllUsers?filter={"Admin" OR "Attendee"}
 * @param {request} req, {response} res
 * @return {
 *          Admins:[],
 *          Attendees:[]
 *         }
 */
router.get('/Event/:event/FetchAllUsers', (req, res) => {
  if(ObjectID.isValid(req.params.event)) {
    if (req.query.filter) {
      if (req.query.filter === 'Admin' || req.query.filter === 'Attendee') {
        eventController.fetchAllUserIDs(req.params.event, req.query.filter)
          .then((data) => {
            if (req.query.filter === 'Admin') {
              return userController.fetchUserDetails(data.Admins);
            } else {
              return userController.fetchUserDetails(data.Attendees);
            }
          })
          .then((users) => {
            res.status(200);
            res.send(req.query.filter === 'Admin' ? { Admins: users } : { Attendees: users });
          })
          .catch((error) => {
            res.status(error.StatusCode);
            res.send(error.Status);
          });
      } else {
        res.status(400);
        res.send({ 'error': 'Bad Request' });
      }
    } else {
      var responseObject = {};
      var userIDsObject;

      eventController.fetchAllUserIDs(req.params.event, null)
        .then((data) => {
          userIDsObject = data;
          if(userIDsObject.Admins.length < 1) {
            return [];
          }
          return userController.fetchUserDetails(userIDsObject.Admins, {
            FirstName: 1,
            LastName: 1,
            ProfileImageURL: 1
          });
        })
        .then((adminDetails) => {
          responseObject.Admins = adminDetails;

          if(userIDsObject.Attendees.length < 1) {
            return [];
          }
          return userController.fetchUserDetails(userIDsObject.Attendees, {
            FirstName: 1,
            LastName: 1,
            ProfileImageURL: 1
          });
        })
        .then((attendeeDetails) => {
          responseObject.Attendees = attendeeDetails;
          res.status(200);
          res.send(responseObject);
        })
        .catch((error) => {
          res.status(error.StatusCode);
          res.send(error.Status);
        });
    }
  } else {
    res.status(400);
    res.send({ 'error': 'Bad Request' });
  }
});

/**
 * Retrieve admin event api end point at {ip}:3000/Event/{EventObjectID}?key={AdminKey}
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return void or error
 */
router.get('/Event/:event', (req, res) => {
  eventController.getEventDescription(req, res);
});

/**
 * Create new chat instance at {ip}:3000/Event/{EventObjectID}?participants={Participant 1's ID}&participants={Participant 2's ID}&...
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return {
 *          chatID:{ObjectID}
 *         }
 *
 */
router.post('/Event/:event/CreateChat', (req, res) => {
  if(req.body.UserID === undefined || req.body.UserID === null ||
    req.body.Message === undefined || req.body.Message === null ||
    req.params.event === null || req.query.participants.length < 2) {
    res.status(400);
    res.send({ 'error': 'Bad request' });
  } else {
    chatController.instantiateChat(req.params.event, req.query.participants, req.body)
      .then((data) => {
        return userController.registerChatID(req.params.event, data);
      })
      .then((data) => {
        res.status(data.StatusCode);
        res.send(data.Status);
      })
      .catch((error) => {
        res.status(error.StatusCode);
        res.send({ 'error': error.Status });
      });
  }
});

/**
 * Fetch all chats and latest message for a user at {ip}:3000/User/{UserID}/Event/{EventID}/FetchAllChats
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return {
 *          ChatID: {String},
 *          Participants:[{UserID: {String}, FirstName: {String}, LastName: {String}}],
 *          LatestMessage: {MessageObject}
 *         }
 *
 */
router.get('/User/:user/Event/:event/FetchAllChats', (req, res) => {
  if(!ObjectID.isValid(req.params.user) || !ObjectID.isValid(req.params.event)) {
    res.status(400);
    res.send({ 'error': 'Bad request' });
  } else {
    userController.fetchUserChats(req.params.user, req.params.event)
      .then((IDs) => {
        return chatController.fetchChatDetails(IDs, {
          _id: 1,
          Participants: 1,
          MessageCount: 1
        });
      })
      .then((chats) => {
        return userController.fetchChatParticipantDetails(chats);
      })
      .then((chats) => {
        return chatController.fetchLatestMessageWithParticipants(chats);
      })
      .then((responseData) => {
        res.status(200);
        res.send(responseData);
      })
      .catch((error) => {
        res.status(error.StatusCode);
        res.send(error.Status);
      });
  }
});

/**
 * Fetch messages for a chat at {ip}:3000/User/{UserID}/Chat/{ChatID}/FetchMessages?upperbound={Number}&lowerbound={Number}
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return [{MessageObject}]
 *
 */
router.get('/User/:user/Chat/:chat/FetchMessages', (req, res) => {
  if(!ObjectID.isValid(req.params.user) || !ObjectID.isValid(req.params.chat) ||
    req.query.lowerbound == null ||req.query.lowerbound == undefined || isNaN(req.query.lowerbound) || Number(req.query.lowerbound) <= 0 ||
    req.query.upperbound == null ||req.query.upperbound == undefined || isNaN(req.query.upperbound)) {
    res.status(400);
    res.send({ 'error': 'Bad request' });
  } else {
    chatController.isUserPartOfChat(req.params.user, req.params.chat)
      .then((isPartOfChat) => {
        if(isPartOfChat) {
          return chatController.fetchDeltaMessages(req.params.chat, req.query.lowerbound, req.query.upperbound);
        }
      })
      .then((messages) => {
        res.status(200);
        res.send(messages);
      })
      .catch((error) => {
        res.status(error.StatusCode);
        res.send(error.Status);
      });
  }
});

/**
 * Fetch Latest Newsfeed Posts at {ip}:3000/User/{UserID}/Event/{EventID}/FetchLatestNewsfeed
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return [{Posts}]
 *
 */
router.get('/User/:user/Event/:event/FetchLatestNewsfeed', (req, res) => {
  if(!ObjectID.isValid(req.params.user) || !ObjectID.isValid(req.params.event)) {
    res.status(400);
    res.send({ 'error': 'Bad request' });
  } else {
    eventController.checkIfUserIsPartOfEvent(req.params.event, req.params.user, null, true,
      (userIsPartOfEvent, event) => {
        if(userIsPartOfEvent) {
          newsfeedController.fetchAllPosts(event.NewsfeedID)
            .then((posts) => {
              res.status(200);
              res.send({ 'Posts': posts });
            })
            .catch((error) => {
              res.status(error.StatusCode);
              res.send(error.Status);
            });
        } else {
          res.status(401);
          res.send('Unauthorized Request');
        }
      });
  }
});

// SKU - This route is probably useless.
/**
 * Upload Image api end point at {ip}:3000/uploadImage
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return void or error
 */
router.post('/uploadImage', (req, res) => {
  imageUploader(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.end('Error uploading file.');
    }
    res.end('File is uploaded');
  });
});

// ZKH - ******END PUBLIC ROUTES******


// ZKH - ******PROTECTED ROUTES******

router.get('/api/token', (req, res) => {
  var token = jwt.sign({ foo: 'bar' }, secret);
  res.send({ token: token });
});

router.get('/api/protected', (req, res) => {
  res.send('Welcome to /api/protected route.');
});

// ZKH - ******END PROTECTED ROUTES******


// ZKH - ******TESTING ROUTES*********


/**
 * Get all users api end point at {ip}:3000/testing/getAllUsers
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return Json hash of users or error
 */
router.get('/testing/getAllUsers', (req, res) => {
  userController.testingGetAllUsers(req, res);
});


/**
 * Get all events api end point at {ip}:3000/testing/getAllEvents
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return Json hash of events or error
 */
router.get('/testing/getAllEvents', (req, res) => {
  eventController.testingGetAllEvents(req, res);
});


/**
 * Newsfeed testing page end point at {ip}:3000/testing/newsfeed
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return Web page platform to test newsfeed
 */
router.get('/testing/newsfeed', (req, res) => {
  let joinedPath = path.join(__dirname +
    '/../../test_clients/newsfeed_client/newsfeed_client.html');
  let normalizedPath = path.normalize(joinedPath);
  res.sendFile(normalizedPath);
});

/**
 * Newsfeed testing page end point at {ip}:3000/testing/chat
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return Web page platform to test chat
 */
router.get('/testing/chat', (req, res) => {
  let joinedPath = path.join(__dirname +
    '/../../test_clients/chat_client.html');
  let normalizedPath = path.normalize(joinedPath);
  res.sendFile(normalizedPath);
});


/**
 * Get all newsfeed api end point at {ip}:3000/testing/getAllNewsfeeds
 * @param {request} req incoming request
 * @param {response} res callback response
 * @return Json hash of newsfeed or error
 */
router.get('/testing/getAllNewsfeeds', (req, res) => {
  newsfeedController.testingGetAllNewsfeeds(req, res);
});


/**
 * Create new event api end point at {ip}:3000/testing/createNewEvent
 * @param {request} req incoming request
 * @param {response} res callback response
 * @paramObject { "EventName" : "",
 *                "Description" : "",
 *                "Location": "",
 *                "StartTime": {DateTime},
 *                "EndTime" : {DateTime},
 *                "EventQuestions" : {  "Skills" : "" ,
 *                                      "Interests" : "" }
 *               }
 * @return Json hash of newsfeed or error
 */
router.post('/testing/createNewEvent', (req, res) => {
  eventController.testingCreateEvent(req, res);
});

// ZKH - ******END TESTING ROUTES******


/**
 * Add Router to global module object
 * @constructor
 */
module.exports = router;
