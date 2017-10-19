if [ $# == 0 ]; then
  echo "Converts data from flight box to suitable JSON"
  exit
fi

jq '.jsinfo.thermails 
      | [
          [foreach .coords[] as $coord (
            []; 
            if .|length < 2 then . + [$coord] else [$coord] end; 
            if .|length == 2 then {lat: .[0], lng: .[1]} else empty end
           )
          ], 
          [.diameters[]/2], 
          .lifts
        ] 
        | transpose | {thermails: [ .[] | {lat:.[0].lat, lng:.[0].lng, radius:.[1], lift: .[2]}]}' \
$1 
