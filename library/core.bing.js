jsMaps.Bing = function(mapDomDocument) {};
jsMaps.Bing.prototype = new jsMaps.Abstract();

/**
 * create the mal
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

    hooking.prototype.getCenter = function () {
        var center = this.object.getCenter();
        return {lat:center.latitude, lng: center.longitude};
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

jsMaps.Bing.prototype.attachEvent = function (content,event,functionToRun,once) {
    var eventTranslation = '';
    var fn = functionToRun;

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
        if (event == jsMaps.api.supported_events.tilesloaded || event == jsMaps.api.supported_events.zoom_changed) eventTranslation = 'tiledownloadcomplete';
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
        if (event == jsMaps.api.additional_events.mouseout)  eventTranslation = 'mouseout';
        if (event == jsMaps.api.additional_events.mouseover)  eventTranslation = 'mouseover';
        if (event == jsMaps.api.additional_events.mouseup) eventTranslation = 'mouseup';
        if (event == jsMaps.api.additional_events.rightclick) eventTranslation = 'rightclick';
    }

    if (eventTranslation == 'click') {
        fn = function () {
            if (typeof content.object.clickable != 'undefined' && content.object.clickable == false) {
                return;
            }

            functionToRun();
        }
    }


    if (once) {
        var lister = Microsoft.Maps.Events.addHandler(content.object,eventTranslation,function () {
            content.object.removeHandler(lister);

            fn()
        });

        return;
    }

    return Microsoft.Maps.Events.addHandler(content.object,eventTranslation, fn);
};

/**
 *
 * @param obj
 * @param eventObject
 * @returns {*}
 */
jsMaps.Bing.prototype.removeEvent = function (obj,eventObject) {
    obj.removeHandler(eventObject);
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
 * @param {jsMaps.markerOptions} parameters
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
 * @param {jsMaps.infoWindowOptions} parameters
 * @returns {jsMaps.InfoWindowStructure}
 */
jsMaps.Bing.prototype.infoWindow = function (parameters) {
    function strip(html)
    {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }


    var options = {description: "<div style=\"width: "+strip(parameters.content).length*0.48+"px; height: "+parameters.content.length*0.27+"px; overflow: auto; margin-top:10px;\">"+parameters.content+"</div>",width: strip(parameters.content).length/2,height: parameters.content.length*0.31};
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

jsMaps.Bing.toBingPath =  function (path) {
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

    var Polygon = new Microsoft.Maps.Polygon(jsMaps.Bing.toBingPath(parameters.paths),options);
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
        this.object.setLocations(jsMaps.Bing.toBingPath(pathArray));

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

// Microsoft is to blame for this
var fn;

function GeocodeCallback(data)
{
    var geoCoder = {'results': [],'copyright':data.copyright,'brandLogoUri':data.brandLogoUri};

    if (data.statusCode != '200' || data.resourceSets[0].resources.length == 0) {
        fn(geoCoder);
        return;
    }

    for (var o in data.resourceSets[0].resources) {
        if (data.resourceSets[0].resources.hasOwnProperty(o) == false) continue;
        var resources = data.resourceSets[0].resources[o];

        var location = new jsMaps.geo.Location(resources.point.coordinates[0],resources.point.coordinates[1]);

        var view_port = jsMaps.geo.View_port;

        var location_type = jsMaps.supported_location_types.APPROXIMATE;

        var geocode = resources.geocodePoints[0];

        if (geocode.calculationMethod == 'Rooftop') {
            location_type = jsMaps.supported_location_types.ROOFTOP;
        } else if (geocode.calculationMethod == 'Interpolation') {
            location_type = jsMaps.supported_location_types.RANGE_INTERPOLATED;
        } else if (geocode.calculationMethod == 'Parcel') {
            location_type = jsMaps.supported_location_types.GEOMETRIC_CENTER;
        }


        view_port.getTopLeft = {lat: resources.bbox[2], lng: resources.bbox[3]};
        view_port.getBottomRight = {lat: resources.bbox[0], lng: resources.bbox[1]};
        view_port.location_type = location_type;

        var types = [];

        for (var a in resources.address) {
            if (a == 'addressLine' || a == 'formattedAddress') {
                types.push(jsMaps.supported_Address_types.street_address);
            }

            if (a == 'locality' || a == 'neighborhood') {
                types.push(jsMaps.supported_Address_types.locality);
                types.push(jsMaps.supported_Address_types.political);
            }

            if (a == 'adminDistrict') {
                types.push(jsMaps.supported_Address_types.administrative_area_level_1);
                types.push(jsMaps.supported_Address_types.political);
            }

            if (a == 'adminDistrict2') {
                types.push(jsMaps.supported_Address_types.administrative_area_level_2);
                types.push(jsMaps.supported_Address_types.political);
            }

            if (a == 'postalCode') {
                types.push(jsMaps.supported_Address_types.postal_code);
            }

            if (a == 'countryRegion' || a == 'countryRegionIso2') {
                types.push(jsMaps.supported_Address_types.country);
            }

            if (a == 'landmark') {
                types.push(jsMaps.supported_Address_types.premise);
                types.push(jsMaps.supported_Address_types.point_of_interest);
            }
        }


        var geoCoderResult = new jsMaps.AddressSearchResult(resources.name, types, (resources.confidence != 'High'), new jsMaps.Geometry(location, view_port));
        geoCoder['results'].push(geoCoderResult);
    }

    fn(geoCoder);
}

/**
 *
 * @param search
 * @param fun
 */
jsMaps.Bing.prototype.addressGeoSearch = function (search, fun) {
    fn = fun;
    var script = document.createElement('script');
    script.src = 'http://dev.virtualearth.net/REST/v1/Locations?query=' + encodeURIComponent(search) + '&output=json&jsonp=GeocodeCallback&key=' + encodeURIComponent(jsMaps.config.bing.key);

    document.getElementsByTagName('head')[0].appendChild(script);
};
