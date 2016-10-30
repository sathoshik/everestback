var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = require('./app/routes/router');
var expressJWT = require('express-jwt');
var secret = require('./app/config/Secret');

//ZKH - Express Middleware
app.use(bodyParser.json());
app.use('/', router);
app.use('/api', expressJWT({secret: secret}).unless({path: ['/api/token']}));

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

//ZKH - Socket-io Connection
io.on('connection', function(socket){
  	console.log('a user connected');
  	socket.on('disconnect', function(){
  	  console.log('user disconnected');
  	});
});

	

	
