var map;
//var stepDisplay;
var markers = [];
var renderers = [];
var points = [];
var wayPoints = [];
var wayPointsNames = [];
var directionsService;
var directionsDisplay;
//var directionsRenderer;
var stepDisplay;
var prevMapsCount = 0;
var newRound = false;

// Create a map and center it on Manhattan.
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 42.3736158, lng: -71.1097335}
  });
    // Instantiate a directions service.
  //directionsService = new google.maps.DirectionsService;
  // Create a renderer for directions and bind it to the map.
  //directionsDisplay = new google.maps.DirectionsRenderer({map: map});
  // Instantiate an info window to hold step text.
  //stepDisplay = new google.maps.InfoWindow;
  // loop over all waypoints
  //map = new google.maps.Map(document.getElementById('map'));
}


// Removes the markers from the map, but keeps them in the array.
function deleteMarkers() {
  for (var i = 0; i < markers.length; i++) {
    if (wayPoints.indexOf(markers[i]) == -1) {
      markers[i].splice(i, 1);
    }
  }
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
  // for every 70 points, request to find all places to visit within 500 range given location
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
        //openNow: true
      };
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);
      p1 = p2;
    }
  }
}

function setUp() {
  wayPoints = [];
  wayPointsNames = [];
  var origPoint;
  var destPoint;
  //deleteMarkers();

  var geocoder = new google.maps.Geocoder();
  
  geocoder.geocode( { 'address': pave.startAddress}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var origPoint = new google.maps.LatLng(results[0].geometry.location.latitude, results[0].geometry.location.longitude);
      updateWayPoints(origPoint, pave.startAddress);
      updateMap();
    }
  });
  geocoder.geocode( { 'address': pave.endAddress}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var destPoint = new google.maps.LatLng(results[0].geometry.location.latitude, results[0].geometry.location.longitude);
      updateWayPoints(destPoint, pave.endAddress);
      updateMap();
    }
  });
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
  if (markers.indexOf(place) == -1) {
    var placeLoc = place.geometry.location;
    var photos = place.photos;
    if (!photos) {
        return;
    }
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      title: place.name + ", MA",
      icon: photos[0].getUrl({'maxWidth': 35, 'maxHeight': 35}),
    });

    marker.addListener('mouseover', function() {
      infowindow.setContent(this.title);
      infowindow.open(map, this);
    });

    marker.addListener('mouseout', function() {
      infowindow.close();
    });

    var infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
      var wp = new google.maps.LatLng(this.position.lat(), this.position.lng());
      // if waypoints not listed, list it and update waypoints maps
      var index = -1;
      for (var i = 0; i < wayPoints.length; i++) {
        if (wp.lat() == wayPoints[i].lat() && wp.lng() == wayPoints[i].lng()) {
          index = i;
          break;
        }
      };
      if (index == -1) {
        // creates waypoint display on the left panel
        pave.addWaypoint(place.name);
        //console.log(this);
        updateWayPoints(wp, this.title);
      // else remove the waypoint and then update
      } else {
        wayPoints.splice(index, 1);
        wayPointsNames.splice(index, 1);
      }
      updateMap();
    });
    markers.push(marker);
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
Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};


function updateWayPoints(wayPoint, name) {
  if (wayPoints.length < 2) {
    //deleteMarkers();
    wayPoints.push(wayPoint);
    wayPointsNames.push(name);
    if (wayPoints.length == 1) {
      return;
    }
  } else if (wayPoints.length == 2) {
    wayPoints.insert(1, wayPoint);
    wayPointsNames.insert(1, name);
  } else {
    for(var i=1; i < wayPoints.length; i++) {
      var prevD = calcDistance(wayPoints[0], wayPoints[i]);
      var newD = calcDistance(wayPoints[0], wayPoint);
      if (newD < prevD || i == wayPoints.length - 1) {
        wayPoints.insert(i, wayPoint);
        wayPointsNames.insert(i, name);
        break;
      }
    }
  }
}

function updateMap() {
  for (var i = 0; i < wayPoints.length; i++) {
    console.log(calcDistance(wayPoints[0], wayPoints[i]));
  };
  console.log(wayPointsNames);

  for (var i = 0; i < wayPoints.length - 1; i++) {
    if (i == 0) {
      for (var j = 0; j < prevMapsCount; j++) {
        if (renderers.length > 0) {
          renderers[0].setMap(null);
          renderers.splice(0, 1);
        }
      };
      prevMapsCount = 0;
    }
    calculateAndDisplayRoute(wayPointsNames[i], wayPointsNames[i+1]);
    prevMapsCount++;
  };
}

// direction service functions from here.
function calculateAndDisplayRoute(p1, p2) {

  function renderDirections(result) {
    var directionsRenderer = new google.maps.DirectionsRenderer;
    directionsRenderer.setMap(map);
    directionsRenderer.setDirections(result);
    renderers.push(directionsRenderer);
    var myRoutes = directionsRenderer.directions.routes;
    // display all nearby places.
    displayNearRoutePlaces(myRoutes[myRoutes.length - 1]);
  }

  var directionsService = new google.maps.DirectionsService;
  function requestDirections(start, end) {
    directionsService.route({
      origin: start,
      destination: end,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    }, function(result) {
      renderDirections(result);
    });
  }
  requestDirections(p1, p2);

  /*
  directionsService.route({
    origin: p1,
    destination: p2,
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
  */
}

/*
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
*/