var newsfeedController= this;
var mongoose= require('mongoose');
var fs = require('fs');
var normalizedPath = require("path").join(__dirname, "../models");

//ZKH - Load all of the models
fs.readdirSync(normalizedPath).forEach(function(filename){
	if(~filename.indexOf('.js')) require (normalizedPath+"\\"+filename)
});

module.exports=newsfeedController;