if (typeof jsMaps.Google == 'undefined') {
    jsMaps.Google = function(mapDomDocument) {};
    jsMaps.Google.prototype = new jsMaps.Abstract();
}

jsMaps.Google.VectorStyle =  function (options) {
    var opts = {};

    if (options.strokeColor != '') {
        opts.strokeColor = options.strokeColor;
        this.options.strokeColor = options.strokeColor;
    }

    if (options.strokeOpacity != '') {
        opts.strokeOpacity = options.strokeOpacity;
        this.options.strokeOpacity = options.strokeOpacity;
    }

    if (options.strokeWeight != '') {
        opts.strokeWeight = options.strokeWeight;
        this.options.strokeWeight = options.strokeWeight;
    }

    if (options.zIndex != '') {
        opts.zIndex = options.zIndex;
        this.options.zIndex = options.zIndex;
    }

    if (options.fillColor != '') {
        opts.fillColor = options.fillColor;
        this.options.fillColor = options.fillColor;
    }

    if (options.fillOpacity != '')  {
        opts.fillOpacity =  options.fillOpacity;
        this.options.fillOpacity = options.fillOpacity;
    }


    this.object.setOptions(opts);
};

jsMaps.Google.VectorGetStyle =  function () {
    var return_values = new jsMaps.VectorStyle();

    if (typeof this.options.fillColor != 'undefined' && typeof this.options.fillOpacity != 'undefined') {
        return_values.fillColor     = this.options.fillColor;
        return_values.fillOpacity   = this.options.fillOpacity;
    }

    return_values.strokeColor   = this.options.strokeColor;
    return_values.strokeOpacity = this.options.strokeOpacity;
    return_values.strokeWeight  = this.options.strokeWeight;
    return_values.zIndex        = this.options.zIndex;

    return return_values;
};


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

    hooking.prototype.getElement = function () {
        return this.object.getDiv();
    };

    /**
     *
     * @param {jsMaps.api.options} options
     */
    hooking.prototype.setOptions = function (options) {
        var opts = {};

        if (typeof options.center != 'undefined' && typeof options.center.latitude != 'undefined' && typeof options.center.longitude != 'undefined') opts.center = new google.maps.LatLng(options.center.latitude, options.center.longitude);
        if (typeof options.zoom != 'undefined') opts.zoom = options.zoom;
        if (typeof options.mouse_scroll != 'undefined') opts.scrollwheel = options.mouse_scroll;
        if (typeof options.zoom_control != 'undefined') opts.zoomControl = options.zoom_control;
        if (typeof options.map_type != 'undefined') opts.mapTypeControl = options.map_type;
        if (typeof options.scale_control != 'undefined') opts.scaleControl = options.scale_control;
        if (typeof options.street_view != 'undefined') opts.streetViewControl = options.street_view;

        this.object.setOptions(opts);
    };

    hooking.prototype.setDraggable = function (flag) {
        this.object.setOptions({draggable: flag});
    };

    hooking.prototype.latLngToPoint = function (lat, lng) {
        // Projection variables.
        var _projection = this.object.getProjection();
        var _topRight = _projection.fromLatLngToPoint(this.object.getBounds().getNorthEast());
        var _bottomLeft = _projection.fromLatLngToPoint(this.object.getBounds().getSouthWest());
        var _scale = Math.pow(2,this.object.getZoom());

        // Create our point.
        var _point = _projection.fromLatLngToPoint(
            new google.maps.LatLng(lat,lng)
        );

        // Get the x/y based on the scale.
        var _posLeft = (_point.x - _bottomLeft.x) * _scale;
        var _posTop = (_point.y - _topRight.y) * _scale;

        return {x:_posLeft,y: _posTop};
    };

    hooking.prototype.pointToLatLng = function (x, y) {
        var point = {x:x,y:y};
        var topRight = this.object.getProjection().fromLatLngToPoint(this.object.getBounds().getNorthEast());
        var bottomLeft = this.object.getProjection().fromLatLngToPoint(this.object.getBounds().getSouthWest());
        var scale = Math.pow(2, this.object.getZoom());
        var worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
        var latLngPosition = this.object.getProjection().fromPointToLatLng(worldPoint);

        return {lat: latLngPosition.lat(),lng: latLngPosition.lng()};
    };

    hooking.prototype.moveXY = function (x, y) {
        this.object.panBy(x*-1,y*-1);
    };

    hooking.prototype.setCenter = function (lat, lng,transition) {
        if (transition == 1) {
            this.object.panTo(new google.maps.LatLng(lat, lng));
        }  else {
            this.object.setCenter(new google.maps.LatLng(lat, lng));
        }
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
    var useFn = function (e) {
        var eventHooking = function() {};
        eventHooking.prototype = new jsMaps.Event(e,event,content);

        eventHooking.prototype.getCursorPosition = function () {
            if (typeof this.eventObject == 'undefined' || typeof this.eventObject.latLng == 'undefined') {
                return {lat: 0, lng: 0};
            }

            var event = this.eventObject.latLng;
            return  {lat: event.lat(), lng: event.lng()};
        };

        fn(new eventHooking);
    };

    if (typeof once != 'undefined' && once == true) {
        return google.maps.event.addListenerOnce(content.object, event, useFn);
    } else {
        return google.maps.event.addListener(content.object,event, useFn);
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
 *
 * @param element
 * @param eventName
 */
jsMaps.Google.prototype.triggerEvent = function (element,eventName) {
    google.maps.event.trigger(element.object, eventName);
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

jsMaps.Google.domMarker  = function (div, args) {
    this.divElem = div;
    this.latlng = args.position;
    this.args = args;
    this.setMap(args.map);
};

jsMaps.Google.domMarker.prototype = new google.maps.OverlayView();

jsMaps.Google.domMarker.prototype.draw = function() {
    var self = this;
    var div = this.div;

    if (!div) {
        div = this.divElem;
        div.className = 'marker';
        div.style.position = 'absolute';
        if (this.args.title != null) div.setAttribute('title',this.args.title);
        div.style.cursor = 'pointer';
        div.style.display = 'inline-block';
        div.draggable = this.args.draggable;

        if (this.args.zIndex != null) div.style.zIndex = this.args.zIndex;

        if (typeof(self.args.marker_id) !== 'undefined') {
            div.dataset.marker_id = self.args.marker_id;
        }

        google.maps.event.addDomListener(div, "click", function(event) {
            google.maps.event.trigger(self, "click");
        });

        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);

        this.div = div;
    }

    var point = this.getProjection().fromLatLngToDivPixel(this.latlng);

    if (point) {
        div.style.left = point.x + 'px';
        div.style.top = point.y + 'px';
    }


    var map = this.getMap();
    var that = this;

    if (this.div.eventAttached != true) {
        this.div.eventAttached = true;
        google.maps.event.addDomListener(map.getDiv(),
            'mouseleave',
            function () {
                google.maps.event.trigger(map.getDiv(), 'mouseup');
            }
        );

        google.maps.event.addDomListener(this.div,
            'mousedown',
            function (e) {
                if (that.div.draggable == false) return;
                this.style.cursor = 'move';
                map.set('draggable', false);
                that.set('origin', e);

                that.moveHandler = google.maps.event.addDomListener(map.getDiv(),
                    'mousemove',
                    function (e) {
                        if (that.div.draggable == false) return;

                        var origin = that.get('origin'),
                            left = origin.clientX - e.clientX,
                            top = origin.clientY - e.clientY,
                            pos = that.getProjection().fromLatLngToDivPixel(that.latlng);

                        if (pos) {
                            var latLng = that.getProjection().fromDivPixelToLatLng(new google.maps.Point(pos.x - left, pos.y - top));


                            that.latlng = latLng;

                            that.set('origin', e);
                            that.set('position', latLng);
                            that.draw();
                        }
                    });
            }
        );

        google.maps.event.addDomListener(map.getDiv(), 'mouseup', function () {
            map.set('draggable', true);
            this.style.cursor = 'default';
            google.maps.event.removeListener(that.moveHandler);
        });
    }
};

jsMaps.Google.domMarker.prototype.remove = function() {
    if (this.div) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
    }
};

jsMaps.Google.domMarker.prototype.getPosition = function() {
    return this.latlng;
};

jsMaps.Google.domMarker.prototype.setPosition = function(latlng) {
    this.latlng = latlng;
    this.remove();
    this.draw();
};

jsMaps.Google.domMarker.prototype.setVisible = function(variable) {
    this.div.style.display = ((variable) ? 'inline-block': 'none');
};

jsMaps.Google.domMarker.prototype.getVisible = function() {
    return ((this.div.style.display == 'inline-block'));
};

jsMaps.Google.domMarker.prototype.getIcon = function () {
    return '';
};

jsMaps.Google.domMarker.prototype.setIcon = function (icon) {
};

jsMaps.Google.domMarker.prototype.getZIndex = function () {
    return this.div.style.zIndex;
};

jsMaps.Google.domMarker.prototype.setZIndex = function (number) {
    this.args.zIndex = number;
    this.div.style.zIndex = number;
};

jsMaps.Google.domMarker.prototype.setDraggable = function (flag) {
    this.div.draggable = flag;
};

/**
 * Generate markers
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.MarkerOptions} parameters
 */
jsMaps.Google.prototype.marker = function (map,parameters) {
    var options = {position:  new google.maps.LatLng(parameters.position.lat, parameters.position.lng),map: map.object};
    if (parameters.title != null) options.title = parameters.title;
    if (parameters.zIndex != null) options.zIndex = parameters.zIndex;
    if (parameters.icon != null) options.icon = parameters.icon;
    if (parameters.draggable != null) options.draggable = parameters.draggable;

    var marker;
    if (parameters.html == null) {
        marker = new google.maps.Marker(options);
    } else {
        marker = new jsMaps.Google.domMarker(parameters.html,options);
    }

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
 * @param {jsMaps.InfoWindowOptions} parameters
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
    hooking.prototype.options = options;

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

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Google.VectorStyle.bind(object);
    object.getStyle = jsMaps.Google.VectorGetStyle.bind(object);

    return object;
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
    hooking.prototype.options = options;

    hooking.prototype.getDraggable = function () {
        return this.object.getDraggable();
    };

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

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Google.VectorStyle.bind(object);
    object.getStyle = jsMaps.Google.VectorGetStyle.bind(object);

    return object;
};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.CircleOptions} parameters
 * @returns jsMaps.CircleStructure
 */
