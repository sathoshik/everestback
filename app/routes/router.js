var router = require('express').Router();
var userController = require('../controllers/UserController');
var eventController = require('../controllers/EventController');
var newsfeedController = require('../controllers/NewsfeedController');
var jwt = require('jsonwebtoken');
var secret = require('../config/Secret')

//ZKH - ******PUBLIC ROUTES******

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

//ZKH - ******END PUBLIC ROUTES******



//ZKH - ******PROTECTED ROUTES******

//ZKH - GET 

//ZKH - This route is unprotected *For Testing*
router.get('/api/token', function(req, res) {
  var token = jwt.sign({foo: 'bar'}, secret);
  res.send({token: token});
});

router.get('/api/protected', function(req, res) {
  res.send('Welcome to /api/protected route.');
});

//ZKH - ******END PROTECTED ROUTES******


module.exports = router;