var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newsfeedSchema= new Schema({
	"EventID" : {type: Number, required:true },
	"Status" : {type: String, required: true},
	"Timestamp" : {type: Date, default:null },
	"UserID" : {type: Number, required:true }
}); 

mongoose.model('Newsfeed', newsfeedSchema);
