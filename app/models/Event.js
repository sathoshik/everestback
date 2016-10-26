var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var eventsSchema= new Schema({
	"Name" : {type: String, required: true},
	"EventImageURL" : {type: String, required: true},
	"Description" : {type: String, required: true},
	"Location" : {type: String, required: true},
	"StartTime" : Date,
	"EndTime" : Date,
	"AttendeeQRCodeURL" : {type: String, required: true},
	"AdminQRCodeURL" : {type: String, required: true},
	"EventQuestions" : {type: [String], required: true},
	"AdminID" : {type: [Number], required: true},
	"AtendeeID" : {type: [Number], required: true},
	"NewsfeedID" : {type: Number, required: true}
}); 

mongoose.model('Event', eventsSchema);

