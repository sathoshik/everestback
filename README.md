Quick Daily Environment setup:
```
1. Install Docker.
2. docker-compose build
3. npm install
4. docker-compose up -d
```
You can check to see if all your containers are running by
```docker-compose ps```

If there seem to be any errors, check the logs by either
```
docker-compose logs --follow web
docker-compose logs --follow mongo
```

Your local server should now be running at localhost.

If you want to get fancy, you add 127.0.0.1 everestdev.com www.everestdev.com to override /etc/hosts

BEFORE PUSHING CODE:
``` grunt eslint ```
     
Keep in mind that Jenkins will not allow merging unless all linting errors are fixed
     
Love EverestBack Team
      
      
Additional changes to make deving faster      
```
Open ~/.bash_profile and paste the following..      

#Everestback docker aliases ---------------------------------------------------      
export EVERESTBACK_HOME=~/Development/everestback
source $EVERESTBACK_HOME/scripts/docker-rails.sh
```
      
You you type ```ddc build ```,```ddc up -d``` and ```ddc ps``` 
      
      
      
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
