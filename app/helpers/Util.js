//  Everest_Back
//
//  Created by Everest on 2016-11-30.
//  Copyright © 2016 Everest. All rights reserved.
//

/**
 * General Util class
 * @constructor
 */
var Util = function(){}


/**
 * Generate random 16 bit string tokens
 * @return 16 bit randomly generated string
 */
Util.prototype.generateToken = function(){
  return Math.random().toString(36).substring(2);
}


/**
 * Add Util() to global module object
 * @constructor
 */
module.exports = new Util()