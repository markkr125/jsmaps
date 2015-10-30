if (typeof jsMaps.Here == 'undefined') {
    jsMaps.Here = function (mapDomDocument) {};
    jsMaps.Here.prototype = new jsMaps.Abstract();
}

/**
 *
 * @param search
 * @param fn
 */
jsMaps.Here.prototype.addressGeoSearch = function (search, fn) {
    jsMaps.callUrlJson('https://geocoder.cit.api.here.com/6.2/geocode.json?searchtext=' + encodeURIComponent(search) + '&language=en-US&gen=8&addressattributes='+encodeURIComponent('ctr,sta,cty,cit,dis,str,hnr,pst,aln,add')+'&maxresults=5&app_id=' + encodeURIComponent(jsMaps.config.here.app_id) + '&app_code=' + encodeURIComponent(jsMaps.config.here.app_code), function (data) {
        var geoCoder = {'results': []};

        if (typeof data.Response.View == 'undefined' || data.Response.View.length == 0) {
            fn(geoCoder);
            return;
        }

        for (var o in data.Response.View) {
            if (data.Response.View.hasOwnProperty(o) == false) continue;
            var results = data.Response.View[o].Result;

            for (var i in results) {
                if (results.hasOwnProperty(i) == false) continue;

                var result = results[i];
                var formatted_address = result.Location.Address.Label;
                var location = new jsMaps.geo.Location(result.Location.DisplayPosition.Latitude,result.Location.DisplayPosition.Longitude);

                var types = [];

                if (result.MatchLevel == 'country') {
                    types.push(jsMaps.supported_Address_types.country);
                } else if (result.MatchLevel == 'state') {
                    types.push(jsMaps.supported_Address_types.administrative_area_level_1);
                    types.push(jsMaps.supported_Address_types.political);
                } else if (result.MatchLevel == 'county') {
                    types.push(jsMaps.supported_Address_types.administrative_area_level_2);
                    types.push(jsMaps.supported_Address_types.political);
                } else if (result.MatchLevel == 'city') {
                    types.push(jsMaps.supported_Address_types.locality);
                    types.push(jsMaps.supported_Address_types.political);
                } else if (result.MatchLevel == 'district') {
                    types.push(jsMaps.supported_Address_types.administrative_area_level_3);
                    types.push(jsMaps.supported_Address_types.political);
                } else if (result.MatchLevel == 'street' || result.MatchLevel == 'houseNumber') {
                    types.push(jsMaps.supported_Address_types.street_address);
                } else if (result.MatchLevel == 'intersection') {
                    types.push(jsMaps.supported_Address_types.intersection);
                } else if (result.MatchLevel == 'postalCode') {
                    types.push(jsMaps.supported_Address_types.postal_code);
                } else if (result.MatchLevel == 'landmark') {
                    types.push(jsMaps.supported_Address_types.premise);
                    types.push(jsMaps.supported_Address_types.point_of_interest);
                }

                if (result.Location.LocationType == 'park') {
                    types.push(jsMaps.supported_Address_types.point_of_interest);
                } else if (result.Location.LocationType == 'airport') {
                    types.push(jsMaps.supported_Address_types.airport);
                } else if (
                    result.Location.LocationType == 'mountainPeak' ||
                    result.Location.LocationType == 'lake' ||
                    result.Location.LocationType == 'island' ||
                    result.Location.LocationType == 'beach'
                ) {
                    types.push(jsMaps.supported_Address_types.natural_feature);
                }

                var mapView = result.Location.MapView;
                var topLeft = mapView.TopLeft;
                var bottomRight = mapView.BottomRight;

                var view_port = jsMaps.geo.View_port;

                var location_type = jsMaps.supported_location_types.APPROXIMATE;

                if (result.MatchType == 'pointAddress') {
                    location_type = jsMaps.supported_location_types.ROOFTOP;
                } else if (result.MatchType == 'interpolated' && result.MatchLevel != 'city') {
                    location_type = jsMaps.supported_location_types.RANGE_INTERPOLATED;
                } else if (result.MatchType == 'interpolated' && result.MatchLevel == 'city') {
                    location_type = jsMaps.supported_location_types.GEOMETRIC_CENTER;
                }

                view_port.getTopLeft = {lat: topLeft.Latitude, lng: topLeft.Longitude};
                view_port.getBottomRight = {lat: bottomRight.Latitude, lng: bottomRight.Longitude};
                view_port.location_type = location_type;

                var geoCoderResult = new jsMaps.AddressSearchResult(formatted_address, types, (result.Relevance < 1.0), new jsMaps.Geometry(location, view_port));
                geoCoder['results'].push(geoCoderResult);
            }
        }

        fn(geoCoder);
    });
};