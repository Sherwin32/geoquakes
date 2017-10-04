// define globals
var weekly_quakes_endpoint = "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

$(document).ready(function() {
  console.log("Let's get coding!");
  // CODE IN HERE!
  // initMap();
  getQuakes();
});

function getQuakes(){
  //call the ajax function, see if it is successful or errors out
	  $.ajax({
				method: "GET",
				url: weekly_quakes_endpoint,
				dataType: 'JSON',
				success: onSuccess,
				error: onError
		});
	}

function onSuccess(json) {
  //sanity check for data
  console.log(json);

  //initialize map based on googlemaps API docs
	var map = new google.maps.Map(document.getElementById('map'), {
          // center: {lat: 37.78, lng: -122.44},
          //center based on the most recent quake data
          center: getRecentQuake(json),
          zoom: 2
        });

  //for every quake recorded in the data json
	json.features.forEach(function(quake){
    //get the title
		var fullTitle = quake.properties.title;
    //parse the title to only have the city and country
		var title = (fullTitle.split(" of "))[1];
    //sanity check: see how we are splitting the title
    console.log(fullTitle.split(" of "));

    //get coordinates
		var longitude = quake.geometry.coordinates[0];
		var latitude = quake.geometry.coordinates[1];
    //get quake time
    var time = quake.properties.time;
    //get current time
		var now = new Date();
    //calculate difference between now and quake time, hour should be integer
    var hoursAgo = parseInt(((now.getTime()-time)/1000/60/60));

    //formatting the position of our markers to be at our calculated
    //latitude and longitude variables above.
    var quakePosition = {lat:latitude, lng:longitude};
    markQuake(quakePosition, map);

    //sanity check: see how our lat and lng data looks
		console.log(`latitude: ${latitude}, longitude: ${longitude}, time: ${time}, ${hoursAgo} hours ago`);

    //append the location and hours ago of each quake
		$("#info").append(`<p>${title} / ${hoursAgo} hours ago</p>`);
    //end of forEach loop
	});
  //end onSuccess function
}

function onError(xhr, status, errorThrown) {
	console.log("Error: " + errorThrown);
	console.log("Status: " + status);
	console.dir(xhr);
	alert("Sorry, there was a problem!");
}

//We could run this function initMap() at the start of onSuccess to create map,
//but we are doing it directly :)

// function initMap() {
//         map = new google.maps.Map(document.getElementById('map'), {
//           center: {lat: 37.78, lng: -122.44},
//           zoom: 6
//         });

// }

function markQuake(position, map) {
	var markerImage = {
    url: "images/earthquake.png", // url of icon
    scaledSize: new google.maps.Size(20, 20), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
		};
	var marker = new google.maps.Marker({
          position: position,
          map: map,
          icon: markerImage,
          title: 'Hello World!'
        });
}
//calculate the center position on map based on the most recent quake.
//this function is called when we are initializing the map (see center position)
function getRecentQuake(json){
  var recentLongitude = json.features[0].geometry.coordinates[0];
	var recentLatitude = json.features[0].geometry.coordinates[1];
	var recentPosition = {lat: recentLatitude, lng: recentLongitude};
	// console.log(recentPosition);
  //return the recentPosition so we can use it inside our onSuccess fn
	return recentPosition;
}