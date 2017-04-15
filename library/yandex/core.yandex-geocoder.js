if (typeof jsMaps.Yandex == 'undefined') {
    jsMaps.Yandex = function (mapDomDocument) {
    };
    jsMaps.Yandex.prototype = new jsMaps.Abstract();
}

/**
 *
 * @param search
 * @param fun
 */
jsMaps.Yandex.prototype.addressGeoSearch = function (search, fun) {
    ymaps.ready(function () {
        ymaps.geocode(search, {
            results: 15
        }).then(function (res) {
            var iterator = res.geoObjects.getIterator(),
                obj;

            var geoCoder = {'results': []};

            while ((obj = iterator.getNext()) != iterator.STOP_ITERATION) {
                var types = [];

                var featureMember = obj.properties.getAll();
                var metaProp = obj.properties.get('metaDataProperty.GeocoderMetaData');

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

                var point = obj.geometry.getCoordinates();

                var location = new jsMaps.geo.Location(point[1], point[0]);
                var view_port = jsMaps.geo.View_port;

                var location_type = jsMaps.supported_location_types.APPROXIMATE;

                if (metaProp.precision == 'pointAddress') {
                    location_type = jsMaps.supported_location_types.ROOFTOP;
                } else if (metaProp.precision == 'number' || metaProp.precision == 'near') {
                    location_type = jsMaps.supported_location_types.RANGE_INTERPOLATED;
                }


                var data = featureMember.boundedBy;
                var bounds =  {getTopLeft: {lat: data[1][0],lng: data[0][1]},getBottomRight: {lat: data[0][0],lng: data[1][1]}};

                view_port.getTopLeft = {lat:bounds.getTopLeft.lat, lng: bounds.getTopLeft.lng};
                view_port.getBottomRight = {lat: bounds.getBottomRight.lat, lng: bounds.getBottomRight.lng};
                view_port.location_type = location_type;

                var geoCoderResult = new jsMaps.AddressSearchResult(featureMember.name + ', ' + featureMember.description, types, (metaProp.precision != 'exact'), new jsMaps.Geometry(location, view_port));
                geoCoder['results'].push(geoCoderResult);
            }

            fun(geoCoder);
        });
    });
};
