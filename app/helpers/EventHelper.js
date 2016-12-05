/**
 * Created on 2016-12-04.
 */

require('../models/Event');
var mongoose = require('mongoose');
var Event = mongoose.model('Event');

module.exports = {
  /**
   * Queries The Event Model With an Array Of Events
   * @param  {} eventsObject, {response} res, {() => {...}} callback
   * @return {} or null
   *
   * NOTE: This function will always return an object with
   *       the same key values as the arg "eventsObject"
   */
  retrieveUserEvents : (eventsObject, res, callback) => {

    var finalObject = {}, numberOfKeys = Object.keys(eventsObject).length, counter = 0;

    for(let key in eventsObject){
      let additionalObject ={};
      try{
        eventsObject[key].length;
      }
      catch(e){
        console.log(e);
        res.status(404);
        res.send({'error' : 'Unsuccessful operation'});
        return;
      }

      if(eventsObject[key] != null || eventsObject[key].length >= 1 ){
        Event.find({'_id' : {$in : eventsObject[key]}},{
          _id: 0,
          EventName : 1,
          EventImageURL : 1,
          Description : 1,
          Location : 1,
          StartTime : 1,
          EndTime : 1
        }, (err, events) => {
          counter++;
          if(err){
            console.log(err);
            res.status(500);
            res.send({'error' : err.toString()});
            return;
          }
          else if(events.length < 1 || events == null || events == undefined){
            additionalObject[key] = [];
            finalObject = Object.assign({},
              finalObject,
              additionalObject);
          }
          else{
            additionalObject[key] = events;
            finalObject = Object.assign({},
              finalObject,
              additionalObject);
          }

          if(counter == numberOfKeys){
            done();
          }
        });
      }
      else{
        counter++;
        additionalObject[key] = [];
        finalObject = Object.assign({},
          finalObject,
          additionalObject);

        if(counter == numberOfKeys){
          done();
        }
      }
    }

    //ZKH - Called upon completion of logic checks or querying of all the data provided
    var done = () =>{
      if(callback){
        callback(finalObject);
      }
      else{
        return finalObject;
      }
    };


  }

}
