//  Everest_Back
//
//  Created by Sathoshi Kumarawadu on 2016-11-06.
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/User');

var imageUploader = require('../helpers/Tools').imageUploader();
var fs = require('fs');
var mongoose = require('mongoose');


/**
 * User mongoose model initializer
 * @constructor
 * @param {User}
 */
var User = mongoose.model('User');


/**
 * UserController Initializer
 * @constructor
 */
var UserController = this;


UserController.getAllUsers = function (req, res) {
  User.find({}, function (err, users) {
    res.send(users);
  });
};


//SKU - Should we safe guard against extra parameters that could be sent?
/**
 * Add User object to users collections
 * @param {request} req, {response} res
 * @return respond with user._id or error
 */
UserController.createNewUser = (req, res) => {

  imageUploader(req, res, (err) => {

    if (err) {
      res.status(500);
      res.end(err);
    }

    //SKU - Initialize User object with associated with mongoose model.
    var user = new User(req.body);
    //SKU - If the request does not have email && password, return 500 error.
    if (user.Email != null && user.Password != null) {

      if (req.files.length > 0) {
        user.ProfileImageURL = req.files[0].path;
      } else {
        //SKU - Reference default image.
        user.ProfileImageURL = "/public/uploads/Everest1478401348492.jpg";
      }

      //SKU - Once the image has been uploaded, check if the image is in the correct path. If not, respond with error
      fs.access(__dirname + "/../../" + user.ProfileImageURL, fs.R_OK | fs.W_OK, (err) => {
        if (err) {
          console.log(err);
          res.end(err.toString());
        }
        else {
          //SKU - Add user object to the users Collection
          user.save((err) => {
            if (err) {
              console.log(err);
              res.status(500);
              res.end(err.toString());
            } else {
              res.status(200);
              res.send(user._id);
            }
          });
        }
      });
    } else {
      res.status(500);
      res.send();
    }
  });
};


/**
 * Add UserController to global module object
 * @constructor
 */
module.exports = UserController;