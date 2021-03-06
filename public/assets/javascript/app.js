//setting variables for wheels' color and type of restaurants
var colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
                 "#2E2C75", "#673A7E", "#CC0071", "#F80120",
                 "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"];

var restaurants = ["Korean", "Indian", "Italian", "Sandwiches","Burgers", "Breakfast",
                   "Mexican", "Caribbean","Vietnamese", "Chinese",
                   "Seafood", "Pizza", "Thai", "Japanese"];

var startAngle = 0;
var arc = Math.PI / 6;
var spinTimeout = null;
var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;
var ctx;

//the wheel was created by canvas
function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 220;
    var textRadius = 180;
    var insideRadius = 95;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,500,500);


    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.font = '16px Bodoni';

    for(var i = 0; i < 12; i++) {
      var angle = startAngle + i * arc;
      ctx.fillStyle = colors[i];

      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;


      ctx.fillStyle = "black";
      ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius,
                    250 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = restaurants[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.fill();
  }
}

function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  rotateWheel();
}
function rotateWheel() {
  spinTime += 10;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}
function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = restaurants[index]
  ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  ctx.restore();
  yelpsearch(restaurants[index], address);
}
function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}


//==========google map API==========
//create variable for coordinates
var address;
var map;
var service;
var markers = [];
var restmarkerinfo = [];
var googlerestinfo = [];
var googleMarker = []; // Added this to replace the functionality of markers
//
function initMap() {
      //create geocoder to get coordinates
      var geocoder = new google.maps.Geocoder();

          // Create a map object and specify the DOM element for display.
          map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 29.7051, lng: -95.4018},
          scrollwheel: false,
          zoom: 13
          });

          $("#submit").on("click", function(){
              //store the address in variable
              address = document.getElementById('address').value;

              //initialize the geocoding function to pinpoint the address.
              geocodeAddress(geocoder, map);

              //once click the button, the wheel spins
              spin();

              //empty the previous restaurant display and "click to see the map" box
              $("#restauranttable").empty();
              $("#clickmap").hide();

              //clear all markers on the map
              for (var i=0; i<googleMarker.length; i++) {
              googleMarker[i].setMap(null);
              };
              for (var i=0; i<markers.length; i++) {
              markers[i].setMap(null);
              }
              for (var i=0; i<restmarkerinfo.length; i++) {
              restmarkerinfo.splice(0,3);
              }

              //the page will not refresh
              return false;
          });
         }

//geocoding function from google map API
function geocodeAddress(geocoder, resultsMap) {
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);

          }
        });
      };

//query yelp search API
function yelpsearch(restaurant, location){
    //query url and grab the response from yelp API
    var yelpURL = "/yelp/search?term=" + encodeURIComponent(restaurant) + "&food&restaurant&location=" + encodeURIComponent(location) + "&limit=3";
    $.ajax({url: yelpURL, method: "GET"
          }).done(function(response){
             console.log(response);
             console.log(yelpURL);

             var infoWindow = new google.maps.InfoWindow();
             //function add pins and table
             //for loop over results until 3 results (0-2)
             //for each result add pin to google map and create a table row and append to table in html

            //use for loop to loop through each item
            for (var i=0; i<response.businesses.length; i++) {

                //store the restaurant data in variable
                var restname = $("<p>").text("Name: " + response.businesses[i].name);
                var restaddress =$("<p>").text("Address: " + response.businesses[i].location.display_address);
                var restphone = $("<p>").text("Phone: " + response.businesses[i].display_phone);

                //create a div tag to store each restaurant data:
                var restaurantDiv = $("<div class=restDiv>");
              
                //create rating image tag to store image
                var ratingimage = $("<img>");

                //set attribute to rating image tag
                ratingimage.attr("src", response.businesses[i].rating_img_url_small);
                //find out in api if you can receive text for rating and create own star system

                //create restaurant image tag to store image
                var restaurantimage = $("<img class='resimage'>");

                //set attribute to image tag
                restaurantimage.attr("src", response.businesses[i].image_url);

          //clone the same set of restaurant data. When click the marker, the infowindow displays data
          //without making the data in the table disapper

                //store the restaurant data in variable
                var googname = $("<p>").text("Name: " + response.businesses[i].name);
                var googaddress =$("<p>").text("Address: " + response.businesses[i].location.display_address);
                var googphone = $("<p>").text("Phone: " + response.businesses[i].display_phone);

                //create a div tag to store each restaurant data:
                var googlerestDiv = $("<div class=restDiv>");

                //create rating image tag to store image
                var ratimage = $("<img>");

                //set attribute to rating image tag
                ratimage.attr("src", response.businesses[i].rating_img_url_small);
                //find out in api if you can receive text for rating and create own star system

                //create restaurant image tag to store image
                var restimage = $("<img class='resimage'>");


                //set attribute to image tag
                restimage.attr("src", response.businesses[i].image_url);

                //append the restuarant data to restaurant Div for the tablet display
                restaurantDiv.append(restaurantimage);
                restaurantDiv.append(ratingimage);
                restaurantDiv.append(restname);
                restaurantDiv.append(restaddress);
                restaurantDiv.append(restphone);

                //append the restaurant data to google map Div to display in marker
                googlerestDiv.append(restimage);
                googlerestDiv.append(ratimage);
                googlerestDiv.append(googname);
                googlerestDiv.append(googaddress);
                googlerestDiv.append(googphone);

                //prepend restaurantDiv to the restaurant list in html
                $("#restauranttable").prepend(restaurantDiv);
                $("#clickmap").html("<button><a href='#map'>Click to see the map</button>").show();

                // Create an array for making a new marker with restaurant infobox

                var m = [restname + "," + restaddress,  response.businesses[i].location.coordinate.latitude, response.businesses[i].location.coordinate.longitude];

                //push marker to the global markers array
                markers.push(m);
                restmarkerinfo.push(googlerestDiv[0]);
                
            } // Closes for loop

            // New For Loop to generate the markers - We push this
            // To arrays up above
            for(var i = 0; i < markers.length; i++){
                var position = new google.maps.LatLng(markers[i][1], markers[i][2]);

                marker = new google.maps.Marker({
                     position: position,
                     map: map,
                     title: markers[i][0]
                 });

                 googleMarker.push(marker);

                 // Allow each marker to have an info window
                google.maps.event.addListener(marker, 'click', (function(marker, i) {
                    return function() {
                        infoWindow.setContent(restmarkerinfo[i]);
                        infoWindow.open(map, marker);
                    };
                })(marker, i));

            }
        });//Closes ajax call
    } // Closes Yelp Search Function

//start the page with the display of the wheel and google map
$(document).ready(drawRouletteWheel,initMap);
