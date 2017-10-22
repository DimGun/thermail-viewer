#!/bin/bash

if [ $# == 0 ]; then
  echo "Converts CSV of form 'point_id, lat, lng, lift, radius, r2' to json"
  exit
fi

csvjson -S $1 | jq "{thermails:[.[]|{trackPointId:.track_point_id|tonumber, center: {lat:.lat|tonumber, lng:.lng|tonumber}, lift: .lift|tonumber, radius: .radius|tonumber, r2: .r2|tonumber}]}"
