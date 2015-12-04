if (typeof jsMaps.Bing == 'undefined') {
    jsMaps.Bing = function(mapDomDocument) {};
    jsMaps.Bing.prototype = new jsMaps.Abstract();
}

/**
 * create the map
 *
 * @param mapDomDocument
 * @param options
 * @param providerOptions
 * @returns {jsMaps.MapStructure}
 */
jsMaps.Bing.prototype.initializeMap = function (mapDomDocument, options, providerOptions) {
    var myOptions = {
        credentials: jsMaps.config.bing.key,
        zoom: options.zoom,
        center: new Microsoft.Maps.Location(options.center.latitude, options.center.longitude),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        showMapTypeSelector: options.map_type,
        showScalebar: options.scale_control,
        disablePanning: false
    };

    // Currently there is no other way
    if (options.zoom_control == false) {
        var html = '<style type="text/css">.NavBar_zoomControlContainer .NavBar_zoomOut, .NavBar_zoomControlContainer .NavBar_zoomIn{display: none;} </style>';
        var e = document.createElement('p');
        e.innerHTML = html;

        document.body.insertBefore(e, document.body.childNodes[0]);
    }

    if (typeof providerOptions != 'undefined') {
        myOptions = jsMaps.merge(myOptions,providerOptions);
    }

    var map = new Microsoft.Maps.Map(mapDomDocument, myOptions);

    // no other way to stop the scroll zoom
    if (options.mouse_scroll == false) {
        Microsoft.Maps.Events.addHandler(map, 'mousewheel', function(e) {
            e.handled = true;
            return true;
        });
    }
    var hooking = function() {};
    hooking.prototype.bounds = null;


    hooking.prototype = new jsMaps.MapStructure();
    hooking.prototype.__className = 'MapStructure';
    hooking.prototype.object = map;
    hooking.prototype.draggable = true;

    hooking.prototype.getCenter = function () {
        var center = this.object.getCenter();
        return {lat:center.latitude, lng: center.longitude};
    };

    hooking.prototype.setDraggable = function (flag) {
        this.object.setOptions({disablePanning: !flag});
    };

    hooking.prototype.latLngToPoint = function (lat, lng) {
        var xy = this.object.tryLocationToPixel(new Microsoft.Maps.Location(lat, lng),Microsoft.Maps.PixelReference.control);
        return {x: xy.x,y: xy.y}
    };

    hooking.prototype.pointToLatLng = function (x, y) {
        var pos = this.object.tryPixelToLocation(new Microsoft.Maps.Point(x, y),Microsoft.Maps.PixelReference.control);
        return {lat:pos.latitude,lng:pos.longitude};
    };

    hooking.prototype.setCenter = function (lat, lng) {
        var mapOptions = this.object.getOptions();
        mapOptions.center = new Microsoft.Maps.Location(lat, lng);

        this.object.setView(mapOptions);
    };

    hooking.prototype.getZoom = function () {
        return this.object.getZoom();
    };

    hooking.prototype.setZoom = function (number) {
        var mapOptions = this.object.getOptions();
        mapOptions.zoom = number;

        this.object.setView(mapOptions);
    };

    hooking.prototype.getBounds = function () {
        return jsMaps.Bing.prototype.bounds(this.object);
    };

    /**
     *
     * @param {jsMaps.BoundsStructure} bounds
     */
    hooking.prototype.fitBounds = function (bounds) {
        bounds.noData();
        var mapOptions = this.object.getOptions();
        mapOptions.bounds = bounds.bounds;

        return this.object.setView(mapOptions);
    };

    return new hooking();
};

