if (typeof jsMaps.Yandex == 'undefined') {
    jsMaps.Yandex = function (mapDomDocument) {};
    jsMaps.Yandex.prototype = new jsMaps.Abstract();
}

var fn;

function GeocodeCallback(data)
{
    var geoCoder = {'results': []};

    var Use = data.response.GeoObjectCollection;

    if (Use.metaDataProperty.found == 0 || Use.featureMember.length == 0) {
        fn(geoCoder);
        return;
    }

    for (var i in Use.featureMember) {
        if (Use.featureMember.hasOwnProperty(i) == false) continue;

        var featureMember = Use.featureMember[i].GeoObject;
        var metaProp = featureMember.metaDataProperty.GeocoderMetaData;

        var types = [];

        if (metaProp.kind == 'country') {
            types.push(jsMaps.supported_Address_types.country);
        } else if (metaProp.kind == 'area') {
            types.push(jsMaps.supported_Address_types.administrative_area_level_1);
            types.push(jsMaps.supported_Address_types.political);
        } else if (metaProp.kind == 'province') {
            types.push(jsMaps.supported_Address_types.administrative_area_level_2);
            types.push(jsMaps.supported_Address_types.political);
        } else if (metaProp.kind == 'locality') {
            types.push(jsMaps.supported_Address_types.locality);
            types.push(jsMaps.supported_Address_types.political);
        } else if (metaProp.kind == 'district') {
            types.push(jsMaps.supported_Address_types.administrative_area_level_3);
            types.push(jsMaps.supported_Address_types.political);
        } else if ((metaProp.kind == 'house' || metaProp.kind == 'street') && (metaProp.precision == 'exact')) {
            types.push(jsMaps.supported_Address_types.street_address);
        } else if ((metaProp.kind == 'house' || metaProp.kind == 'street') && (metaProp.precision != 'exact')) {
            types.push(jsMaps.supported_Address_types.postal_code);
        } else if (metaProp.kind == 'hydro') {
            types.push(jsMaps.supported_Address_types.point_of_interest);
        } else if (metaProp.kind == 'vegetation') {
            types.push(jsMaps.supported_Address_types.natural_feature);
        } else if (metaProp.kind == 'airport') {
            types.push(jsMaps.supported_Address_types.airport);
        }

        var point = featureMember.Point.pos.split(' ');
        var location = new jsMaps.geo.Location(point[1],point[0]);
        var view_port = jsMaps.geo.View_port;

        var location_type = jsMaps.supported_location_types.APPROXIMATE;

        if (metaProp.precision == 'pointAddress') {
            location_type = jsMaps.supported_location_types.ROOFTOP;
        } else if (metaProp.precision == 'number' || metaProp.precision == 'near') {
            location_type = jsMaps.supported_location_types.RANGE_INTERPOLATED;
        }

        var boundedBy   = featureMember.boundedBy.Envelope;
        var upperCorner = boundedBy.upperCorner.split(' '); // topRight
        var lowerCorner = boundedBy.lowerCorner.split(' '); // bottomLeft

        view_port.getTopLeft     = {lat: upperCorner[1], lng: lowerCorner[0]};
        view_port.getBottomRight = {lat: lowerCorner[1], lng: upperCorner[0]};
        view_port.location_type  = location_type;

        var geoCoderResult = new jsMaps.AddressSearchResult(featureMember.name+', '+featureMember.description, types, (metaProp.precision != 'exact'), new jsMaps.Geometry(location, view_port));
        geoCoder['results'].push(geoCoderResult);
    }

    fn(geoCoder);
}

/**
 *
 * @param search
 * @param fun
 */
jsMaps.Yandex.prototype.addressGeoSearch = function (search, fun) {
    fn = fun;
    var script = document.createElement('script');
    script.src = 'http://geocode-maps.yandex.ru/1.x/?geocode=' + search + '&lang=en-US&format=json&callback=GeocodeCallback';

    document.getElementsByTagName('head')[0].appendChild(script);
};
