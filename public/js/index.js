let selectedPlace = null;
let waypoints = [];

function initMap() {
    let map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -33.8688, lng: 151.2195},
        zoom: 13
    });

    let card = document.getElementById('pac-card');
    let input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    let autocomplete = new google.maps.places.Autocomplete(input);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo('bounds', map);

    let infowindow = new google.maps.InfoWindow();
    let infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    let marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        let place = autocomplete.getPlace();
        selectedPlace = place;
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        let address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = address;
        infowindow.open(map, marker);
    });
}

let getDirections = function (callback) {
    let directionsService = new google.maps.DirectionsService;
    directionsService.route({
        origin: waypoints.slice(0, 1)[0].location,
        destination: waypoints.slice(waypoints.length-1)[0].location,
        waypoints: waypoints.slice(1, waypoints.length-1),
        travelMode: 'DRIVING',
    }, function (response, status) {
        if(status === 'OK') {
            let result = [];
            for(let i = 0; i <  response.routes[0].legs.length; i++) {
                for(let j = 0; j  < response.routes[0].legs[i].steps.length; j++) {
                    for(let k = 0; k < response.routes[0].legs[i].steps[j].lat_lngs.length; k++) {
                        result.push({
                            lat: response.routes[0].legs[i].steps[j].lat_lngs[k].lat(),
                            lng: response.routes[0].legs[i].steps[j].lat_lngs[k].lng()
                        });
                    }
                }
            }

            callback(result);
        } else {
            console.log('cannot fetch directions');
        }
    });
};

$(function () {
    const $placeSelectBtn = $('#place-select-btn');
    const $waypointsList = $('.waypoints-list');
    const $generateTourBtn = $('.generate-buton');
    $placeSelectBtn.on('click', () => {
        if (selectedPlace !== null) {
            $waypointsList.append(`<li class="list-group-item">${selectedPlace.name}<i class="fa fa-trash fa-custom-settings"></i></li>`)
            waypoints.push({
                // name: selectedPlace.address_components,
                // address: selectedPlace.adr_address,
                location: selectedPlace.formatted_address
                // geometry: selectedPlace.geometry,
                // icon: selectedPlace.icon,
                // place_id: selectedPlace.place_id,
                // url: selectedPlace.url,
                // vicinity: selectedPlace.vicinity
            });
        }

        selectedPlace = null;
    });

    $generateTourBtn.on('click', function () {
        getDirections((directions) => {
            let data = {
                waypoints,
                directions
            };

            console.log(directions);
            $.post('/set_route', {data: JSON.stringify(data)}, () => {
                window.location.href = "/generate_route.html";
            });
        });
    });
});