jsMaps.Bing.eventTranslation = function (content,event) {
    var eventTranslation = '';

    if (content.__className == 'MapStructure') {
        if (event == jsMaps.api.supported_events.bounds_changed || event == jsMaps.api.supported_events.center_changed) eventTranslation = 'targetviewchanged';
        if (event == jsMaps.api.supported_events.click) eventTranslation = 'click';
        if (event == jsMaps.api.supported_events.dblclick) eventTranslation = 'dblclick';
        if (event == jsMaps.api.supported_events.dragend) eventTranslation = 'viewchangeend';
        if (event == jsMaps.api.supported_events.dragstart) eventTranslation = 'viewchangestart';
        if (event == jsMaps.api.supported_events.drag) eventTranslation = 'viewchange';
        if (event == jsMaps.api.supported_events.idle) eventTranslation = 'tiledownloadcomplete';
        if (event == jsMaps.api.supported_events.maptypeid_changed) eventTranslation = 'maptypechanged';
        if (event == jsMaps.api.supported_events.mousemove) eventTranslation = 'mousemove';
        if (event == jsMaps.api.supported_events.mouseout) eventTranslation = 'mouseout';
        if (event == jsMaps.api.supported_events.mouseover) eventTranslation = 'mouseover';
        if (event == jsMaps.api.supported_events.rightclick) eventTranslation = 'rightclick';
        if (event == jsMaps.api.supported_events.tilesloaded|| event == jsMaps.api.supported_events.zoom_changed) eventTranslation = 'tiledownloadcomplete';
        if (event == jsMaps.api.supported_events.tilt_changed) eventTranslation = 'imagerychanged';
        if (event == jsMaps.api.supported_events.domready) eventTranslation = 'tiledownloadcomplete';
        if (event == jsMaps.api.additional_events.mouseup) eventTranslation = 'mouseup';
        if (event == jsMaps.api.additional_events.mousedown) eventTranslation = 'mousedown';

        if (event == jsMaps.api.additional_events.position_changed) eventTranslation = 'dragend';
        if (event == jsMaps.api.additional_events.icon_changed) eventTranslation = 'entitychanged';
    } else {
        if (event == jsMaps.api.supported_events.click) eventTranslation = 'click';
        if (event == jsMaps.api.supported_events.dblclick) eventTranslation = 'dblclick';
        if (event == jsMaps.api.supported_events.drag)  eventTranslation = 'drag';
        if (event == jsMaps.api.supported_events.dragend) eventTranslation = 'dragend';
        if (event == jsMaps.api.supported_events.dragstart) eventTranslation = 'dragstart';
        if (event == jsMaps.api.additional_events.position_changed) eventTranslation = 'dragend';
        if (event == jsMaps.api.additional_events.icon_changed) eventTranslation = 'entitychanged';
        if (event == jsMaps.api.additional_events.mousedown)  eventTranslation = 'mousedown';
        if (event == jsMaps.api.supported_events.mouseout)  eventTranslation = 'mouseout';
        if (event == jsMaps.api.supported_events.mouseover)  eventTranslation = 'mouseover';
        if (event == jsMaps.api.supported_events.mouseup) eventTranslation = 'mouseup';
        if (event == jsMaps.api.additional_events.rightclick) eventTranslation = 'rightclick';
    }

    return eventTranslation;
};

jsMaps.Bing.prototype.attachEvent = function (content,event,functionToExecute,once) {
    var eventTranslation = jsMaps.Bing.eventTranslation(content,event);
    var functionToRun = functionToExecute;


    if (content.__className == 'MapStructure' && event == jsMaps.api.supported_events.zoom_changed) {
       var localZoom = content.object.getZoom();
        functionToRun = function (event) {

             if(localZoom != content.object.getZoom()){
                 localZoom = content.object.getZoom();

                 functionToExecute(event);
            }
        }
    }

    var fn = functionToRun;

    if (eventTranslation == 'click') {
        fn = function (event) {
            if (typeof content.object.clickable != 'undefined' && content.object.clickable == false) {
                return;
            }

            functionToRun(event);
        }
    }

    var useFn = function (e) {
        var eventHooking = function() {};
        eventHooking.prototype = new jsMaps.Event(e,event,content);

        eventHooking.prototype.getCursorPosition = function () {
            var latLng = e.target.tryPixelToLocation(new Microsoft.Maps.Point(e.getX(), e.getY()));

            return  {lat: latLng.latitude, lng: latLng.longitude};
        };

        fn(new eventHooking);
    };

    if (once) {
        var lister = Microsoft.Maps.Events.addThrottledHandler(content.object,eventTranslation,function (event) {
            Microsoft.Maps.Events.removeHandler(lister);
            useFn(event);
        });

        return;
    }

    return Microsoft.Maps.Events.addThrottledHandler(content.object,eventTranslation, useFn);
};

