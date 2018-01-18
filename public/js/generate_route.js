let places = [];
let images = [];

// Reference: https://gist.github.com/jeromer/2005586
let calculate_compass_bearing = function (lat1, long1, lat2, long2) {
    let convertToRadians = degree => {
        return degree * (Math.PI / 180);
    };

    let convertToDegrees = radians => {
        return radians * (180 / Math.PI);
    };

    lat1 = convertToRadians(lat1);
    lat2 = convertToRadians(lat2);

    let diffLong = convertToRadians(long2 - long1);

    let x = Math.sin(diffLong) * Math.cos(lat2);
    let y = Math.cos(lat1) * Math.sin(lat2) - Math.cos(lat2) * Math.sin(lat1) * Math.cos(diffLong);

    return (convertToDegrees(Math.atan2(x, y)) + 360) % 360;
};

let getImages = function() {
    for(let i = 0; i < places[1].length; i++) {
        const lati1 = places[1][i].lat;
        const long1 = places[1][i].lng;
        const lati2 = places[1][0].lat;
        const long2 = places[1][0].lng;
        const heading = calculate_compass_bearing(lati2, long2, lati1, long1);
        const key = '';
        const url = `https://maps.googleapis.com/maps/api/streetview?size=800x800&location=${lati1},${long1}&heading=${heading}&key=${key}`;
        images.push({
            url,
            lat: lati1,
            lng: long2
        });
    }
    console.log(images);
};

$(function () {
    const $streetImage = $('#street-view-image');
    $.get('/getPlaces', (data) => {
        $.map(data, function(element) {
            places.push(element);
        });

        // console.log(places);
        getImages();
    });
});