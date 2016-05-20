if (typeof jsMaps.Bing == 'undefined') {
    jsMaps.Bing = function(mapDomDocument) {};
    jsMaps.Bing.prototype = new jsMaps.Abstract();
}

jsMaps.Bing.hideMapZoom = function () {
    var html = '<style type="text/css">.NavBar_zoomControlContainer .NavBar_zoomOut, .NavBar_zoomControlContainer .NavBar_zoomIn{display: none;} </style>';
    var e = document.createElement('p');
    e.setAttribute("data-temp-id","bing-zoom-hide");
    e.innerHTML = html;

    document.body.insertBefore(e, document.body.childNodes[0]);
};

jsMaps.Bing.VectorStyle =  function (options) {
    var opts = {};

    var currentColor,color,tempColor;

    if (options.strokeColor != '' || options.strokeOpacity != false) {
        currentColor = this.object.getStrokeColor();

        if (options.strokeColor!='' && options.strokeOpacity != '') {
            tempColor = jsMaps.convertHex(options.strokeColor,options.strokeOpacity*100,true);
            color = new Microsoft.Maps.Color((255*tempColor.opacity),tempColor.red,tempColor.greed,tempColor.blue);
        } else if (options.strokeColor!='' && options.strokeOpacity == '') {
            tempColor = jsMaps.convertHex(options.strokeColor,0,true);
            color = new Microsoft.Maps.Color(255*currentColor.getOpacity(),tempColor.red,tempColor.greed,tempColor.blue);
        } else if (options.strokeColor=='' && options.strokeOpacity != '') {
            color = new Microsoft.Maps.Color((255*options.strokeOpacity),currentColor.r,currentColor.g,currentColor.b);
        }

        opts.strokeColor = color;
    }

    if (options.strokeWeight != '') opts.strokeThickness = options.strokeWeight;

    if (options.fillColor != '' || options.fillOpacity != false) {
        currentColor = this.object.getFillColor();

        if (options.fillColor!='' && options.fillOpacity != '') {
            tempColor = jsMaps.convertHex(options.fillColor,options.fillOpacity*100,true);
            color = new Microsoft.Maps.Color((255*tempColor.opacity),tempColor.red,tempColor.greed,tempColor.blue);
        } else if (options.fillColor!='' && options.fillOpacity == '') {
            tempColor = jsMaps.convertHex(options.fillColor,0,true);
            color = new Microsoft.Maps.Color(255*currentColor.getOpacity(),tempColor.red,tempColor.greed,tempColor.blue);
        } else if (options.fillColor=='' && options.fillOpacity != '') {
            color = new Microsoft.Maps.Color((255*options.fillOpacity),currentColor.r,currentColor.g,currentColor.b);
        }

        opts.fillColor = color;
    }

    this.object.setOptions(opts);
};