/**
 *
 * @param obj
 * @param eventObject
 * @returns {*}
 */
jsMaps.Bing.prototype.removeEvent = function (obj,eventObject) {
    Microsoft.Maps.Events.removeHandler(eventObject);
};


/**
 *
 * @param element
 * @param eventName
 */
jsMaps.Bing.prototype.triggerEvent = function (element,eventName) {
    var eventTranslation = jsMaps.Bing.eventTranslation(element,eventName);

    var dispatchOn = element.object;
    Microsoft.Maps.Events.invoke(dispatchOn,eventTranslation);
};


/**
 *
 * @param map
 * @param eventObject
 * @returns {*}
 */
jsMaps.Bing.prototype.removeEvent = function (map,eventObject) {
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
jsMaps.Bing.prototype.bounds = function (mapObject) {
    var bounds;
    if (typeof mapObject != 'undefined') {
        if (typeof mapObject.object != 'undefined') {
            bounds = mapObject.object.getBounds();
        }else if (typeof mapObject.getNorthwest != 'undefined') {
            bounds = mapObject;
        } else {
            bounds = mapObject.getBounds();
        }
    } else {
        bounds = new Microsoft.Maps.LocationRect;
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.BoundsStructure();

    hooking.prototype.bounds = bounds;
    hooking.prototype.nothing = (typeof mapObject == 'undefined');
    hooking.prototype.arrayPath = [];

    hooking.prototype.noData = function () {
        if (this.nothing == true) {
            this.bounds = Microsoft.Maps.LocationRect.fromLocations(this.arrayPath);
            this.nothing = false;
        }
    };

    hooking.prototype.addLatLng = function (lat, lng) {
        this.arrayPath.push(new Microsoft.Maps.Location(lat, lng));
    };

    hooking.prototype.getCenter = function () {
        this.noData();
        return {lat: this.bounds.center.latitude, lng: this.bounds.center.longitude};
    };

    hooking.prototype.getTopLeft = function () {
        this.noData();

        var topLeft = this.bounds.getNorthwest();
        return {lat: topLeft.latitude, lng: topLeft.longitude};
    };

    hooking.prototype.getBottomRight = function () {
        this.noData();

        var bottomRight = this.bounds.getSoutheast();
        return {lat: bottomRight.latitude, lng: bottomRight.longitude};
    };

    return new hooking();
};

/**
 * Generate markers
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.MarkerOptions} parameters
 */
jsMaps.Bing.prototype.marker = function (map,parameters) {
    var options = {width: 'auto'};
   // if (parameters.title != null) options.text = parameters.title;
    if (parameters.zIndex != null) options.zIndex = parameters.zIndex;
    if (parameters.icon != null) options.icon = parameters.icon;
    if (parameters.draggable != null) options.draggable = parameters.draggable;

    map = map.object;

    var marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(parameters.position.lat, parameters.position.lng), options);
    map.entities.push(marker);

    var hooking = function () {};
    hooking.prototype = new jsMaps.MarkerStructure();

    hooking.prototype.object = marker;
    hooking.prototype.map = map;

    /**
     *
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.getPosition = function () {
        var pos = this.object.getLocation();
        return {lat: pos.latitude, lng: pos.longitude}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        this.object.setLocation(new Microsoft.Maps.Location(lat, lng));
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisible();
    };

    hooking.prototype.setVisible = function (variable) {
        this.object.setOptions({visible:variable});
    };

    hooking.prototype.getIcon = function () {
        return marker.getIcon();
    };

    hooking.prototype.setIcon = function (icon) {
        this.object.setOptions({icon:icon});
    };

    hooking.prototype.getZIndex = function () {
        return this.object.getZIndex();
    };

    hooking.prototype.setZIndex = function (number) {
        this.object.setOptions({zIndex:number});
    };

    hooking.prototype.setDraggable = function (flag) {
        this.object.setOptions({draggable:flag});
    };

    hooking.prototype.remove = function () {
        this.map.entities.remove(this.object)
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
jsMaps.Bing.prototype.infoWindow = function (parameters) {
    function strip(html)
    {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }


    var options = {description: "<div style=\"width: autoit; height: "+parameters.content.length*0.9+"px; overflow: auto; margin-top:10px;\">"+parameters.content+"</div>",width: parameters.content.length*1.4.length*0.9,height: parameters.content.length*0.9};
    var position = {lat:0,lng: 0};

    if (parameters.position != null) {
        position = {lat:parameters.position.lat,lng: parameters.position.lng};
    }

    var infoWindow = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(position.lat,position.lng), options);

    var hooking = function () {};
    hooking.prototype = new jsMaps.InfoWindowStructure();

    hooking.prototype.object = infoWindow;

    hooking.prototype.getPosition = function () {
        var pos = this.object.getLocation();
        return {lat: pos.latitude, lng: pos.longitude}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        this.object.setLocation(new Microsoft.Maps.Location(lat, lng));
    };

    hooking.prototype.close = function () {
        this.object.setOptions({visible:false});
    };

    /**
     *
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.MarkerStructure} marker
     */
    hooking.prototype.open = function(map,marker) {
        var pos = marker.getPosition();
        this.object.setOptions({visible:true});

        this.object.setOptions({offset: marker.object.getAnchor() });
        this.object.setLocation(new Microsoft.Maps.Location(pos.lat, pos.lng));
        map.object.entities.push(this.object);

    };

    hooking.prototype.setContent = function (content) {
        this.object.setOptions({description:content});
    };

    return new hooking();
};

jsMaps.Bing.toBingPath =  function (path,isPolyGon) {
    if (typeof path == 'undefined' || path == []) return [];

    var newPath = [];

    for (var i in path) {
        if (path.hasOwnProperty(i) == false) continue;

        if (Array.isArray(path[i])) {
            var recentArray = [];
            for (var c in path[i]) {
                if (path[i].hasOwnProperty(c) == false) continue;
                newPath.push(new Microsoft.Maps.Location(path[i][c].lat, path[i][c].lng));
            }
        } else {
            newPath.push(new Microsoft.Maps.Location(path[i].lat, path[i].lng));
        }
    }

    if (isPolyGon == true) {
        var pathLength = newPath.length;

        if (pathLength % 2 === 0 || pathLength % 3 === 0) {
            var last = newPath[pathLength-1];

            if (last.latitude != newPath[0].latitude && last.longitude != newPath[0].longitude ) {
                newPath.push(newPath[0]);
            }
        }
    }

    return newPath;
};

jsMaps.Bing.EditableLines = function (polyObject,isPolygon,Locations) {
    var EditableHandleLayer = new Microsoft.Maps.EntityCollection({ visible: false });

    var points = (typeof Locations != 'undefined' && Locations.length > 0) ? Locations : polyObject.getLocations();
    var pointIndex = null;
    var polylineMask = null;

    // Start Dragging
    function StartDragHandler(e) {
        var handleLocation = e.entity.getLocation();

        // Determine point index
        for (i = 0; i <= (points.length - 1); i++) {
            if (handleLocation == points[i]) {
                pointIndex = i;
                break;
            }
        }
    }

    // Dragging
    function DragHandler(e) {
        var currentPoint = e.entity.getLocation();
        var replacePoint = e.entity.replacePoint;

        for (var i in points) {
            if (points.hasOwnProperty(i) == false) continue;

            var pt = points[i];

            if (replacePoint.latitude == pt.latitude && replacePoint.longitude == pt.longitude) {
                points[i] = currentPoint;
                e.entity.replacePoint = currentPoint;
            }
        }

        //points[pointIndex] = e.entity.getLocation();
        polylineMask.setOptions({visible: true});
        polylineMask.setLocations(points);
    }

    // End Dragging
    function EndDragHandler(e) {
        polylineMask.setOptions({visible:false});
        polyObject.setLocations(points);
    }

    var polylineMaskStrokeColor = new Microsoft.Maps.Color(200, 100, 100, 100);
    polylineMask = new Microsoft.Maps.Polyline(points, {visible: false, strokeColor: polylineMaskStrokeColor, strokeThickness: 2, strokeDashArray: '2 2' });

    EditableHandleLayer.push(polylineMask);

    var lenOffset = 1;
    if (isPolygon) lenOffset = 2;

    for (i = 0; i <= (points.length - lenOffset); i++) {
        var dragHandle = new Microsoft.Maps.Pushpin(points[i], { draggable:true});

        dragHandle.replacePoint = points[i];

        Microsoft.Maps.Events.addHandler(dragHandle, 'dragstart', StartDragHandler);
        Microsoft.Maps.Events.addHandler(dragHandle, 'drag', DragHandler);
        Microsoft.Maps.Events.addHandler(dragHandle, 'dragend', EndDragHandler);

        EditableHandleLayer.push(dragHandle);
    }

    return EditableHandleLayer;
};

/**
 * Create PolyLine
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolyLineOptions} parameters
 * @returns jsMaps.PolyLineStructure
 */
jsMaps.Bing.prototype.polyLine = function (map,parameters) {

    /**
     * @type {{red: r, greed: g, blue: b,opacity: opacity}}
     */
    var color = jsMaps.convertHex(parameters.strokeColor,parameters.strokeOpacity*100,true);

    var options = {strokeColor: new Microsoft.Maps.Color((255*color.opacity),color.red,color.greed,color.blue), strokeThickness: parameters.strokeWeight};
    var PolyLine = new Microsoft.Maps.Polyline(jsMaps.Bing.toBingPath(parameters.path),options);
    PolyLine.clickable = parameters.clickable;

    // Add the polyline to the map
    map.object.entities.push(PolyLine);

    var EditHandleLayer = jsMaps.Bing.EditableLines(PolyLine);
    EditHandleLayer.setOptions({ visible: parameters.editable });

    map.object.entities.push(EditHandleLayer);

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolyLineStructure();

    hooking.prototype.object = PolyLine;
    hooking.prototype.EditHandleLayer = EditHandleLayer;
    hooking.prototype.mapObject = map.object;

    hooking.prototype.getEditable = function () {
        return this.EditHandleLayer.getVisible();
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        var points = this.object.getLocations();

        for (i = 0; i <= (points.length - 1); i++) {
            arrayOfPaths.push ({lat: points[i].latitude, lng: points[i].longitude});
        }

        return arrayOfPaths;
    };

    hooking.prototype.getPaths = function () {
        return hooking.prototype.getPath();
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisible();
    };

    hooking.prototype.setDraggable = function (draggable) {
        // Not supported
    };

    hooking.prototype.setEditable = function (editable) {
        this.EditHandleLayer.setOptions({ visible: editable });
    };

    hooking.prototype.setPath = function (pathArray) {
        this.object.setLocations(jsMaps.Bing.toBingPath(pathArray));

        var isEditable = this.getEditable();


        this.mapObject.entities.remove(this.EditHandleLayer);
        this.EditHandleLayer = jsMaps.Bing.EditableLines(this.object);
        this.EditHandleLayer.setOptions({ visible: isEditable });

        this.mapObject.entities.push(this.EditHandleLayer);
    };

    hooking.prototype.setPaths = function (pathsArray) {
        this.object.setLocations(jsMaps.Bing.toBingPath(pathsArray));
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.mapObject.entities.remove(this.object);
        this.mapObject.entities.remove(this.EditHandleLayer);

        map.entities.push(this.object);
        map.entities.push(this.EditHandleLayer);

        this.mapObject = map;
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setOptions({visible:visible});
    };

    hooking.prototype.removeLine = function () {
        this.mapObject.entities.remove(this.object);
        this.mapObject.entities.remove(this.EditHandleLayer);
    };

    return new hooking();
};

jsMaps.Bing.EditablePolygon = function (Polygon) {
    var currLocations = Polygon.getLocations();
    var Locations = [];
    var ln = currLocations.length;

    for (var n in currLocations) {
        if (currLocations.hasOwnProperty(n) == false) continue;

        var testPath = [currLocations[n],currLocations[parseInt(n)+1]];
        var abort = 0;

        for (var p in testPath) {
            if (testPath.hasOwnProperty(p) == false) continue;

            if (typeof testPath[p] == 'undefined') {
                abort = 1;
            } else {
                testPath[p] = {lat: testPath[p].latitude, lng: testPath[p].longitude};
            }
        }

        if ( abort != 1) {
            Locations.push(currLocations[n]);

            var viewRect = Microsoft.Maps.LocationRect.fromLocations([new Microsoft.Maps.Location(testPath[0].lat, testPath[0].lng), new Microsoft.Maps.Location(testPath[1].lat, testPath[1].lng)]);
            Locations.push(viewRect.center);
        }else {
            Locations.push(currLocations[n]);
        }
    }

    return Locations;
};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolygonOptions} parameters
 * @returns jsMaps.PolygonStructure
 */
