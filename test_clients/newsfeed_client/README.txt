Author: Zain Khan

Instructions to run newsfeed for testing:
	1.Create an event
		*In PostMan make a POST request to "localhost:3000/testing/createNewEvent"
		with an object like this
		{
			"EventName": "event_name",
			"EventImageURL": "url.com",
			"AdminID":"581e5d4a7230523030713203"
		}
		NOTE: Keep AdminID as is
		
		This will return an event object and a newsfeed object
		
		* Copy the AdminID, EventID and NewsfeedID from the response
		and paste it into the variables user_id, event_id, and newsfeed_id
		respectively inside "newsfeed_client.html"
		
		* Restart the node server
		
		* Go to localhost:3000/testing/newsfeed and two windows 
		and open developer tools
		
		* Send a post and have it be recieved on the other window
		
		* Check if post was updated on by running a GET request on 
		"localhost:3000/testing/getAllNewsfeeds"
		