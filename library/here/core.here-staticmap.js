if (typeof jsMaps.Here == 'undefined') {
    jsMaps.Here = function (mapDomDocument) {};
    jsMaps.Here.prototype = new jsMaps.Abstract();
}

/**
 *
 * @param {jsMaps.staticMapOptions} parameters
 * @param {jsMaps.staticMapMarker[]} markers
 * @param {jsMaps.staticMapPath} path
 */
jsMaps.Here.prototype.staticMap = function (parameters,markers,path) {
    var mapParts = [];
    if (parameters.center != null) {
        mapParts.push('c='+encodeURIComponent(parameters.center.lat)+','+encodeURIComponent(parameters.center.lng));
    }

    if (parameters.zoom != null) {
        mapParts.push('z='+encodeURIComponent(parameters.zoom));
    }

    mapParts.push('w='+encodeURIComponent(parameters.size.width)+'&h='+encodeURIComponent(parameters.size.height));

    if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.roadmap) {
        mapParts.push('t=0');
    } else if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.satellite) {
        mapParts.push('t=1');
    } else if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.terrain) {
        mapParts.push('t=2');
    }

    mapParts.push('app_id='+encodeURIComponent(jsMaps.config.here.app_id));
    mapParts.push('app_code='+encodeURIComponent(jsMaps.config.here.app_code));

    var map = 'https://image.maps.cit.api.here.com/mia/1.6/route?'+mapParts.join('&');

    if (typeof markers != 'undefined' && markers.length > 0) {
        for (var i in markers) {
            if (markers.hasOwnProperty(i) == false) continue;
            var marker = markers[i];

            var string = [];
            string.push(marker.location.lat+','+marker.location.lng);

            if (marker.color== '') marker.color = 'ff0000';

            string.push(marker.color+';000000;15');
            if (marker.label!= '')  string.push(marker.label);

            map += '&poix'+i+'='+encodeURIComponent(string.join(';'));
        }
    }

    if (typeof path != 'undefined') {
        var pathData = [];

        for (var p in path.path) {
            if (path.path.hasOwnProperty(p) == false) continue;
            var latLng = path.path[p];

            pathData.push(latLng.lat);
            pathData.push(latLng.lng);
        }

        map += '&r0='+pathData.join(',')+'&lc0='+path.color+'&lw0='+path.weight;
    }

    return map;
};