jsMaps.Bing.VectorGetStyle =  function () {
    var strokeColor = this.object.getStrokeColor();

    var return_values = new jsMaps.VectorStyle();

    if (typeof this.object.getFillColor != 'undefined') {
        var fillColor = this.object.getFillColor();

        return_values.fillColor     = fillColor.toHex();
        return_values.fillOpacity   = fillColor.getOpacity();
    }

    return_values.strokeColor   = strokeColor.toHex();
    return_values.strokeOpacity = strokeColor.getOpacity();
    return_values.strokeWeight  = this.object.getStrokeThickness();
    return_values.zIndex        = '';

    return return_values;
};

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
        jsMaps.Bing.hideMapZoom();
    }

    if (typeof providerOptions != 'undefined') {
        myOptions = jsMaps.merge(myOptions,providerOptions);
    }

    var map = new Microsoft.Maps.Map(mapDomDocument, myOptions);

    var hooking = function() {};

    hooking.prototype = new jsMaps.MapStructure();
    hooking.prototype.bounds = null;


    hooking.prototype.__className = 'MapStructure';
    hooking.prototype.object = map;
    hooking.prototype.draggable = true;

    // no other way to stop the scroll zoom
    if (options.mouse_scroll == false) {
        hooking.prototype.mouseScroll = Microsoft.Maps.Events.addHandler(map, 'mousewheel', function(e) {
            e.handled = true;
            return true;
        });
    } else {
        hooking.prototype.mouseScroll = true;
    }


    hooking.prototype.getCenter = function () {
        var center = this.object.getCenter();
        return {lat:center.latitude, lng: center.longitude};
    };

    hooking.prototype.getElement = function () {
        return this.object.getRootElement();
    };

    /**
     *
     * @param {jsMaps.api.options} options
     */
    hooking.prototype.setOptions = function (options) {
        if (
            (typeof options.center != 'undefined' && typeof options.center.latitude != 'undefined' && typeof options.center.longitude != 'undefined')
         || (typeof options.zoom != 'undefined')
         || (typeof options.map_type != 'undefined')
         || (typeof options.scale_control != 'undefined')
        ) {
            var opts = {};

            if (typeof options.center != 'undefined' && typeof options.center.latitude != 'undefined' && typeof options.center.longitude != 'undefined') opts.center = new Microsoft.Maps.Location(options.center.latitude, options.center.longitude);
            if (typeof options.zoom != 'undefined') opts.zoom = options.zoom;
            if (typeof options.map_type != 'undefined') opts.showMapTypeSelector = options.map_type;
            if (typeof options.scale_control != 'undefined') opts.showScalebar = options.scale_control;

            this.object.setOptions(opts);
        }


        if (typeof options.zoom_control != 'undefined') {
            var element = document.querySelector('[data-temp-id="bing-zoom-hide"]');

            if (options.zoom_control == true && element != null) {
                element.parentNode.removeChild(element);
            } else if (options.zoom_control == false && element == null) {
                jsMaps.Bing.hideMapZoom();
            }
        }

        if (typeof options.mouse_scroll != 'undefined') {
           if (options.mouse_scroll === false && this.mouseScroll === true) {
               this.mouseScroll = Microsoft.Maps.Events.addHandler(this.object, 'mousewheel', function(e) {
                   e.handled = true;
                   return true;
               });
           } else if  (options.mouse_scroll === true && this.mouseScroll !== true) {
               Microsoft.Maps.Events.removeHandler(this.mouseScroll);
               this.mouseScroll = true;
           }
        }
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

    hooking.prototype.setCenter = function (lat, lng,transition) {
        var mapOptions = this.object.getOptions();
        mapOptions.center = new Microsoft.Maps.Location(lat, lng);
        mapOptions.animate = (transition != 0);

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
        if (event == jsMaps.api.additional_events.mouseup) eventTranslation = 'mouseup';
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
            var mapObject = (typeof content.mapObject != 'undefined') ? content.mapObject: e.target;
            if (typeof content.map != 'undefined') mapObject = content.map;

            if (typeof  mapObject.tryPixelToLocation == 'undefined' && typeof content.__className !='undefined' && content.__className == 'MapStructure') {
                mapObject = content.object;
            }

            if (typeof content.__className != 'undefined' && content.__className == 'marker') {
                return content.getPosition();
            }

            var latLng = mapObject.tryPixelToLocation(new Microsoft.Maps.Point(e.getX(), e.getY()));
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

    var html;
    if (parameters.html != null && typeof parameters.html == 'object') {
        options.htmlContent = '<div>'+parameters.html.innerHTML+'</div>';
        options.anchor = new Microsoft.Maps.Point(0,0);
    } else if (parameters.html != null && typeof parameters.html == 'string') {
        options.htmlContent = '<div>'+parameters.html+'</div>';
        options.anchor = new Microsoft.Maps.Point(0,0);
    }

    map = map.object;

    var marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(parameters.position.lat, parameters.position.lng), options);
    map.entities.push(marker);

    var hooking = function () {};
    hooking.prototype = new jsMaps.MarkerStructure();

    hooking.prototype.object = marker;
    hooking.prototype.map = map;
    hooking.prototype.__className = 'marker';

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
        this.map.entities.remove(this.object);
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
    var newPath = [];

    if (typeof path == 'undefined' || path == []) return [];

    for (var i in path) {
        if (path.hasOwnProperty(i) == false) continue;

        if (Array.isArray(path[i])) {
            var recentArray = [];
            for (var c in path[i]) {
                if (path[i].hasOwnProperty(c) == false) continue;
                newPath.push(new Microsoft.Maps.Location(path[i][c].lat,path[i][c].lng));
            }
        } else {
            newPath.push(new Microsoft.Maps.Location(path[i].lat,path[i].lng));
        }
    }

    if (isPolyGon) {
        var firstPoint = newPath[0];
        var point = newPath[newPath.length-1];

        if (firstPoint.latitude != point.latitude && firstPoint.longitude != point.longitude) {
            newPath.push(firstPoint);
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

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolyLineStructure();

    hooking.prototype.object = PolyLine;
    hooking.prototype.mapObject = map.object;
    hooking.prototype.draggable = parameters.draggable;
    hooking.prototype.editable = parameters.editable;

    hooking.prototype.getEditable = function () {
        return this.editable;
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
        this.draggable = draggable;
    };

    hooking.prototype.setEditable = function (editable) {
        this.editable = editable;

        if (editable == false) {
            jsMaps.removeVectorMarker(this);
        } else {
            parameters.paths = this.getPath();
            new jsMaps.editableVector(this,map,parameters,'polyline');
        }
    };


    hooking.prototype.setPath = function (pathArray,isReset) {
        this.object.setLocations(jsMaps.Bing.toBingPath(pathArray));

        if (typeof isReset == 'undefined') {
            parameters.paths = this.getPath();
            jsMaps.removeVectorMarker(this);

            new jsMaps.editableVector(this,map,parameters,'polyline');
        }
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

        map.entities.push(this.object);

        parameters.paths = this.getPath();

        new jsMaps.editableVector(this,map,parameters,'polyline');
        this.mapObject = map;
    };

    hooking.prototype.setVisible = function (visible) {
        if (visible) {
            parameters.paths = this.getPath();
            new jsMaps.editableVector(this,map,parameters,'polyline');
        } else {
            jsMaps.removeVectorMarker(this);
        }

        this.object.setOptions({visible:visible});
    };

    hooking.prototype.removeLine = function () {
        this.mapObject.entities.remove(this.object);
        jsMaps.removeVectorMarker(this);
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Bing.VectorStyle.bind(object);
    object.getStyle = jsMaps.Bing.VectorGetStyle.bind(object);

    parameters.paths = object.getPath();
    new jsMaps.editableVector(object,map,parameters,'polyline');
    new jsMaps.draggableVector(object,map,parameters,'polyline');

    return object;
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

    map.object.entities.push(Polygon);

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolygonStructure();

    hooking.prototype.object = Polygon;
    hooking.prototype.mapObject = map.object;
    hooking.prototype.draggable = parameters.draggable;
    hooking.prototype.editable = parameters.editable;

    hooking.prototype.getEditable = function () {
        return this.editable;
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
        this.draggable = draggable;
    };

    hooking.prototype.setEditable = function (editable) {
        this.editable = editable;

        if (editable == false) {
            jsMaps.removeVectorMarker(this);
        } else {
            parameters.paths = this.getPath();
            new jsMaps.editableVector(this,map,parameters,'polygon');
        }
    };

    hooking.prototype.setPath = function (pathArray,isReset) {
        this.object.setLocations(jsMaps.Bing.toBingPath(pathArray,true));

        if (typeof isReset == 'undefined') {
            parameters.paths = this.getPath();
            jsMaps.removeVectorMarker(this);

            new jsMaps.editableVector(this,map,parameters,'polygon');
        }
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.mapObject.entities.remove(this.object);

        map.entities.push(this.object);

        parameters.paths = this.getPath();

        new jsMaps.editableVector(this,map,parameters,'polygon');
        this.mapObject = map;
    };

    hooking.prototype.setVisible = function (visible) {
        if (visible) {
            parameters.paths = this.getPath();
            new jsMaps.editableVector(this,map,parameters,'polygon');
        } else {
            jsMaps.removeVectorMarker(this);
        }

        this.object.setOptions({visible:visible});
    };

    hooking.prototype.removePolyGon = function () {
        this.mapObject.entities.remove(this.object);
        jsMaps.removeVectorMarker(this);
    };

    var object = new hooking();
    parameters.paths = object.getPath();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Bing.VectorStyle.bind(object);
    object.getStyle = jsMaps.Bing.VectorGetStyle.bind(object);

    new jsMaps.editableVector(object,map,parameters,'polygon');
    new jsMaps.draggableVector(object,map,parameters);

    return object;
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
    hooking.prototype.draggable = parameters.draggable;
    hooking.prototype.editable = parameters.editable;

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
        return this.draggable;
    };

    hooking.prototype.getEditable = function () {
        return this.editable;
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
        this.draggable = draggable;
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

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Bing.VectorStyle.bind(object);
    object.getStyle = jsMaps.Bing.VectorGetStyle.bind(object);

    new jsMaps.draggableVector(object,map,parameters,'circle');
    new jsMaps.editableVector(object,map,parameters,'circle');

    return object;
};