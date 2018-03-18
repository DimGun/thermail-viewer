## Preparing a data

### Converting from Igor's algorithm output
1. Add header to the csv file
```
echo "track_point_id, lat, lng, lift, radius, r2" > termic.csv
cat termic-src.csv >> termic.csv
```
2. Convert to json 
```
./scripts/convert-calc-csv.sh termic.csv > termic.json
```
3. Wrap into js callback method 
```
echo "calculatedDataFetchedCallback(" > ./data/calculated_thermails.js` 
cat termic.json >> ./data/calculated_thermails.js
echo ");" >> ./data/calculated_thermails.js
```

### Getting data from XCGlobe
TODO