jsMaps.Bing.prototype.polygon = function (map,parameters) {
    var fillColor = jsMaps.convertHex(parameters.fillColor,parameters.fillOpacity*100,true);
    var strokeColor = jsMaps.convertHex(parameters.strokeColor,parameters.strokeColor*100,true);

    var options = {
        fillColor: new Microsoft.Maps.Color((255*fillColor.opacity),fillColor.red,fillColor.greed,fillColor.blue),
        strokeColor: new Microsoft.Maps.Color((255*strokeColor.opacity),strokeColor.red,strokeColor.greed,strokeColor.blue),
        strokeThickness: parameters.strokeWeight,
        visible: parameters.visible
    };

    var Polygon = new Microsoft.Maps.Polygon(jsMaps.Bing.toBingPath(parameters.paths,true),options);
    Polygon.clickable = parameters.clickable;

    // Add the polyline to the map
    map.object.entities.push(Polygon);

    var EditHandleLayer = jsMaps.Bing.EditableLines(Polygon,true,jsMaps.Bing.EditablePolygon(Polygon));
    EditHandleLayer.setOptions({ visible: parameters.editable });

    map.object.entities.push(EditHandleLayer);

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolygonStructure();

    hooking.prototype.object = Polygon;
    hooking.prototype.EditHandleLayer = EditHandleLayer;
    hooking.prototype.mapObject = map.object;

    hooking.prototype.getEditable = function () {
        return this.EditHandleLayer.getVisible();
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        var points = this.object.getLocations();

        for (i = 0; i <= (points.length - 1); i++) {
            arrayOfPaths.push ({lat: points[i].latitude, lng: points[i].longitude});
        }

        return arrayOfPaths;
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisible();
    };

    hooking.prototype.setDraggable = function (draggable) {
        // not supported
    };

    hooking.prototype.setEditable = function (editable) {
        this.EditHandleLayer.setOptions({ visible: editable });
    };

    hooking.prototype.setPath = function (pathArray) {
        this.object.setLocations(jsMaps.Bing.toBingPath(pathArray,true));

        var isEditable = this.getEditable();

        this.mapObject.entities.remove(this.EditHandleLayer);
        this.EditHandleLayer =  jsMaps.Bing.EditableLines(this.object,true,jsMaps.Bing.EditablePolygon(this.object));
        this.EditHandleLayer.setOptions({ visible: isEditable });

        this.mapObject.entities.push(this.EditHandleLayer);
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.mapObject.entities.remove(this.object);
        this.mapObject.entities.remove(this.EditHandleLayer);

        map.entities.push(this.object);
        map.entities.push(this.EditHandleLayer);

        this.mapObject = map;
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setOptions({visible:visible});
    };

    hooking.prototype.removePolyGon = function () {
        this.mapObject.entities.remove(this.object);
        this.mapObject.entities.remove(this.EditHandleLayer);
    };

    return new hooking();
};

