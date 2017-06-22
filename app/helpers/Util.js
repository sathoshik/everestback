//  Everest_Back
//
//  Created by Everest on 2016-11-30.
//  Copyright © 2016 Everest. All rights reserved.
//

/* eslint func-style: [2, "expression"] */
var Util = function() {};

Util.prototype.generateToken = function() {
  return Math.random().toString(36).substring(2);
};

module.exports = new Util();
