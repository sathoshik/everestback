Instructions on Initializing the EverestBack repo:
1. cd into the current current directory in terminal
2. Run "$ npm install"
3. Run "$ mkdir data"
4. Run "$ mongod --dbpath=THE ABSOLUTE PATH TO YOUR PROJECT ENDING WITH /data"
	EX: "$ mongod --dbpath=D:/Networking-app/EverestBack/data"
	Hint: you can run "$ pwd" to get the absolute path to the root of your project
	
NOTE: The process will not end since you have initialized the db and are running it on a port and thats OKAY
	  The console message should be: "... waiting for connections on port 27017"
	
5. Now open a new terminal at the root directory of your project again
6. Run "$ node server.js"

You have now successfully ran a node server and connected a mongo client to the database:)

Give yourself a round of applause...cause you deserve it...and you're worth it.


Quick Daily Environment setup:
1. open terminal 
2. Run "$ chmod a+x ./QuickDevDB.sh" *Only required the first time you do this, otherwise just skip to step 3*
3. Run "$ sh ./QuickDevDB.sh"
4. open a new terminal
5. Run "$ node server"

Das it!
