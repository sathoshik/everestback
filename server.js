var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var mongoose= require('mongoose');
var fs = require('fs');
var bodyParser = require('body-parser');

// parse application/json
app.use(bodyParser.json());

//Load all of the models
fs.readdirSync(__dirname+"/app/models").forEach(function(filename){
	if(~filename.indexOf('.js')) require (__dirname+"\\app\\models\\"+filename)
});

//Declare all models
var User= mongoose.model('User');
var Newsfeed= mongoose.model('Newsfeed');
var Event= mongoose.model('Event');

// Connection URL
var url = 'mongodb://localhost:27017/EverestBack';

//Connect Mongoose
mongoose.connect(url);

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
 	 assert.equal(null, err);
 	 console.log("Connected successfully to server");	
	
 	 db.close();
});

//Connecting the Node server to port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});

//GET
app.get('/',function(req,res){
  res.send('Welcome to EverestBack');
   });

app.get('/getAllUsers', function(req, res){
	
	User.find({}, function (err, users){
		res.send(users);
	});
});

//POST
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

//Socket-io Connection
io.on('connection', function(socket){
  	console.log('a user connected');
  	socket.on('disconnect', function(){
  	  console.log('user disconnected');
  	});
});
	

	
