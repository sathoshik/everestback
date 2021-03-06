//  Everest_Back
//  Copyright © 2016 Everest. All rights reserved.
//

require('../models/Event');

var mongoose = require('mongoose');
var Event = mongoose.model('Event');

module.exports = {

  retrieveUserEvents : (eventsObject, res, callback) => {
    var finalObject = {};
    var numberOfKeys = Object.keys(eventsObject).length;
    var counter = 0;

    for(let key in eventsObject) {
      let additionalObject ={};
      try {
        eventsObject[key];
      } catch(e) {
        console.log(e);
        res.status(404);
        res.send({ 'error': 'Unsuccessful operation' });
        return;
      }

      if(eventsObject[key] != undefined && eventsObject[key] != null ) {
        if(eventsObject[key].length >= 1 ) {
          Event.find({ '_id': { $in : eventsObject[key] } }, {
            _id: 1,
            EventName : 1,
            EventImageURL : 1,
            Description : 1,
            Location : 1,
            StartTime : 1,
            EndTime : 1
          }, (err, events) => {
            counter++;
            if(err) {
              console.log(err);
              res.status(500);
              res.send({ 'error': err.toString() });
              return;
            } else if (events.length < 1 || events === null || events === undefined) {
              additionalObject[key] = [];
              finalObject = Object.assign({},
                finalObject,
                additionalObject);
            } else {
              additionalObject[key] = events;
              finalObject = Object.assign({}, finalObject, additionalObject);
            }

            if(counter == numberOfKeys) {
              done();
            }
          });
        } else {
          counter++;
          additionalObject[key] = [];
          finalObject = Object.assign({},
            finalObject,
            additionalObject);

          if (counter == numberOfKeys) {
            done();
          }
        }
      } else {
        counter++;
        additionalObject[key] = [];
        finalObject = Object.assign({},
          finalObject,
          additionalObject);

        if (counter == numberOfKeys) {
          done();
        }
      }
    }

    var done = () => {
      if (callback) {
        callback(finalObject);
      } else {
        return finalObject;
      }
    };
  }
};
