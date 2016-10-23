var map;
var directionsDisplay;
var directionsService;
var stepDisplay;
var markerArray = [];
var myRoute;
var map;
var points = [];

// Create a map and center it on Manhattan.
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 42.3736158, lng: -71.1097335}
  });
}

//calculates distance between two points in km's
function calcDistance(p1, p2) {
  return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
}

function displayNearRoutePlaces(tmpRoute) {
  // code below is for places service.
  // request to find all 'places to visit' around given location.
  // do this for every 500m point along the route from start to end.

  // assume there is only one route, find all path points.
  var route = tmpRoute;
  var pathPoints = new Array();
  var legs = route.legs;
  for (i = 0; i < legs.length; i++) {
      var steps = legs[i].steps;
      for (j = 0; j < steps.length; j++) {
          var nextSegment = steps[j].path;
          for (k = 0; k < nextSegment.length; k++) {
              pathPoints.push(nextSegment[k]);
          }
      }
  }

  // Iterate over the pathPoints,
  // for every 50 points, request to find all places to visit within 500 range given location
  var p1 = pathPoints[0];
  var p2;
  for (var i =1; i < pathPoints.length; i++) {
    p2 = pathPoints[i];
    if (calcDistance(p1, p2) > 0.7) {
      var xy = p2;
      //contentString += '<br>' + 'Coordinate ' + i + ':<br>' + xy.lat() + ',' + xy.lng();
      var point = new google.maps.LatLng(xy.lat(), xy.lng());
      //console.log(xy.lat() + ", " + xy.lng());
      var request = {
        location: point,
        radius: pave.radius,
        keyword: 'tourist attraction',
        openNow: true
      };
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);
      p1 = p2;
    }
  }
}

// point service functions from here.
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      // make sure this function checked for duplicates!!!
      createMarker(results[i]);
      //console.log(results[i]);
      // createPhotoMarker(results[i]);
    }
  }
}

function createMarker(place) {
  if (points.indexOf(place) == -1) {
    var placeLoc = place.geometry.location;
    var photos = place.photos;
    if (!photos) {
        return;
    }
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      title: place.name,
      icon: photos[0].getUrl({'maxWidth': 35, 'maxHeight': 35}),
    });

    marker.addListener('mouseover', function() {
        infowindow.setContent(this.title + "\n" + place.opening_hours.weekdayText);
        infowindow.open(map, this);
    });

    marker.addListener('mouseout', function() {
        infowindow.close();
    });

    var infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
      pave.addWaypoint(place.name);
    });
    points.push(place);
    //console.log(place);
  }
}

/*
function createPhotoMarker(place) {
  var photos = place.photos;
  if (!photos) {
    return;
  }

  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
    icon: photos[0].getUrl({'maxWidth': 35, 'maxHeight': 35})
  });
}
*/

// direction service functions from here.
function calculateAndDisplayRoute() {
  var markerArray = [];

  map = new google.maps.Map(document.getElementById('map'));

  // Instantiate a directions service.
  var directionsService = new google.maps.DirectionsService;

  // Create a renderer for directions and bind it to the map.
  var directionsDisplay = new google.maps.DirectionsRenderer({map: map});

  // Instantiate an info window to hold step text.
  var stepDisplay = new google.maps.InfoWindow;

  // First, remove any existing markers from the map.
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }


  // Retrieve the start and end locations and create a DirectionsRequest using
  console.log("startAdd: " + pave.startAddress);
  console.log("endAdd:   " + pave.endAddress);
  console.log("radius:   " + pave.radius);


  directionsService.route({
    origin: pave.startAddress,
    destination: pave.endAddress,
    // can use 'WALKING'
    travelMode: 'DRIVING'
  }, function(response, status) {
    // Route the directions and pass the response to a function to create
    // markers for each step.
    if (status === 'OK') {
      //document.getElementById('warnings-panel').innerHTML ='<b>' + response.routes[0].warnings + '</b>';
      directionsDisplay.setDirections(response);
      myRoute = directionsDisplay.directions.routes[0];
      displayNearRoutePlaces(myRoute);
      //showSteps(response, markerArray, stepDisplay, map);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });


}

function showSteps(directionResult, markerArray, stepDisplay, map) {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  var myRoute = directionResult.routes[0].legs[0];
  for (var i = 0; i < myRoute.steps.length; i++) {
    var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
    marker.setMap(map);
    marker.setPosition(myRoute.steps[i].start_location);
    attachInstructionText(
        stepDisplay, marker, myRoute.steps[i].instructions, map);
  }
}

function attachInstructionText(stepDisplay, marker, text, map) {
  google.maps.event.addListener(marker, 'click', function() {
    // Open an info window when the marker is clicked on, containing the text
    // of the step.
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
}
