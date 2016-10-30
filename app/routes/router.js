var router = require('express').Router();
var userController = require('../controllers/UserController');
var eventController = require('../controllers/EventController');
var newsfeedController = require('../controllers/NewsfeedController');


//ZKH - GET
router.get('/',function(req,res){
  res.send('Welcome to EverestBack');
   });

router.get('/getAllUsers',function(req,res){
	userController.getAllUsers(req,res);
});

//ZKH - POST
router.post('/addUser',function(req,res){
	userController.addUser(req,res)
});

module.exports = router;