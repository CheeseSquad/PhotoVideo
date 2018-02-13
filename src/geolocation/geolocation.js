const supports_geolocation = () => {
    return !!navigator.geolocation;
}

const get_location = () => {
    if (supports_geolocation()) {
        navigator.geolocation.getCurrentPosition(show_map, handle_error);
    } else {
        // no native support;
        document.getElementById('msg').text = 'Your browser doesn\'t support geolocation!'
    }
}

const show_map = (position) => {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    // let's show a map or do something interesting!

    document.getElementById('geo-wrapper').css = ({ 'width': '640px', 'height': '480px' });

    var latlng = new google.maps.LatLng(latitude, longitude);
    var myOptions = {
        zoom: 10,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('geo-wrapper'), myOptions);

    var marker = new google.maps.Marker({
        position: latlng,
        title: "You are here (more or less)!"
    });

    // To add the marker to the map, call setMap();
    marker.setMap(map);

    console.log('Lat', latitude, 'Long', longitude)

    document.getElementById("msg").innerHTML = 'Your browser thinks you are here:'
    document.getElementById('lat').innerHTML = 'Latitude: ' + latitude
    document.getElementById('long').innerHTML = 'Longitude: ' + longitude
}

const handle_error = (err) => {
    if (err.code == 1) {
        // user said no!
        document.getElementById('msg').text = 'You chose not to share your location.'
    }
}

export { get_location }
