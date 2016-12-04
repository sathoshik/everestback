//  Everest_Back
//
//  Created by Sathoshi Kumarawadu on 2016-10-08.
//  Copyright © 2016 Everest. All rights reserved.
//
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;


/**
 * Define salt work factor.
 * Work Factor is defined as the amount of effort (usually measured in units of time)
   needed to break a cryptosystem.
 * @benchmark 13 - 0.56773639917374 seconds
 */
const SALT_WORK_FACTOR =  13;


/**
 * Define User Schema
 *
 */
var userSchema = new Schema ({
	"Email" : {type: String, required: true, index: { unique: true } },
	"Password" : {type: String, required: true },
	"FirstName" : {type: String, default: null, required: false },
	"LastName" : {type: String, default: null, required: false },
	"ProfileImageURL" : {type: String, default: null, required: false },
	"LatestLoginTimestamp" : {type: Date, default:null, required: false },
  "LatestLogoutTimestamp" : {type: Date, default:null, required: false },
	"OriginTimestamp" : {type: Date, default:null, required: false },
	"AttendeeEventID" : {type: [mongoose.Schema.Types.ObjectId], default:null, required: false },
	"AdminEventID" :{type: [mongoose.Schema.Types.ObjectId], default:null, required: false }
});


/**
 * Upon initialization of User, Hash and salt password.
 *
 */
userSchema.pre('save', function (next) {
  let user = this;
  //SKU - Only hash the password if it has been modified/new
  if (!user.isModified('Password')) return next();

  //SKU - Generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    //SKU - Hash the password using our new salt
    bcrypt.hash(user.Password, salt, (err, hash) => {
      if (err) return next(err);

      //SKU - Override the original password with the hashed one
      user.Password = hash;
      next();
    });
  });
});


/**
 * Compare requested password with the salted and hashed password in the db.
 * @param {string} requestPassword, {function} callBack
 * @return callBack or isMatch = true/false
 */
userSchema.methods.comparePassword = function(requestPassword, callBack) {
    bcrypt.compare(requestPassword, this.Password, (err, isMatch) => {
      if (err) return callBack(err);
      callBack(null, isMatch);
    });
};


/**
 * Add User Model to global mongoose model object and users collections
 * @constructor
 * @param {string} User, {Schema} userSchema
 */
 mongoose.model('User', userSchema);

