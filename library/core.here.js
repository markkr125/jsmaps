jsMaps.Here = function(mapDomDocument) {};
jsMaps.Here.prototype = new jsMaps.Abstract();
jsMaps.Here.MapCenter = {lat: 0,lng: 0};
jsMaps.Here.MapZoom = 0;

/**
 * create the mal
 *
 * @param mapDomDocument
 * @param options
 * @param providerOptions
 * @returns {jsMaps.MapStructure}
 */
jsMaps.Here.prototype.initializeMap = function (mapDomDocument, options, providerOptions) {
    var platform = new H.service.Platform(providerOptions);
    var defaultLayers = platform.createDefaultLayers();

    // Configure panorama with platform credentials:
    if ( options.street_view == true) platform.configure(H.map.render.panorama.RenderEngine);

    var map = new H.Map(mapDomDocument, defaultLayers.normal.map);
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    if (options.mouse_scroll == false) behavior.disable(H.mapevents.Behavior.WHEELZOOM);
    ui.getControl('zoom').setVisibility(options.zoom_control);
    ui.getControl('mapsettings').setVisibility(options.map_type);

    var hooking = function() {};
    hooking.prototype = new jsMaps.MapStructure();

    map.setZoom(options.zoom);
    map.setCenter({lat:options.center.latitude, lng: options.center.longitude});

    jsMaps.Here.MapCenter.lat = options.center.latitude;
    jsMaps.Here.MapCenter.lng = options.center.longitude;
    jsMaps.Here.MapZoom = options.zoom;

    if ( options.street_view == true)  ui.getControl('panorama').setVisibility(options.street_view);

    map.addEventListener('mapviewchangeend', function(evt) {
        jsMaps.Here.MapZoom = this.getZoom();

        var center = this.getCenter();
        jsMaps.Here.MapCenter = {lat: center.lat,lng: center.lng};
    });

    hooking.prototype.object = {map: map,behavior: behavior,ui: ui, mapDomDocument: mapDomDocument};

    hooking.prototype.getCenter = function () {
        return {lat: jsMaps.Here.MapCenter.lat, lng: jsMaps.Here.MapCenter.lng};
    };

    hooking.prototype.setCenter = function (lat, lng) {
        jsMaps.Here.MapCenter = {lat: lat,lng: lng};
        this.object.map.setCenter ({lat:lat, lng: lng});
    };

    hooking.prototype.getBounds = function () {
        return jsMaps.Here.prototype.bounds(this.object);
    };

    hooking.prototype.getZoom = function () {
        return jsMaps.Here.MapZoom;
    };

    hooking.prototype.setZoom = function (number) {
        jsMaps.Here.MapZoom = number;
        this.object.map.setZoom (number);
    };

    /**
     *
     * @param {jsMaps.BoundsStructure} bounds
     */
    hooking.prototype.fitBounds = function (bounds) {
        var boundsObj = bounds.bounds.getBounds();

        this.object.map.setViewBounds(boundsObj);
    };

    return new hooking();
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
jsMaps.Here.prototype.attachEvent = function (content,event,fn,once) {
    var eventTranslation = '';

    if (event == jsMaps.api.supported_events.bounds_changed || event == jsMaps.api.supported_events.center_changed) eventTranslation = 'mapviewchange';
    if (event == jsMaps.api.supported_events.click) eventTranslation = 'tap';
    if (event == jsMaps.api.supported_events.dblclick) eventTranslation = 'dbltap';
    if (event == jsMaps.api.supported_events.dragend) eventTranslation = 'dragend';
    if (event == jsMaps.api.supported_events.dragstart) eventTranslation = 'dragstart';
    if (event == jsMaps.api.supported_events.idle) eventTranslation = 'mapviewchangeend';
    if (event == jsMaps.api.supported_events.maptypeid_changed) eventTranslation = 'baselayerchange';
    if (event == jsMaps.api.supported_events.mousemove) eventTranslation = 'pointermove';
    if (event == jsMaps.api.supported_events.mouseout) eventTranslation = 'pointerleave';
    if (event == jsMaps.api.supported_events.mouseover) eventTranslation = 'pointerenter';
    if (event == jsMaps.api.supported_events.rightclick) eventTranslation = 'contextmenu';
    if (event == jsMaps.api.supported_events.tilesloaded || event == jsMaps.api.supported_events.zoom_changed) eventTranslation = 'mapviewchangeend';
    if (event == jsMaps.api.supported_events.tilt_changed) eventTranslation = 'enginechange';
    if (event == jsMaps.api.supported_events.domready) eventTranslation = 'statechange';

    if (event == jsMaps.api.additional_events.position_changed) eventTranslation = 'dragend';
    if (event == jsMaps.api.additional_events.mouseup) eventTranslation = 'pointerup';
    if (event == jsMaps.api.additional_events.mousedown) eventTranslation = 'pointerdown';
    if (event == jsMaps.api.additional_events.icon_changed) eventTranslation = 'visibilitychange';

    var obj = content.object;
    if (typeof obj.map != 'undefined') obj = obj.map;

    // Marker icon change
    /*if (event == jsMaps.api.additional_events.icon_changed) {

        var element = content;
        if (typeof content.mapDomDocument !='undefined') {
            element = content.mapDomDocument;
        }

        jsMaps.addEventListener(element,jsMaps.api.supported_events.icon_changed, function () {
            if (once == true) {
                jsMaps.removeEventListener(element, jsMaps.api.supported_events.icon_changed, function () {});
            }

            fn();
        });

        return {eventObjCustom: element, eventName: event};
    }*/

    if (typeof once != 'undefined' && once == true) {
        if (typeof obj.onceEventListener == "function") {
            obj.onceEventListener (eventTranslation, fn);
            return {eventObj: content, eventName: jsMaps.api.supported_events.icon_changed};
        }

        var event1=function (evt) {
            obj.removeEventListener(eventTranslation, event1);

            fn();
        };

        obj.addEventListener(eventTranslation, event1, false);
        return {eventObj: content, eventName: event};
    } else {
        obj.addEventListener(eventTranslation, fn, false);
        return {eventObj: content, eventName: event};
    }
};

/**
 *
 * @param map
 * @param eventObject
 * @returns {*}
 */
jsMaps.Here.prototype.removeEvent = function (map,eventObject) {
    if (eventObject.eventObjCustom != 'undefined') {
        jsMaps.removeEventListener(eventObject.eventObjCustom, eventObject.eventName, function () {});
        return;
    }

    var obj = map.object;
    if (typeof obj.map != 'undefined') obj = obj.map;

    obj.removeEventListener(eventObject.eventName, function () {});
};


/**
 * Bounds object
 *
 * @param mapObject
 * @returns hooking
 */
jsMaps.Here.prototype.bounds = function (mapObject) {
    var bounds;
    if (typeof mapObject != 'undefined') {
        if (typeof mapObject.object != 'undefined')  mapObject = mapObject.object;

        var boundsArray = mapObject.map.getViewBounds();

        var topLeft = boundsArray.getTopLeft();
        var center = boundsArray.getCenter();
        var bottomRight = boundsArray.getBottomRight();

        bounds = new H.geo.Strip();
        bounds.pushLatLngAlt(topLeft.lat,topLeft.lng);
        bounds.pushLatLngAlt(center.lat,center.lng);
        bounds.pushLatLngAlt(bottomRight.lat,bottomRight.lng);
    } else {
        bounds = new H.geo.Strip();
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.BoundsStructure();

    hooking.prototype.bounds = bounds;

    hooking.prototype.addLatLng = function (lat, lng) {
        this.bounds.pushLatLngAlt(lat, lng);
    };

    hooking.prototype.getCenter = function () {
        var center = this.bounds.getBounds().getCenter();
        return {lat: center.lat, lng: center.lng};
    };

    hooking.prototype.getTopLeft = function () {
        var topLeft = this.bounds.getBounds().getTopLeft();
        return {lat: topLeft.lat, lng: topLeft.lng};
    };

    hooking.prototype.getBottomRight = function () {
        var bottomRight = this.bounds.getBounds().getBottomRight();
        return {lat: bottomRight.lat, lng: bottomRight.lng};
    };

    return new hooking();
};

jsMaps.Here.DraggableMarker = function (obj,behavior) {
    // disable the default draggability of the underlying map
    // when starting to drag a marker object:
    obj.addEventListener('dragstart', function (ev) {
        var target = ev.target;
        if (target instanceof H.map.Marker) {
            behavior.disable();
        }
    }, false);


    // re-enable the default draggability of the underlying map
    // when dragging has completed
    obj.addEventListener('dragend', function (ev) {
        var target = ev.target;
        if (target instanceof mapsjs.map.Marker) {
            behavior.enable();
        }
    }, false);

    // Listen to the drag event and move the position of the marker
    // as necessary
    obj.addEventListener('drag', function (ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof mapsjs.map.Marker) {
            var pos = obj.screenToGeo(pointer.viewportX, pointer.viewportY);

            target.setPosition(pos);
        }


    }, false);
};


/**
 * Generate markers
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.markerOptions} parameters
 */
jsMaps.Here.prototype.marker = function (map,parameters) {

    var marker = new H.map.Marker({lat:parameters.position.lat, lng:  parameters.position.lng});
    if (parameters.draggable != null) marker.draggable = parameters.draggable;
    if (parameters.icon != null) {
        var yourMarker  =  parameters.icon;
        var icon = new H.map.Icon(yourMarker);

        marker.setIcon(icon);
    }

    if (parameters.zIndex != null) marker.setZIndex(parameters.zIndex);

    var obj = map.object.map;
    var behavior = map.object.behavior;

    obj.addObject(marker);

    if (parameters.draggable != null) {
        marker.setData(true);
        jsMaps.Here.DraggableMarker(obj,behavior);
    } else {
        marker.setData(false);
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.MarkerStructure();

    hooking.prototype.object = marker;
    hooking.prototype.mapDomDocument = map.object.mapDomDocument;

    /**
     *
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.getPosition = function () {
        var pos = this.object.getPosition();
        return {lat: pos.lat, lng: pos.lng}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        var evt = new H.util.Event('dragend');

        this.object.dispatchEvent(evt);
        this.object.setPosition({lat: lat, lng: lng});
    };

    hooking.prototype.getIcon = function () {
        return marker.getIcon();
    };

    hooking.prototype.setIcon = function (icon) {
        this.object.dispatchEvent('visibilitychange');
        this.object.setIcon(new H.map.Icon(icon));
    };

    hooking.prototype.getZIndex = function () {
        return this.object.getZIndex();
    };

    hooking.prototype.setZIndex = function (number) {
        this.object.setZIndex(number);
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisibility();
    };

    hooking.prototype.setVisible = function (variable) {
        return this.object.setVisibility(variable);
    };

    hooking.prototype.setDraggable = function (flag) {
        var hasDragEvent = this.object.getData();

        if (flag == true && hasDragEvent == false) {
            this.object.setData(true);
            jsMaps.Here.DraggableMarker(obj,behavior);
        }

        this.object.draggable = flag;
    };

    hooking.prototype.remove = function () {
        obj.removeObject(this.object);
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
jsMaps.Here.prototype.infoWindow = function (parameters) {

    var infoWindow = new H.ui.InfoBubble({lat: 0,lng: 0});
    infoWindow.setContent(parameters.content);

    if (parameters.position != null) {
        infoWindow.setData({lat: parameters.position.lat,lng: parameters.position.lng});
        infoWindow.setPosition({lat: parameters.position.lat,lng: parameters.position.lng});
    } else {
        infoWindow.setData({lat: 0,lng: 0});
        infoWindow.setPosition({lat: 0,lng: 0});
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.InfoWindowStructure();

    hooking.prototype.object = infoWindow;

    hooking.prototype.getPosition = function () {
        var pos = this.object.getData();
        return {lat: pos.lat, lng: pos.lng}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        this.object.setData({lat: lat,lng: lng});
        this.object.setPosition({lat: lat,lng: lng});
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
        var pos = marker.getPosition();
        this.object.setData({lat: pos.lat,lng: pos.lng});
        this.object.setPosition({lat: pos.lat,lng: pos.lng});

        map.object.ui.addBubble(this.object);

        this.object.open();
    };

    hooking.prototype.setContent = function (content) {
        this.object.setContent(content);
    };

    return new hooking();
};

jsMaps.Here.ReturnStrip = function (path) {
    var strip = new H.geo.Strip();

    if (typeof path == 'undefined' || path == []) return [];

    for (var i in path) {
        if (path.hasOwnProperty(i) == false) continue;

        if (Array.isArray(path[i])) {
            var recentArray = [];
            for (var c in path[i]) {
                if (path[i].hasOwnProperty(c) == false) continue;
                strip.pushLatLngAlt(path[i][c].lat, path[i][c].lng);
            }
        } else {
            strip.pushLatLngAlt(path[i].lat,path[i].lng);
        }
    }

    return strip;
};


jsMaps.Here.DraggablePolylineMarker = function (obj,behavior) {
    // disable the default draggability of the underlying map
    // when starting to drag a marker object:
    obj.addEventListener('dragstart', function (ev) {
        var target = ev.target;
        if (target instanceof H.map.Marker) {
            var data = target.getData();

            if (typeof data.line!='undefined') {
                behavior.disable();
            }
        }
    }, false);


    // re-enable the default draggability of the underlying map
    // when dragging has completed
    obj.addEventListener('dragend', function (ev) {
        var target = ev.target;
        if (target instanceof mapsjs.map.Marker) {
            behavior.enable();

            var data = target.getData();

            if (typeof data.line!='undefined') {
                behavior.enable();
            }
        }
    }, false);

    // Listen to the drag event and move the position of the marker
    // as necessary
    obj.addEventListener('drag', function (ev) {

        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof mapsjs.map.Marker) {

            var data = target.getData();
            if (typeof data.line!='undefined') {
                var pos = obj.screenToGeo(pointer.viewportX, pointer.viewportY);

                target.setPosition(pos);

                var old_pos = data['pos'];

                var arrayOfPaths = [];
                var path = data['line'].getStrip();

                var eachFn = function(lat, lng, alt, idx) {
                    if (lat == old_pos.lat && lng ==old_pos.lng) {
                        lat = pos.lat;
                        lng = pos.lng;
                    }

                    arrayOfPaths.push ({lat: lat, lng: lng});
                };

                path.eachLatLngAlt(eachFn);
                data['line'].setStrip(jsMaps.Here.ReturnStrip(arrayOfPaths));
                data['pos'] = pos;
                target.setData(data);
            }
        }


    }, false);
};

jsMaps.Here.EditPolyLine = function (path,PolyLine,obj,behavior) {
    var markers = [];

    for (var i in path) {
        if (path.hasOwnProperty(i) == false) continue;

        var marker =  new H.map.Marker({lat:path[i].lat, lng:  path[i].lng});
        marker.setData({line: PolyLine,pos: {lat:path[i].lat, lng:  path[i].lng}});
        marker.draggable = true;

        obj.addObject(marker);

        jsMaps.Here.DraggablePolylineMarker(obj,behavior);

        markers.push(marker);
    }

    return markers;
};

/**
 * Create PolyLine
 *
 * draggable is not supported
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolyLineOptions} parameters
 * @returns jsMaps.PolyLineStructure
 */
jsMaps.Here.prototype.polyLine = function (map,parameters) {
    var options = {
        zIndex: parameters.zIndex,
        visibility: parameters.visible,
        style: { lineWidth: parameters.strokeWeight, strokeColor: parameters.strokeColor }
    };

    var PolyLine = new H.map.Polyline(jsMaps.Here.ReturnStrip(parameters.path), options);

    var obj = map.object.map;
    var behavior = map.object.behavior;

    obj.addObject(PolyLine);

    var markers = undefined;

    if (parameters.editable != null && parameters.editable == true) {
        PolyLine.setData({'editEvent':true});
        markers = jsMaps.Here.EditPolyLine(parameters.path,PolyLine,obj,behavior);
    } else {
        PolyLine.setData({'editEvent':false});
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolygonStructure();

    hooking.prototype.object = PolyLine;

    hooking.prototype.getEditable = function () {
        return this.object.getEditable();
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        var path = this.object.getStrip();


        var eachFn = function(lat, lng, alt, idx) {
            arrayOfPaths.push ({lat: lat, lng: lng});
        };

        path.eachLatLngAlt(eachFn);

        return arrayOfPaths;
    };

    hooking.prototype.getPaths = function () {
        return hooking.prototype.getPath();
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisibility();
    };

    hooking.prototype.setDraggable = function (draggable) {
       // Not supported
    };

    hooking.prototype.setEditable = function (editable) {
        if (editable == true){
            if (typeof markers == 'undefined') {
                this.object.setData({'editEvent':true});
                markers = jsMaps.Here.EditPolyLine(this.getPath(),this.object,obj,behavior);
            }
        }
        else {
            this.object.setData({'editEvent':false});

            if (typeof markers!='undefined' && markers.length > 0) {
                for (var o in markers) {
                    if (markers.hasOwnProperty(o) == false) continue;
                    obj.removeObject(markers[o]);
                }

                markers = undefined;
            }
        }
    };

    hooking.prototype.setPath = function (pathArray) {
        this.object.setStrip(jsMaps.Here.ReturnStrip(pathArray));
    };

    hooking.prototype.setPaths = function (pathsArray) {
        hooking.prototype.setPath(pathsArray);
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        var originMap =this.object.getRootGroup();

        if (typeof markers!='undefined' && markers.length > 0) {
            for (var o in markers) {
                if (markers.hasOwnProperty(o) == false) continue;
                originMap.removeObject(markers[o]);
                map.object.map.addObject(markers[o]);
            }
        }

        originMap.removeObject(this.object);
        map.object.map.addObject(this.object);
    };

    hooking.prototype.setVisible = function (visible) {
        if (typeof markers!='undefined' && markers.length > 0) {
            for (var o in markers) {
                if (markers.hasOwnProperty(o) == false) continue;
                markers[o].setVisibility(visible);
            }
        }

        this.object.setVisibility(visible);
    };

    hooking.prototype.removeLine = function () {
        var mapObjectTmp = this.object.getRootGroup();

        if (typeof markers!='undefined' && markers.length > 0) {
            for (var o in markers) {
                if (markers.hasOwnProperty(o) == false) continue;
                mapObjectTmp.removeObject(markers[o]);
            }

            markers = undefined;
        }

        mapObjectTmp.removeObject(this.object);
    };

    return new hooking();
};

