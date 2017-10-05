// define globals
var weekly_quakes_endpoint = "";
var urlHead = "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";
var weekString = "all_week.geojson";
var dayString = "all_day.geojson";
var minMagnitude = 3;
var map;

$(document).ready(function() {
    console.log("Let's get coding!");

    initMap();
    $("#weekBtn").on("click", weekBtnClick);
    $("#dayBtn").on("click", dayBtnClick);
    $('#info').on('click', '.quakePTag', reDirectMap)
});

//To redirect the map to the clicked location string
function reDirectMap(event) {
    console.log("clicked!");
    var lat = parseFloat($(this).attr("lat"));
    var lng = parseFloat($(this).attr("lng"));
    console.log(`lat: ${lat}, lng: ${lng}`);
    map.setCenter({
        lat: lat,
        lng,
        lng
    });
    map.setZoom(10);
}

function weekBtnClick(event) {
    $("#id").text("");
    $("#info").text("");
    weekly_quakes_endpoint = urlHead + weekString;
    getQuakes()
}

function dayBtnClick(event) {
    $("#id").text("");
    $("#info").text("");
    weekly_quakes_endpoint = urlHead + dayString;
    getQuakes()
}

function getQuakes() {
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
    minMagnitude = $("#minMagnitude").val();

    for (var i = 0; i < json.features.length; i++) {
        if (json.features[i].properties.mag >= minMagnitude) {
            //initialize map based on googlemaps API docs
            map = new google.maps.Map(document.getElementById('map'), {
                // center: {lat: 37.78, lng: -122.44},
                //center based on the most recent quake data
                center: getRecentQuake(json.features[i]),
                zoom: 8
            });
            break;
        }
    }


    //for every quake recorded in the data json
    json.features.forEach(function(quake) {

        //declaire magnitude
        var mag = quake.properties.mag;
        if (mag >= minMagnitude) {

            //get the title
            var fullTitle = quake.properties.title;
            //parse the title to only have the city and country
            var title = (fullTitle.split(" of "))[1];
            //There are some title without 'of'(which is usually in the ocean). So I split it using '-'
            //If there's no 'of' in the fullTitle string, 'title' would return false
            if (!title) {
                // console.log(fullTitle);
                title = (fullTitle.split(" - "))[1];
                // console.log(title);
            }


            //sanity check: see how we are splitting the title
            // console.log(fullTitle.split(" of "));

            //get coordinates
            var longitude = quake.geometry.coordinates[0];
            var latitude = quake.geometry.coordinates[1];
            //get quake time
            var time = quake.properties.time;
            //get current time
            var now = new Date();
            //calculate difference between now and quake time, hour should be integer
            var hoursAgo = parseInt(((now.getTime() - time) / 1000 / 60 / 60));
            //added minutes to be more specific
            var minsAgo = parseInt((now.getTime() - time) / 1000 / 60 - hoursAgo * 60);



            //formatting the position of our markers to be at our calculated
            //latitude and longitude variables above.
            var quakePosition = {
                lat: latitude,
                lng: longitude
            };


            markQuake(quakePosition, map, mag);
            //sanity check: see how our lat and lng data looks
            // console.log(`latitude: ${latitude}, longitude: ${longitude}, time: ${time}, ${hoursAgo} hours ago`);

            //append the location, hours and minutes ago of each quake
            var sForHours = "";
            var sForMinutes = "";
            if (hoursAgo > 1) {
                sForHours = "s";
            }
            if (minsAgo > 1) {
                sForMinutes = "s";
            }
            $("#info").append(`<p class="quakePTag" lat="${latitude}" lng="${longitude}">${title} / ${hoursAgo} hour${sForHours} and ${minsAgo} minute${sForMinutes} ago</p>`);



        }
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

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.78,
            lng: -122.44
        },
        zoom: 6
    });

}

function markQuake(position, map, mag) {
    var imageUrl = "";
    if (mag >= 5) {
        imageUrl = "images/earthquake_red.png";
    } else if (mag >= 4) {
        imageUrl = "images/earthquake_yellow.png";
    } else { //if mag >= 3
        imageUrl = "images/earthquake_green.png";
    }
    var markerImage = {
        url: imageUrl, // url of icon
        scaledSize: new google.maps.Size(20, 20), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: markerImage,
        title: 'Hello World!'
    });

    //This is the listener for markers to zoom in 2 with each click
    marker.addListener('click', function() {
        map.setZoom(map.getZoom() + 2);
        map.setCenter(marker.getPosition());
    });
}
//calculate the center position on map based on the most recent quake.
//this function is called when we are initializing the map (see center position)
function getRecentQuake(featureIn) {
    var recentLongitude = featureIn.geometry.coordinates[0];
    var recentLatitude = featureIn.geometry.coordinates[1];
    var recentPosition = {
        lat: recentLatitude,
        lng: recentLongitude
    };
    // console.log(recentPosition);
    //return the recentPosition so we can use it inside our onSuccess fn
    return recentPosition;
}