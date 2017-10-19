#!/bin/bash

if [ $# == 0 ]; then
  echo "Converts CSV of form 'lat, lng, lift, radius, r2' to json"
  exit
fi

csvjson -S $1 | jq "{thermails:[.[]|{lat:.lat|tonumber, lng:.lng|tonumber, lift: .lift|tonumber, radius: .radius|tonumber, r2: .r2|tonumber}]}"
