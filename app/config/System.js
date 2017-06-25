//  Everest_Back
//
//  Created by Sathoshi Kumarawadu on 2016-10-08.
//  Copyright © 2016 Everest. All rights reserved.
//

var SystemDirectory = require('./constants/SystemDirectory.json');
var fs = require('fs');

/**
 * System check for all folder structure variables throughout environment
 */
var System = this;

/**
 * System check for all folder structure variables throughout environment
 */
System.directoryCheck = () => {
  for (var directory in SystemDirectory) {
    try {
      if (fs.statSync(__dirname + '/../..' + SystemDirectory[directory]).isDirectory()) {
        continue;
      }
    } catch (err) {
      try {
        fs.mkdirSync(__dirname + '/../..' + SystemDirectory[directory]);
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
  }
  return;
};
