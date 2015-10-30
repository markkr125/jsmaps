if (typeof jsMaps.Yandex == 'undefined') {
    jsMaps.Yandex = function (mapDomDocument) {};
    jsMaps.Yandex.prototype = new jsMaps.Abstract();
}

/**
 *
 * @param {jsMaps.staticMapOptions} parameters
 * @param {jsMaps.staticMapMarker[]} markers
 * @param {jsMaps.staticMapPath} path
 */
jsMaps.Yandex.prototype.staticMap = function (parameters,markers,path) {
    var mapParts = [];

    if (parameters.center != null) {
        mapParts.push('ll='+encodeURIComponent(parameters.center.lng)+','+encodeURIComponent(parameters.center.lat));
    }

    if (parameters.zoom > 18) {
        parameters.zoom = 18;
    }

    if (parameters.zoom != null) {
        mapParts.push('z='+encodeURIComponent(parameters.zoom));
    }

    mapParts.push('size='+encodeURIComponent(parameters.size.width)+','+encodeURIComponent(parameters.size.height));

    if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.roadmap) {
        mapParts.push('l=map');
    } else if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.satellite) {
        mapParts.push('l=sat,skl');
    } else if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.terrain) {
        mapParts.push('l=map,skl');
    } else {
        mapParts.push('l=map');
    }

    var map = 'http://static-maps.yandex.ru/1.x/?lang=en-US&'+mapParts.join('&');

    if (typeof markers != 'undefined' && markers.length > 0) {
        var supported_colors = jsMaps.supported_colors;
        var points = [];

        for (var i in markers) {
            if (markers.hasOwnProperty(i) == false) continue;
            var marker = markers[i];

            var colorText = 'blue';
            var colorImg = 'db';

            // I blame microsoft for the code bellow
            for (var x in supported_colors) {
                if (supported_colors.hasOwnProperty(x) == false) continue;

                if (supported_colors[x] == marker.color || '#'+supported_colors[x] == marker.color) {
                    colorText = x;
                    break;
                }
            }

            if (colorText == 'black') {
                colorImg = 'nt';
            } else if (colorText == 'brown') {
                colorImg = 'do';
            } else if (colorText == 'green') {
                colorImg = 'gn';
            } else if (colorText == 'purple') {
                colorImg = 'vv';
            } else if (colorText == 'yellow') {
                colorImg = 'yw';
            } else if (colorText == 'blue') {
                colorImg = 'bl';
            } else if (colorText == 'red') {
                colorImg = 'rd';
            } else if (colorText == 'white') {
                colorImg = 'wt';
            } else if (colorText == 'orange') {
                colorImg = 'or';
            }

            var mrk = marker.location.lng+','+marker.location.lat+',pm2'+colorImg+'m';

            if (!isNaN(marker.label)) {
                mrk += marker.label;
            }

            points.push(mrk);
        }

        map += '&pt='+points.join('~');
    }


    if (typeof path != 'undefined') {
        var pathData = 'c:'+path.color+'A0,w:'+path.weight;
        if (typeof path.fillColor != 'undefined') pathData += ',f:'+path.fillColor+'A0';

        for (var p in path.path) {
            if (path.path.hasOwnProperty(p) == false) continue;
            var latLng = path.path[p];

            pathData += ','+latLng.lng+','+latLng.lat;
        }

        map += '&pl='+pathData;
    }

    return map;
};
