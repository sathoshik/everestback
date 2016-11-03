var userController = this;
var mongoose = require('mongoose');
var fs = require('fs');
var normalizedPath = require("path").join(__dirname, "../models");

//ZKH - Load all of the models
fs.readdirSync(normalizedPath).forEach(function(filename){
	if(~filename.indexOf('.js')) require (normalizedPath+"/"+filename)
});

var User = mongoose.model('User');

userController.getAllUsers= function(req, res){
	User.find({}, function (err, users){
		res.send(users);
	});
};

userController.addUser=function(req,res){
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
};

module.exports = userController;