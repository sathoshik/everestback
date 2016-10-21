var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema= new Schema({
	"Email" : {type: String, required: true},
	"Password" : {type: String, required: true},
	"FirstName" : {type: String, required: true},
	"LastName" : {type: String, required: true},
	"ProfileImageURL" : {type: String, default: null},
	"LastLoginTimestamp" : {type: Date, default:null },
	"OriginTimestamp" : {type: Date, default:null },
	"AttendeeEventID" : {type: [Number], default:null },
	"AdminEventID" :{type: [Number], default:null }
}); 

 mongoose.model('User', userSchema);

