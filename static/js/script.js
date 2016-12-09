var input = '';
var results = {};
var index = 0;
var destination = '';

function getLocation() {
    var x = document.getElementById("main");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendPosition);
    } else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function sendPosition() {
    // var x = document.getElementById("main");
    input = document.getElementById("location").value;
    if(!input){
      input = 'San Francisco'
    }
    var display = document.getElementById("display");
    var data = document.getElementById("actual_data");
    $.ajax({
      type: "POST",
      url: '/',
      data: {
      	'location': input
      },
      dataType: 'json',
      success: function(response){
        results = response['businesses'];
        // display.innerHTML = JSON.stringify(results[0], null, 2);
        // data.innerHTML = JSON.stringify(response['businesses'][0], null, 2);
        processRestaurant(response['businesses'][0]);
	    document.getElementById('input-form').className = 'hide';
	    document.getElementById("location").className = 'hide';
	    document.getElementById("try-it").className = 'hide';
	    document.getElementById("next").className = 'show control-button';
	    document.getElementById("go-there").className = 'show go-there control-button';
      }
    });
    return false;
}

function sendRestaurant(){
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: input
  });
  directionsDisplay.setMap(map);
  div = document.getElementById('map');
  div.style.display = 'block';
  div.style.visibility = 'visible';

  panel = document.getElementById('right-panel');
  panel.style.height = '30%';
  panel.style.width = '29.3%';
  panel.style.marginLeft = '36%';
  document.getElementById('right-panel').innerHTML = '';
  directionsDisplay.setPanel(document.getElementById('right-panel'));

  // var control = document.getElementById('floating-panel');
  // control.style.display = 'block';
  // map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
  calculateAndDisplayRoute(directionsService, directionsDisplay);
  google.maps.event.trigger(map, "resize");
  document.getElementById('info-container').className = 'hide';
  document.getElementById('go-there').className = 'hide';
  document.getElementById('prev').className = 'hide';
  document.getElementById('next').className = 'hide';
};

function initMap() {
  div = document.getElementById('map');
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: input
  });
  directionsDisplay.setMap(map);
  div.style.display = 'none';
  div.style.visibility = 'hidden';
  google.maps.event.trigger(map, "resize");
  // var onChangeHandler = function() {
  //   calculateAndDisplayRoute(directionsService, directionsDisplay);
  // };
  // document.getElementById('location').addEventListener('change', onChangeHandler);
  // document.getElementById('r_location').addEventListener('change', onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: input,
    destination: getRestaurantAtId(index)['location']['display_address'].toString(),
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
})};

function getNextRestaurant(position) {
    index += 1;

    var display = document.getElementById("display");
    $.ajax({
      type: "POST",
      url: '/next',
      dataType: 'json',
      success: function(response){
        // display.innerHTML = JSON.stringify(response['business'], null, 2);
        processRestaurant(response['business']);
      }
    });
    document.getElementById("prev").className = 'show control-button';
};

function getRestaurantAtId(id){
  if(results.length != 0 || results != null)
    return results[id];
  return null;
};

function getPrevRestaurant(position) {
    var display = document.getElementById("display");
    $.ajax({
      type: "POST",
      url: '/prev',
      dataType: 'json',
      success: function(response){
        // display.innerHTML = JSON.stringify(response['business'], null, 2);
        processRestaurant(response['business']);
        if (response['offset'] == 0) document.getElementById('prev').className = 'hide';
      }
    });
}

function processRestaurant(data) {
  var name = document.getElementById("name"),
      stars = document.getElementById("rating"),
      genre = document.getElementById("genre"),
      number = document.getElementById("phone-num"),
      number = document.getElementById("link"),
      img = document.getElementById("img"),
      address = document.getElementById("address");

  name.innerHTML = data['name'];
  stars.innerHTML = "<img src='" + data['rating_img_url_large'] + "' />";
  genre.innerHTML = "Category: " + data['categories'][0][0];
  number.innerHTML = "Phone: " + data['display_phone'];
  link.innerHTML = "<a href='" + data['url'] + "'>See more information here</a>";
  img.innerHTML = "<img src='" + data['image_url'].replace('ms.jpg', 'o.jpg') + "' />";
  address.innerHTML = "Address: " + data['location']['display_address'].toString();
};
