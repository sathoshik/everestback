FROM node:boron
MAINTAINER Sathoshi Kumarawadu <sathoshi.k@gmail.com>

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6 \
  && echo "deb [ arch=amd64 ] http://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.4.list 

RUN apt-get update -qq && apt-get install -y \
  mongodb-org-shell \
  nodejs

WORKDIR /usr/app

