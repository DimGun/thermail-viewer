const fs = require('fs');

const args = process.argv.slice(2);
if (args.length <= 0) {
    console.log("This script parses flight data from XCGlobe, and generates thermails and flight data JSON files.")
    console.log("You need to provide file with flight data fetched from XCGlobe");
    console.log("Example: http://xcglobe.com/flights/flight-box/2042011");
    return;
}

const flightDataPath = args[0];
const flightDataRaw = fs.readFileSync(flightDataPath);
if (!flightDataRaw) {
    console.error("Failed to read a file at path ", flightDataPath);
}
const flightData = JSON.parse(flightDataRaw);

// Parsing flight track
const track = parseTrack(flightData.jsinfo);
const trackFilePath = './xc-track.json';
fs.writeFile(trackFilePath, JSON.stringify(track), function(err) {
    if(err){
        return console.log(err);
    }
    console.log("Track data is written to ", trackFilePath);
});

// Parsing thermails info
const thermails = parseThermails(flightData.jsinfo);
const thermailsFilePath = './xc-thermails.json';
fs.writeFile(thermailsFilePath, JSON.stringify(thermails), function(err) {
    if(err){
        return console.log(err);
    }
    console.log("Thermails data is written to ", thermailsFilePath);
});


// HELPER METHODS
// This is reverse engeneered from xcglobe implementation
function parseTrack(jsinfo) {
    var trackInfo = {
        flightId: jsinfo.fid,
        gpts: [],
        alts: [],
        // polytrack: null,
        // polyphases: []
    };
    var isMultiPhaseTrack = (jsinfo.phases && jsinfo.phases.length);
    if (isMultiPhaseTrack && !jsinfo.points) {
        parsePhases(jsinfo)
    }
    if (!jsinfo.points) {
        jsinfo.points = parsePoints(jsinfo.encpts)
    }
    var N = (isMultiPhaseTrack ? 1 : 2);
    var points = jsinfo.points;
    var pointsLen = points.length;
    for (var i = 0; i < pointsLen; i += 4) {
        var coords = { lat: points[i], lng: points[i + 1] };
        trackInfo.gpts.push(coords);
        var altitude = points[i + 2];
        var alt2 = points[i + 3] * 1000;
        trackInfo.alts.push([alt2, altitude])
    }
    // if (T) {
    //     J.polyphases = h(I.phases)
    // }
    return trackInfo
}

function parsePhases(jsinfo) {
    jsinfo.points = [];
    for (var i = 0; i < jsinfo.phases.length; i++) {
        var phase = jsinfo.phases[i];
        if (!phase.points) {
            phase.points = parsePoints(phase.encpts);
            phase.encpts = null
        }
        jsinfo.points = jsinfo.points.concat(phase.points)
    }
}

function parsePoints(encodedPoints) {
    if (!encodedPoints) {
        return null
    }
    var H = decodePoints(encodedPoints);
    var L = H[0];
    var S = H[1];
    var R = H[2];
    var J = H[3];
    var I = 10000;
    var T = [L / I, S / I, R, J];
    for (var N = 4; N < H.length; N += 4) {
        var P = L + H[N];
        var Q = S + H[N + 1];
        var K = R + H[N + 2];
        var M = J + H[N + 3];
        T.push(P / I);
        T.push(Q / I);
        T.push(K);
        T.push(M);
        R = K;
        J = M;
        L = P;
        S = Q
    }
    return T
}

function decodePoints(encodedPoints) {
    var M = "056789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!?.,:;{}()[]<>+-*/=#$%^&";
    var Q = 40;
    var W = Q * Q;
    var V = W * Q;
    var U = V * Q;
    var H = 2 * Q;
    var K = H * H;
    var J = K * H;
    var Y = [];
    if (!encodedPoints) {
        return Y
    }
    var T = encodedPoints.split(" ");
    var ae = parseInt(T[1]);
    var N = [0, Q, W, V, U];
    var I = [1, H, K, J];
    var P = 0;
    var Z = T[2];
    var S = ae;
    for (var aa = 0; aa < Z.length;) {
        var ad = Z.charAt(aa);
        if (ad >= "1" && ad <= "4") {
            aa++;
            S = ad - "0"
        } else {
            S = ae
        }
        var L = 0;
        var O = I[S - 1];
        for (var X = aa; X < aa + S; X++) {
            var R = Z.charAt(X);
            var ab = M.indexOf(R);
            ab *= O;
            L += ab;
            O /= H
        }
        aa += S;
        L -= N[S];
        Y[P++] = L
    }
    return Y
}

function parseThermails(jsinfo) {
    var thermailsArray = [];
    if (!jsinfo.thermails) {
        return thermailsArray
    }
    var coordsCount = jsinfo.thermails.coords.length;
    for (var i = 0; i < coordsCount; i += 2) {
        var thermails = jsinfo.thermails;
        var lat = thermails.coords[i];
        var lng = thermails.coords[i + 1];
        var center = {lat: lat, lng: lng};
        var thermailInfo = {
            center: center,
            radius: thermails.diameters[i/2]/2,
            lift: thermails.lifts[i/2]
        };
        if (thermails.times) {
            thermailInfo.time = thermails.times[i / 2]
        }
        thermailsArray.push(thermailInfo)
    }
    return thermailsArray;
}

