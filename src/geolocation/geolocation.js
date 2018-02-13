var osm = require('osm');

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
    let latitude = position.coords.latitude
    let longitude = position.coords.longitude
    // let's show a map or do something interesting!

    let map = osm().position(latitude, longitude)

    console.log('Lat', latitude, 'Long', longitude)

    document.getElementById('geo-wrapper').appendChild(map.show())
    document.getElementById('msg').innerHTML = 'Your browser thinks you are here'
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
