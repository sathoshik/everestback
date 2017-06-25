#!/bin/bash

ddc() {
  pushd $EVERESTBACK_HOME > /dev/null

  docker-compose $@

  popd > /dev/null
}
