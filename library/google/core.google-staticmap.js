if (typeof jsMaps.Google == 'undefined') {
    jsMaps.Google = function(mapDomDocument) {};
    jsMaps.Google.prototype = new jsMaps.Abstract();
}

/**
 *
 * @param {jsMaps.staticMapOptions} parameters
 * @param {jsMaps.staticMapMarker[]} markers
 * @param {jsMaps.staticMapPath} path
 */
jsMaps.Google.prototype.staticMap = function (parameters,markers,path) {
    var mapParts = [];
    if (parameters.center != null) {
        mapParts.push('center='+encodeURIComponent(parameters.center.lat)+','+encodeURIComponent(parameters.center.lng));
    }

    if (parameters.zoom != null) {
        mapParts.push('zoom='+encodeURIComponent(parameters.zoom));
    }

    if (typeof parameters.maptype == 'undefined') parameters.maptype = jsMaps.staticMapOptions.supported_map_types.roadmap;

    mapParts.push('size='+encodeURIComponent(parameters.size.width+'x'+parameters.size.height));
    mapParts.push('maptype='+encodeURIComponent(parameters.maptype));

    var map = 'https://maps.googleapis.com/maps/api/staticmap?'+mapParts.join('&');

    if (typeof markers != 'undefined' && markers.length > 0) {
        for (var i in markers) {
            if (markers.hasOwnProperty(i) == false) continue;
            var marker = markers[i];

            var string = [];
            if (marker.color!= '')  string.push('color:0x'+marker.color);
            if (marker.label!= '')  string.push('label:'+marker.label);
            string.push(marker.location.lat+','+marker.location.lng);

            map += '&markers='+encodeURIComponent(string.join('|'));
        }
    }

    if (typeof path != 'undefined') {
        var pathData = 'color:0x'+path.color+'|weight:'+path.weight;
        if (typeof path.fillColor != 'undefined') pathData += '|fillcolor:0x'+path.fillColor;

        for (var p in path.path) {
            if (path.path.hasOwnProperty(p) == false) continue;
            var latLng = path.path[p];

            pathData += '|'+latLng.lat+','+latLng.lng;
        }

        map += '&path='+encodeURIComponent(pathData);
    }

    return map;
};