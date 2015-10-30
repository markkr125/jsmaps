if (typeof jsMaps.Google == 'undefined') {
    jsMaps.Google = function(mapDomDocument) {};
    jsMaps.Google.prototype = new jsMaps.Abstract();
}

/**
 *
 * @param search
 * @param fn
 */
jsMaps.Google.prototype.addressGeoSearch = function (search, fn) {
    new google.maps.Geocoder().geocode({'address': search}, function (results, status) {
        var geoCoder = {'results': []};

        // Google return an error
        if (status != google.maps.GeocoderStatus.OK) {
            fn(geoCoder);
            return;
        }

        // create the unified geocode structure
        if (results.length > 0) {

            for (var i in results) {
                if (results.hasOwnProperty(i) == false) continue;
                var result = results[i];

                var formatted_address;
                if (typeof result.formatted_address != 'undefined') {
                    formatted_address = result.formatted_address;
                } else {
                    var address_components = [];

                    for (var c in result.address_components) {
                        if (result.address_components.hasOwnProperty(c) == false) continue;
                        address_components.push(result.address_components[c].long_names);
                    }

                    formatted_address = address_components.join (', ');
                }

                var location = new jsMaps.geo.Location(result.geometry.location.lat(),result.geometry.location.lng());
                var view_port_google = result.geometry.viewport;

                var topLeft = view_port_google.getNorthEast();
                var bottomRight = view_port_google.getSouthWest();

                var view_port = jsMaps.geo.View_port;

                view_port.getTopLeft = {lat: topLeft.lat(), lng: topLeft.lng()};
                view_port.getBottomRight = {lat: bottomRight.lat(), lng: bottomRight.lng()};
                view_port.location_type = result.geometry.location_type;

                var geoCoderResult = new jsMaps.AddressSearchResult(formatted_address, result.types, (typeof results.partial_match != 'undefined' && results.partial_match == true), new jsMaps.Geometry(location,view_port));

                geoCoder['results'].push(geoCoderResult);
            }
        }

        fn(geoCoder);
    });
};