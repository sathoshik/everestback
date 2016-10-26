var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var mongoose= require('mongoose');
var fs = require('fs');
var bodyParser = require('body-parser');

//ZKH - Parse application/json
app.use(bodyParser.json());

//ZKH - Load all of the models
fs.readdirSync(__dirname+"/app/models").forEach(function(filename){
	if(~filename.indexOf('.js')) require (__dirname+"\\app\\models\\"+filename)
});

//ZKH - Declare all models
var User= mongoose.model('User');
var Newsfeed= mongoose.model('Newsfeed');
var Event= mongoose.model('Event');

//ZKH - Connection URL
var url = 'mongodb://localhost:27017/EverestBack';

//ZKH - Connect Mongoose
mongoose.connect(url, function(err) {
    if (err) throw err;
	console.log("Server connected successfully");
});

//ZKH - Connecting the Node server to port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});

//ZKH - GET
app.get('/',function(req,res){
  res.send('Welcome to EverestBack');
   });

app.get('/getAllUsers', function(req, res){
	
	User.find({}, function (err, users){
		res.send(users);
	});
});

//ZKH - POST
app.post('/addUser',function(req,res){
	var User= mongoose.model('User');
	var newUser= new User({
		Email: req.body.Email,
		Password: req.body.Password,
		FirstName: req.body.FirstName,
		LastName: req.body.LastName
		
	});
	
	newUser.save(function(err){
		if(err) throw err;
	});
	
	res.send("Succesfully added a user");
});

//ZKH - Socket-io Connection
io.on('connection', function(socket){
  	console.log('a user connected');
  	socket.on('disconnect', function(){
  	  console.log('user disconnected');
  	});
});
	

	
