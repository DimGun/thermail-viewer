#!/bin/bash

if [ $# == 0 ]; then
  echo "Converts IGC to json"
  exit
fi

igc_file="$1"
igc_file_name=`basename "$igc_file"`
csv_out_file="${igc_file_name/\.igc/.csv}"

python IGC2CSV/IGC2CSV.py $igc_file 1>/dev/null

csvjson -l -S "./$csv_out_file" | jq '{points: [.[] | {lat: ."Latitude (Degrees)"|tonumber, lng: ."Longitude (Degrees)"|tonumber, alt: ."Altitude GPS"|tonumber, "date-time": ."Datetime (UTC)"}]}'
rm "./$csv_out_file"
