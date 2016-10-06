var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/EverestBack';

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

//Express Route
app.get('/', function(req, res){
  //res.sendfile('index.html');
});

//Socket-io Connection
io.on('connection', function(socket){
  	console.log('a user connected');
  	socket.on('disconnect', function(){
  	  console.log('user disconnected');
  	});
});
	

	
