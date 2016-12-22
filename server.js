var System = require('./app/config/System');
var secret = require('./app/config/Secret');
var socketLogic = require('./app/socket/socket.js');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = require('./app/routes/router');
var expressJWT = require('express-jwt');

//SKU - Upon initializing, make sure all necessary folder structures exists.
System.directoryCheck()

//SKU - Cross domain issue solution for Everest Web
app.use( (req, res, next)  =>{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
app.use(bodyParser.json());
app.use('/api', expressJWT({secret: secret}).unless({path: ['/api/token']}));
app.use('/', router);
app.use('/public', express.static('public'));

//ZKH - Connection URL
var url = 'mongodb://localhost:27017/EverestBack';

//ZKH - Connect Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(url, function(err) {
    if (err) throw err;
	console.log("Server connected successfully");
});

//ZKH - Connecting the Node server to port 3000
http.listen(3000, function(){
	console.log('listening on *:3000');
	socketLogic.socketBroker(io, (msg) => {
		console.log(msg);
	});
});
