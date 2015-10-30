if (typeof jsMaps.Bing == 'undefined') {
    jsMaps.Bing = function(mapDomDocument) {};
    jsMaps.Bing.prototype = new jsMaps.Abstract();
}

// Microsoft is to blame for this
var fn;

function GeocodeCallback(data)
{
    var geoCoder = {'results': [],'copyright':data.copyright,'brandLogoUri':data.brandLogoUri};

    if (data.statusCode != '200' || data.resourceSets[0].resources.length == 0) {
        fn(geoCoder);
        return;
    }

    for (var o in data.resourceSets[0].resources) {
        if (data.resourceSets[0].resources.hasOwnProperty(o) == false) continue;
        var resources = data.resourceSets[0].resources[o];

        var location = new jsMaps.geo.Location(resources.point.coordinates[0],resources.point.coordinates[1]);

        var view_port = jsMaps.geo.View_port;

        var location_type = jsMaps.supported_location_types.APPROXIMATE;

        var geocode = resources.geocodePoints[0];

        if (geocode.calculationMethod == 'Rooftop') {
            location_type = jsMaps.supported_location_types.ROOFTOP;
        } else if (geocode.calculationMethod == 'Interpolation') {
            location_type = jsMaps.supported_location_types.RANGE_INTERPOLATED;
        } else if (geocode.calculationMethod == 'Parcel') {
            location_type = jsMaps.supported_location_types.GEOMETRIC_CENTER;
        }


        view_port.getTopLeft = {lat: resources.bbox[2], lng: resources.bbox[3]};
        view_port.getBottomRight = {lat: resources.bbox[0], lng: resources.bbox[1]};
        view_port.location_type = location_type;

        var types = [];

        for (var a in resources.address) {
            if (a == 'addressLine' || a == 'formattedAddress') {
                types.push(jsMaps.supported_Address_types.street_address);
            }

            if (a == 'locality' || a == 'neighborhood') {
                types.push(jsMaps.supported_Address_types.locality);
                types.push(jsMaps.supported_Address_types.political);
            }

            if (a == 'adminDistrict') {
                types.push(jsMaps.supported_Address_types.administrative_area_level_1);
                types.push(jsMaps.supported_Address_types.political);
            }

            if (a == 'adminDistrict2') {
                types.push(jsMaps.supported_Address_types.administrative_area_level_2);
                types.push(jsMaps.supported_Address_types.political);
            }

            if (a == 'postalCode') {
                types.push(jsMaps.supported_Address_types.postal_code);
            }

            if (a == 'countryRegion' || a == 'countryRegionIso2') {
                types.push(jsMaps.supported_Address_types.country);
            }

            if (a == 'landmark') {
                types.push(jsMaps.supported_Address_types.premise);
                types.push(jsMaps.supported_Address_types.point_of_interest);
            }
        }


        var geoCoderResult = new jsMaps.AddressSearchResult(resources.name, types, (resources.confidence != 'High'), new jsMaps.Geometry(location, view_port));
        geoCoder['results'].push(geoCoderResult);
    }

    fn(geoCoder);
}

/**
 *
 * @param search
 * @param fun
 */
jsMaps.Bing.prototype.addressGeoSearch = function (search, fun) {
    fn = fun;
    var script = document.createElement('script');
    script.src = 'http://dev.virtualearth.net/REST/v1/Locations?query=' + encodeURIComponent(search) + '&output=json&jsonp=GeocodeCallback&key=' + encodeURIComponent(jsMaps.config.bing.key);

    document.getElementsByTagName('head')[0].appendChild(script);
};
