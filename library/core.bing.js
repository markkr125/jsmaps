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

    if (once) {
        var lister = Microsoft.Maps.Events.addHandler(content.object,eventTranslation,function () {
            content.object.removeHandler(lister);

            functionToRun()
        });

        return;
    }

    return Microsoft.Maps.Events.addHandler(content.object,eventTranslation, functionToRun);
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

        this.object.setLocation(new Microsoft.Maps.Location(pos.lat, pos.lng));
        map.object.entities.push(this.object);

    };

    hooking.prototype.setContent = function (content) {
        this.object.setOptions({description:content});
    };

    return new hooking();
};