var map;
var directionsDisplay;
var directionsService;
var stepDisplay;
var markerArray = [];
var myRoute;
var map;

function initMap() {
  var markerArray = [];

  // Instantiate a directions service.
  var directionsService = new google.maps.DirectionsService;

  // Create a map and center it on Manhattan.
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 42.3736158, lng: -71.1097335}
  });

  // Create a renderer for directions and bind it to the map.
  var directionsDisplay = new google.maps.DirectionsRenderer({map: map});

  // Instantiate an info window to hold step text.
  var stepDisplay = new google.maps.InfoWindow;

  // Display the route between the initial start and end selections.
  calculateAndDisplayRoute(
      directionsDisplay, directionsService, markerArray, stepDisplay, map);
  // Listen to change events from the start and end lists.
  var onChangeHandler = function() {
    calculateAndDisplayRoute(
        directionsDisplay, directionsService, markerArray, stepDisplay, map);
  };
  document.getElementById('start').addEventListener('change', onChangeHandler);
  document.getElementById('end').addEventListener('change', onChangeHandler);
  // get all routes.
  //directionsDisplay = new google.maps.DirectionsRenderer();
  //result = directionsDisplay.getDirections();
  //console.log(result);

}

function displayNearRoutePlaces() {
  // code below is for places service.
  // request to find all 'places to visit' around given location.
  // do this for every 500m point along the route from start to end.


  // get all routes.
  //var result = directionsDisplay.getDirections();

  // assume there is only one route, find all path points.
  var route = myRoute;
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
  for (var i =0; i < pathPoints.length; i+=5) {
    var xy = pathPoints[i];
    //contentString += '<br>' + 'Coordinate ' + i + ':<br>' + xy.lat() + ',' + xy.lng();
    var point = new google.maps.LatLng(xy.lat(), xy.lng());
    console.log(xy.lat() + ", " + xy.lng());
    var request = {
      location: point,
      radius: '500',
      query: 'places to visit'
    };
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
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
function calculateAndDisplayRoute(directionsDisplay, directionsService,
    markerArray, stepDisplay, map) {
  // First, remove any existing markers from the map.
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }

  // Retrieve the start and end locations and create a DirectionsRequest using
  // WALKING directions.
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    // can use 'WALKING'
    travelMode: 'DRIVING'
  }, function(response, status) {
    // Route the directions and pass the response to a function to create
    // markers for each step.
    if (status === 'OK') {
      //document.getElementById('warnings-panel').innerHTML ='<b>' + response.routes[0].warnings + '</b>';
      directionsDisplay.setDirections(response);
      myRoute = directionsDisplay.directions.routes[0];
      showSteps(response, markerArray, stepDisplay, map);
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