jsMaps.Google.prototype.circle = function (map,parameters) {
    var options = {
        center: parameters.center,
        clickable: parameters.clickable,
        draggable: parameters.draggable,
        editable: parameters.editable,
        fillColor: parameters.fillColor,
        fillOpacity:parameters.fillOpacity,
        map: map.object,
        radius: parameters.radius,
        strokeColor: parameters.strokeColor,
        strokeOpacity: parameters.strokeOpacity,
        strokeWeight:  parameters.strokeWeight,
        visible: parameters.visible,
        zIndex: parameters.zIndex
    };

    var Circle = new google.maps.Circle(options);

    var hooking = function () {};
    hooking.prototype = new jsMaps.CircleStructure();

    hooking.prototype.object = Circle;
    hooking.prototype.options = options;

    hooking.prototype.getBounds = function () {
        return jsMaps.Google.prototype.bounds(this);
    };

    hooking.prototype.getCenter = function () {
        var theCenter = this.object.getCenter();
        return {lat: theCenter.lat(), lng: theCenter.lng()};
    };

    hooking.prototype.getDraggable = function () {
        return this.object.getDraggable();
    };

    hooking.prototype.getEditable = function () {
        return this.object.getEditable();
    };

    hooking.prototype.getRadius = function () {
        return this.object.getRadius();
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisible();
    };

    hooking.prototype.setCenter = function (lat, lng) {
        this.object.setCenter(new google.maps.LatLng(lat, lng));
    };

    hooking.prototype.setDraggable = function (draggable) {
        this.object.setDraggable(draggable);
    };

    hooking.prototype.setEditable = function (editable) {
        this.object.setEditable(editable);
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

    hooking.prototype.setRadius = function (radius) {
        this.object.setRadius(radius);
    };

    hooking.prototype.removeCircle = function () {
        this.object.setMap(null);
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Google.VectorStyle.bind(object);
    object.getStyle = jsMaps.Google.VectorGetStyle.bind(object);

    return object;
};