jsMaps.Bing.drawCircle = function (latin, lonin, radius) {
    var locs = [];
    var lat1 = latin * Math.PI / 180.0;
    var lon1 = lonin * Math.PI / 180.0;
    var d = radius / 1000 / 6371;
    var x;
    for (x = 0; x <= 360; x+=10) {
        var tc = (x / 90) * Math.PI / 2;
        var lat = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc));
        lat = 180.0 * lat / Math.PI;
        var lon;
        if (Math.cos(lat1) == 0) {
            lon = lonin; // endpoint a pole
        }
        else {
            lon = ((lon1 - Math.asin(Math.sin(tc) * Math.sin(d) / Math.cos(lat1)) + Math.PI) % (2 * Math.PI)) - Math.PI;
        }
        lon = 180.0 * lon / Math.PI;
        var loc = new Microsoft.Maps.Location(lat, lon);
        locs.push(loc);
    }
    return locs;
};


/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.CircleOptions} parameters
 * @returns jsMaps.CircleStructure
 */
jsMaps.Bing.prototype.circle = function (map,parameters) {
    var fillColor = jsMaps.convertHex(parameters.fillColor, parameters.fillOpacity * 100, true);
    var strokeColor = jsMaps.convertHex(parameters.strokeColor, parameters.strokeColor * 100, true);

    var options = {
        fillColor: new Microsoft.Maps.Color((255 * fillColor.opacity), fillColor.red, fillColor.greed, fillColor.blue),
        strokeColor: new Microsoft.Maps.Color((255 * strokeColor.opacity), strokeColor.red, strokeColor.greed, strokeColor.blue),
        strokeThickness: parameters.strokeWeight,
        visible: parameters.visible
    };

    var circle = new Microsoft.Maps.Polygon(jsMaps.Bing.drawCircle(parameters.center.lat, parameters.center.lng, parameters.radius), options);
    circle.clickable = parameters.clickable;

    // Add the polyline to the map
    map.object.entities.push(circle);

    var hooking = function () {};
    hooking.prototype = new jsMaps.CircleStructure();

    hooking.prototype.object = circle;
    hooking.prototype.mapObject = map.object;

    /**
     *
     * @type {jsMaps.CircleOptions}
     */
    hooking.prototype.parameters = parameters;

    /**
     * http://stackoverflow.com/questions/9528669/how-to-correctly-get-the-bounding-box-using-locationrect-fromlocations-when-lo
     * @returns {hooking}
     */
    hooking.prototype.getBounds = function () {
        var bounds = Microsoft.Maps.LocationRect.fromLocations(this.object.getLocations());
        return jsMaps.Bing.prototype.bounds(bounds);
    };

    /**
     * @returns {{lat: (map.center.latitude|*|mapd.center.latitude|jsMaps.api.options.center.latitude|Number), lng: (map.center.longitude|*|mapd.center.longitude|jsMaps.api.options.center.longitude|Number)}}
     */
    hooking.prototype.getCenter = function () {
        var bounds = Microsoft.Maps.LocationRect.fromLocations(this.object.getLocations());
        return {lat: bounds.center.latitude, lng: bounds.center.longitude};
    };

    hooking.prototype.getDraggable = function () {
        return false;
    };

    hooking.prototype.getEditable = function () {
        return false;
    };

    hooking.prototype.getRadius = function () {
        return this.parameters.radius;
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisible();
    };

    hooking.prototype.setCenter = function (lat, lng) {
        this.parameters.center = {lat: lat, lng: lng};
        this.object.setLocations(jsMaps.Bing.drawCircle(lat, lng, this.parameters.radius));
    };

    hooking.prototype.setDraggable = function (draggable) {
       // not supported
    };

    hooking.prototype.setEditable = function (editable) {
        // not supported
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.mapObject.entities.remove(this.object);
        map.entities.push(this.object);
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setOptions({visible:visible});
    };

    hooking.prototype.setRadius = function (radius) {
        this.parameters.radius = radius;
        this.object.setLocations(jsMaps.Bing.drawCircle(this.parameters.center.lat, this.parameters.center.lng, this.parameters.radius));
    };

    hooking.prototype.removeCircle = function () {
        this.mapObject.entities.remove(this.object);
    };
    return new hooking();
};