'use strict';


// App name space
var pave = pave || {};

// User data entry
pave.startAddress = "";
pave.endAddress = "";
pave.radius = "";

// Embed a google map widget into the website
pave.initMap = function() {
	var uluru = {lat: -25.363, lng: 131.044};
	var map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 4,
	  center: uluru
	});
	var marker = new google.maps.Marker({
	  position: uluru,
	  map: map
	});
}

// Manipulate sidenav bar
pave.openNav = function() {
    document.getElementById("mySidenav").style.width = "250px";
}

pave.closeNav = function() {
    document.getElementById("mySidenav").style.width = "0";
}

// Submit form
pave.enterPrefs = function(){
	pave.startAddress = document.getElementById("startAddress").value;
	pave.endAddress = document.getElementById("endAddress").value;
	pave.radius = document.getElementById("radius").value;

	calculateAndDisplayRoute();
}




// Init function
pave.init = function() {
	pave.initMap();
}
