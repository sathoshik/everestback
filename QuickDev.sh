#!/bin/sh

PWD=$(pwd)/data
echo $PWD
mongod --dbpath=$PWD

