@ Deprecated     
Instructions on Initializing the EverestBack repo:
1. cd into the current directory in terminal
2. Run "$ npm install"
3. 1. npm install npm install grunt-cli -g
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

SETUP DEV LINTING ENV
1. npm install npm install grunt-cli -g

Quick Daily Environment setup:
1. Install Docker.
2. Change your directory to the Repo.
3. Open terminal
4. npm i 
5. docker-compose build
6. docker-compose -up d
     
Your local server should now be running at localhost.

If you want to get fancy, you add 127.0.0.1 everestdev.com www.everestdev.com to override /etc/hosts

BEFORE PUSHING CODE:
grunt jslint
=> Fix errors 

grunt eslint
=> Fix errors
     
Keep in mind that Jenkins will not allow merging unless all linting errors are fixed
     
Das it!
