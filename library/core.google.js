jsMaps.Google = function(mapDomDocument) {};
jsMaps.Google.prototype = new jsMaps.Abstract();

/**
 * create the mal
 *
 * @param mapDomDocument
 * @param options
 * @param providerOptions
 * @returns {jsMaps.MapStructure}
 */
jsMaps.Google.prototype.initializeMap = function (mapDomDocument, options, providerOptions) {
    var myOptions = {
        zoom: options.zoom,
        center: new google.maps.LatLng(options.center.latitude, options.center.longitude),
        disableDefaultUI: true,
        scrollwheel: options.mouse_scroll,
        navigationControl: true,
        navigationControlOptions: {style: google.maps.NavigationControlStyle.ZOOM_PAN},
        mapTypeControl: options.map_type,
        timeoutSeconds: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: options.street_view,
        zoomControl: options.zoom_control,
        scaleControl: options.scale_control,
        panControl: true
    };

    if (typeof providerOptions != 'undefined') {
        myOptions = jsMaps.merge(myOptions,providerOptions);
    }

    var map = new google.maps.Map(mapDomDocument, myOptions);
    var hooking = function() {};
    hooking.prototype.bounds = null;

    hooking.prototype = new jsMaps.MapStructure();

    hooking.prototype.object = map;

    hooking.prototype.getCenter = function () {
        var map = this.object.getCenter();
        return {lat: map.lat(), lng: map.lng()};
    };

    hooking.prototype.setCenter = function (lat, lng) {
        this.object.panTo(new google.maps.LatLng(lat, lng));
    };

    hooking.prototype.getBounds = function () {
        return jsMaps.Google.prototype.bounds(this);
    };

    hooking.prototype.getZoom = function () {
        return this.object.getZoom();
    };

    hooking.prototype.setZoom = function (number) {
        google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
            map.setZoom(number);
        });
    };

    /**
     *
     * @param {jsMaps.BoundsStructure} bounds
     */
    hooking.prototype.fitBounds = function (bounds) {
        return this.object.fitBounds(bounds.bounds);
    };

    var newHook = new hooking();

    google.maps.event.addListener(map, 'bounds_changed', function(){
        newHook.bounds = this.getBounds();
    });

    return newHook;
};

/**
 * Attach map events
 *
 * @param content
 * @param event
 * @param fn
 * @param once
 * @returns {*}
 */
jsMaps.Google.prototype.attachEvent = function (content,event,fn,once) {
    if (typeof once != 'undefined' && once == true) {
        return google.maps.event.addListenerOnce(content.object, event, fn);
    } else {
        return google.maps.event.addListener(content.object,event, fn);
    }
};

/**
 *
 * @param map
 * @param eventObject
 * @returns {*}
 */
jsMaps.Google.prototype.removeEvent = function (map,eventObject) {
    google.maps.event.removeListener(eventObject);
};

/**
 * Bounds object
 *
 * @param map
 * @returns hooking
 */
