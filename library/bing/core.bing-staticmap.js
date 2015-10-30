if (typeof jsMaps.Bing == 'undefined') {
    jsMaps.Bing = function(mapDomDocument) {};
    jsMaps.Bing.prototype = new jsMaps.Abstract();
}


/**
 *
 * @param {jsMaps.staticMapOptions} parameters
 * @param {jsMaps.staticMapMarker[]} markers
 * @param {jsMaps.staticMapPath} path
 */
jsMaps.Bing.prototype.staticMap = function (parameters,markers,path) {
    var mapParts = [];

    var centerPoint = '';
    if (parameters.center != null) {
        centerPoint=encodeURIComponent(parameters.center.lat)+','+encodeURIComponent(parameters.center.lng)+'/';
    }

    var zoomLevel = 10;
    if (parameters.zoom != null) {
        zoomLevel = encodeURIComponent(parameters.zoom)+'/';
    }

    mapParts.push('mapSize='+encodeURIComponent(parameters.size.width)+','+encodeURIComponent(parameters.size.height));

    var mapType = 'Road/';

    if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.roadmap) {
        mapType ='Road/';
    } else if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.satellite) {
        mapType ='AerialWithLabels/';
    } else if (parameters.maptype == jsMaps.staticMapOptions.supported_map_types.terrain) {
        mapType ='Road/';
    }

    mapParts.push('key='+encodeURIComponent(jsMaps.config.bing.key));

    var map = 'http://dev.virtualearth.net/REST/v1/Imagery/Map/'+mapType+centerPoint+zoomLevel+'?'+mapParts.join('&');

    if (typeof markers != 'undefined' && markers.length > 0) {
        var supported_colors = jsMaps.supported_colors;

        for (var i in markers) {
            if (markers.hasOwnProperty(i) == false) continue;
            var marker = markers[i];

            var string = [];
            string.push(marker.location.lat+','+marker.location.lng);

            if (marker.color== '') marker.color = '0000FF';

            var colorText = 'blue';
            var colorImg;

            // I blame microsoft for the code bellow
            for (var x in supported_colors) {
                if (supported_colors.hasOwnProperty(x) == false) continue;

                if (supported_colors[x] == marker.color || '#'+supported_colors[x] == marker.color) {
                    colorText = x;
                    break;
                }
            }

            if (colorText == 'black') {
                colorImg = 65;
            } else if (colorText == 'brown') {
                colorImg = 65;
            } else if (colorText == 'green') {
                colorImg = 26;
            } else if (colorText == 'purple') {
                colorImg = 45;
            } else if (colorText == 'yellow') {
                colorImg = 63;
            } else if (colorText == 'blue') {
                colorImg = 65;
            } else if (colorText == 'red') {
                colorImg = 7;
            } else if (colorText == 'white') {
                colorImg = 65;
            } else if (colorText == 'orange') {
                colorImg = 23;
            }

            string.push(colorImg);
            if (marker.label!= '')  string.push(marker.label);

            map += '&pp='+encodeURIComponent(string.join(';'));
        }
    }

    // Poly lines are not supported

    return map;
};