jsMaps.Google.prototype.bounds = function (map) {
    var bounds;

    if (typeof map != 'undefined') {
        bounds = map.object.getBounds();

        if (typeof bounds == 'undefined') bounds = map.bounds;
    } else {
        bounds = new google.maps.LatLngBounds();
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.BoundsStructure();

    hooking.prototype.bounds = bounds;

    hooking.prototype.addLatLng = function (lat, lng) {
        bounds.extend(new google.maps.LatLng(lat, lng));
    };

    hooking.prototype.getCenter = function () {
        var center = bounds.getCenter();
        return {lat: center.lat(), lng: center.lng()};
    };

    hooking.prototype.getTopLeft = function () {
        var topLeft = bounds.getNorthEast();
        return {lat: topLeft.lat(), lng: topLeft.lng()};
    };

    hooking.prototype.getBottomRight = function () {
        var bottomRight = bounds.getSouthWest();
        return {lat: bottomRight.lat(), lng: bottomRight.lng()};
    };

    return new hooking();
};

/**
 * Generate markers
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.markerOptions} parameters
 */
jsMaps.Google.prototype.marker = function (map,parameters) {
    var options = {position:  new google.maps.LatLng(parameters.position.lat, parameters.position.lng),map: map.object};
    if (parameters.title != null) options.title = parameters.title;
    if (parameters.zIndex != null) options.zIndex = parameters.zIndex;
    if (parameters.icon != null) options.icon = parameters.icon;
    if (parameters.draggable != null) options.draggable = parameters.draggable;

    var marker = new google.maps.Marker(options);

    var hooking = function () {};
    hooking.prototype = new jsMaps.MarkerStructure();

    hooking.prototype.object = marker;

    if (parameters.draggable != '') options.draggable = parameters.draggable;
    /**
     *
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.getPosition = function () {
        var pos = this.object.getPosition();
        return {lat: pos.lat(), lng: pos.lng()}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        this.object.setPosition(new google.maps.LatLng(lat, lng));
    };

    hooking.prototype.getVisible = function () {
       return this.object.getVisible();
    };

    hooking.prototype.setVisible = function (variable) {
        return this.object.setVisible(variable);
    };

    hooking.prototype.getIcon = function () {
        return marker.getIcon();
    };

    hooking.prototype.setIcon = function (icon) {
        this.object.setIcon(icon);
    };

    hooking.prototype.getZIndex = function () {
        return this.object.getZIndex();
    };

    hooking.prototype.setZIndex = function (number) {
        this.object.setZIndex(number);
    };

    hooking.prototype.setDraggable = function (flag) {
        this.object.setDraggable(flag);
    };

    hooking.prototype.remove = function () {
        this.object.setMap(null);
    };

    return new hooking();
};

/**
 * Info windows
 *
 * Create bubbles to be displayed on the map
 *
 * @param {jsMaps.infoWindowOptions} parameters
 * @returns {jsMaps.InfoWindowStructure}
 */
jsMaps.Google.prototype.infoWindow = function (parameters) {
    var options = {content: parameters.content};
    if (parameters.position != null) options.position = new google.maps.LatLng(parameters.position.lat, parameters.position.lng);

    var infoWindow = new google.maps.InfoWindow(options);

    var hooking = function () {};
    hooking.prototype = new jsMaps.InfoWindowStructure();

    hooking.prototype.object = infoWindow;

    hooking.prototype.getPosition = function () {
        var pos = this.object.getPosition();
        return {lat: pos.lat(), lng: pos.lng()}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        this.object.setPosition(new google.maps.LatLng(lat, lng));
    };

    hooking.prototype.close = function () {
        this.object.close();
    };

    /**
     *
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.MarkerStructure} marker
     */
    hooking.prototype.open = function(map,marker) {
        this.object.open(map.object,marker.object);
    };

    hooking.prototype.setContent = function (content) {
        this.object.setContent(content);
    };

    return new hooking();
};

jsMaps.Google.toGooglePath =  function (path) {
    if (typeof path == 'undefined' || path == []) return [];

    var newPath = [];

    for (var i in path) {
        if (path.hasOwnProperty(i) == false) continue;

        if (Array.isArray(path[i])) {
            var recentArray = [];
            for (var c in path[i]) {
                if (path[i].hasOwnProperty(c) == false) continue;
                recentArray.push(new google.maps.LatLng(path[i][c].lat, path[i][c].lng));
            }
            newPath.push(recentArray);
        } else {
            newPath.push(new google.maps.LatLng(path[i].lat, path[i].lng));
        }
    }

    return newPath;
};

/**
 * Create PolyLine
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolyLineOptions} parameters
 * @returns jsMaps.PolyLineStructure
 */
jsMaps.Google.prototype.polyLine = function (map,parameters) {

    var options = {
        clickable: parameters.clickable,
        draggable: parameters.draggable,
        editable: parameters.editable,
        path: jsMaps.Google.toGooglePath(parameters.path),
        strokeColor:parameters.strokeColor,
        strokeOpacity: parameters.strokeOpacity,
        strokeWeight: parameters.strokeWeight,
        visible: parameters.visible,
        zIndex: parameters.zIndex,
        map: map.object
    };

    var PolyLine = new google.maps.Polyline(options);

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolyLineStructure();

    hooking.prototype.object = PolyLine;

    hooking.prototype.getEditable = function () {
        return this.object.getEditable();
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        var path = this.object.getPath().getArray();

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            var pos = path[i];

            arrayOfPaths.push ({lat: pos.lat(), lng: pos.lng()});
        }

        return arrayOfPaths;
    };

    hooking.prototype.getPaths = function () {
        var arrayOfPaths = [];
        var path = this.object.getPaths().getArray();

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            var pos = path[i];

            if (Array.isArray(pos)) {
                var recentArray = [];
                for (var c in pos) {
                    if (pos.hasOwnProperty(c) == false) continue;
                    var pos2 = pos[c];

                    recentArray.push({lat: pos2.lat(), lng: pos2.lng()});
                }

                arrayOfPaths.push(recentArray);
            } else {
                arrayOfPaths.push ({lat: pos.lat(), lng: pos.lng()});
            }
        }

        return arrayOfPaths;
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisible();
    };

    hooking.prototype.setDraggable = function (draggable) {
        this.object.setDraggable(draggable);
    };

    hooking.prototype.setEditable = function (editable) {
        this.object.setEditable(editable);
    };

    hooking.prototype.setPath = function (pathArray) {
        this.object.setPath(jsMaps.Google.toGooglePath(pathArray));
    };

    hooking.prototype.setPaths = function (pathsArray) {
        this.object.setPaths(jsMaps.Google.toGooglePath(pathsArray));
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.object.setMap(map.object);
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setVisible(visible);
    };

    hooking.prototype.removeLine = function () {
        this.object.setMap(null);
    };

    return new hooking();
};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolygonOptions} parameters
 * @returns jsMaps.PolygonStructure
 */
jsMaps.Google.prototype.polygon = function (map,parameters) {
    var options = {
        clickable: parameters.clickable,
        draggable: parameters.draggable,
        editable: parameters.editable,
        fillColor: parameters.fillColor,
        fillOpacity: parameters.fillOpacity,
        paths: jsMaps.Google.toGooglePath(parameters.paths),
        strokeColor: parameters.strokeColor,
        strokeOpacity: parameters.strokeOpacity,
        strokeWeight: parameters.strokeWeight,
        visible: parameters.visible,
        zIndex: parameters.zIndex
    };

    var Polygon = new google.maps.Polygon(options);
    Polygon.setMap(map.object);

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolygonStructure();

    hooking.prototype.object = Polygon;

    hooking.prototype.getEditable = function () {
        return this.object.getEditable();
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        var path = this.object.getPath().getArray();

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            var pos = path[i];

            arrayOfPaths.push ({lat: pos.lat(), lng: pos.lng()});
        }

        return arrayOfPaths;
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisible();
    };

    hooking.prototype.setDraggable = function (draggable) {
        this.object.setDraggable(draggable);
    };

    hooking.prototype.setEditable = function (editable) {
        this.object.setEditable(editable);
    };

    hooking.prototype.setPath = function (pathArray) {
        this.object.setPath(jsMaps.Google.toGooglePath(pathArray));
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.object.setMap(map.object);
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setVisible(visible);
    };

    hooking.prototype.removePolyGon = function () {
        this.object.setMap(null);
    };

    return new hooking();
};

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
