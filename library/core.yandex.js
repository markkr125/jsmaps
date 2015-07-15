jsMaps.Yandex = function(mapDomDocument) {};
jsMaps.Yandex.prototype = new jsMaps.Abstract();
jsMaps.Yandex.MapCenter = {lat: 0,lng: 0};
jsMaps.Yandex.MapZoom = 0;

/**
 * create the map
 *
 * @param mapDomDocument
 * @param options
 * @param providerOptions
 * @returns {jsMaps.MapStructure}
 */
jsMaps.Yandex.prototype.initializeMap = function (mapDomDocument, options, providerOptions) {
    mapDomDocument.dataset.hasYandex = '0';

    var hooking = function() {};
    hooking.prototype = new jsMaps.MapStructure();
    hooking.prototype.object = null;
    hooking.prototype.__className = 'map';

    ymaps.ready(function () {
        var mapControls = [];
        if (options.zoom_control == true) mapControls.push('zoomControl');
        if (options.map_type == true) mapControls.push('typeSelector');
        if (options.scale_control == true) mapControls.push('rulerControl');

        var behaviors = ["drag", "dblClickZoom","multiTouch"];
        if (options.mouse_scroll == true) behaviors.push('scrollZoom');

        map = new ymaps.Map(mapDomDocument, {
            center: [options.center.latitude, options.center.longitude],
            zoom: options.zoom,
            controls: mapControls,
            behaviors: behaviors
        });

        hooking.prototype.object = map;
    });

    jsMaps.Yandex.MapCenter.lat = options.center.latitude;
    jsMaps.Yandex.MapCenter.lng = options.center.longitude;
    jsMaps.Yandex.MapZoom = options.zoom;

    hooking.prototype.getCenter = function () {
        if (this.object == null) {
            return {lat: jsMaps.Yandex.MapCenter.lat, lng: jsMaps.Yandex.MapCenter.lng};
        }

        var mapCenter = this.object.getCenter();
        return {lat: mapCenter[0], lng: mapCenter[1]};
    };

    hooking.prototype.setCenter = function (lat, lng) {
        ymaps.ready(function () {
            this.object.setCenter([lat,lng]);
        },this);
    };

    hooking.prototype.getZoom = function () {
        if (this.object == null) {
            return jsMaps.Yandex.MapZoom;
        }

        return this.object.getZoom();
    };

    hooking.prototype.setZoom = function (number) {
        if (number > 18) {
            number = 18;
        }

        ymaps.ready(function () {
            this.object.setZoom(number);
        },this);
    };

    hooking.prototype.getBounds = function () {
        return jsMaps.Yandex.prototype.bounds(this.object);
    };

    /**
     *
     * @param {jsMaps.Yandex.bounds} bounds
     */
    hooking.prototype.fitBounds = function (bounds) {
        ymaps.ready(function () {
            bounds.calculateBounds();

            /**
             * @type {{getTopLeft: {lat: number, lng: number}, getBottomRight: {lat: number, lng: number}}}
             */
            var boundsObj = bounds.bounds;
            return this.object.setBounds([[boundsObj.getBottomRight.lat, boundsObj.getTopLeft.lng], [boundsObj.getTopLeft.lat, boundsObj.getBottomRight.lng]],{checkZoomRange: true });
        }, this);
    };

    return new hooking;
};

/**
 * Bounds object
 *
 * @param mapObject
 * @returns hooking
 */
jsMaps.Yandex.prototype.bounds = function (mapObject) {
    var bounds;
    if (typeof mapObject != 'undefined') {
        var data = [];

        if (typeof mapObject.object != 'undefined') {
            data = mapObject.object.getBounds();
        } else {
            data = mapObject.getBounds();
        }

        bounds ={getTopLeft: {lat: data[1][0],lng: data[0][1]},getBottomRight: {lat: data[0][0],lng: data[1][1]}};
    } else {
        bounds = {getTopLeft: {lat: -1,lng: -1},getBottomRight:  {lat: -1,lng: -1}};
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.BoundsStructure();

    hooking.prototype.bounds = bounds;
    hooking.prototype.nothing = (typeof mapObject == 'undefined');
    hooking.prototype.arrayPath = [];


    hooking.prototype.addLatLng = function (lat, lng) {
        this.arrayPath.push({lat: lat, lng: lng});
    };

    hooking.prototype.calculateBounds = function () {
        if (this.arrayPath.length > 0) {
            var currentBounds = [];
            if (this.bounds.getTopLeft.lat !=-1 && this.bounds.getTopLeft.lng  !=-1) currentBounds.push ([this.bounds.getTopLeft.lat,this.bounds.getTopLeft.lng]);
            if (this.bounds.getBottomRight.lat !=-1 && this.bounds.getBottomRight.lng  !=-1) currentBounds.push ([this.bounds.getBottomRight.lat,this.bounds.getBottomRight.lng]);


            for (var i in this.arrayPath) {
                if (this.arrayPath.hasOwnProperty(i) == false) continue;
                currentBounds.push([this.arrayPath[i].lat,this.arrayPath[i].lng]);
            }

            var recalculate = ymaps.util.bounds.fromPoints(currentBounds);

            this.bounds = {getTopLeft: {lat: recalculate[1][0],lng: recalculate[0][1]},getBottomRight: {lat: recalculate[0][0],lng: recalculate[1][1]}};
        }
    };


    hooking.prototype.getCenter = function () {
        this.calculateBounds();

        var center = ymaps.util.bounds.getCenter([[this.bounds.getBottomRight.lat,this.bounds.getTopLeft.lng],[this.bounds.getTopLeft.lat,this.bounds.getBottomRight.lng]]);
        return {lat: center[0], lng: center[1]};
    };

    hooking.prototype.getTopLeft = function () {
        this.calculateBounds();

        var topLeft = this.bounds.getTopLeft;
        return {lat: topLeft.lat, lng: topLeft.lng};
    };

    hooking.prototype.getBottomRight = function () {
        this.calculateBounds();

        var bottomRight = this.bounds.getBottomRight;
        return {lat: bottomRight.lat, lng: bottomRight.lng};
    };

    return new hooking();
};

jsMaps.Yandex.cnt = 0;
jsMaps.Yandex.attachedEvents = {};

/**
 * Attach map events
 *
 * @param content
 * @param event
 * @param functionToRun
 * @param once
 * @returns {*}
 */
jsMaps.Yandex.prototype.attachEvent = function (content,event,functionToRun,once) {
    var eventTranslation = '';

    if (content.__className == 'map') {
        if (event == jsMaps.api.supported_events.bounds_changed) eventTranslation = 'boundschange';
        if (event == jsMaps.api.supported_events.center_changed) eventTranslation = 'boundschange';
        if (event == jsMaps.api.supported_events.click) eventTranslation = 'click';
        if (event == jsMaps.api.supported_events.dblclick) eventTranslation = 'dblclick';
        if (event == jsMaps.api.supported_events.dragend) eventTranslation = 'actionend';
        if (event == jsMaps.api.supported_events.dragstart) eventTranslation = 'actionbegin';
        if (event == jsMaps.api.supported_events.idle) eventTranslation = 'boundschange';
        if (event == jsMaps.api.supported_events.maptypeid_changed) eventTranslation = 'typechange';
        if (event == jsMaps.api.supported_events.drag) eventTranslation = 'actiontick';
        if (event == jsMaps.api.supported_events.mousemove) eventTranslation = 'mousemove';
        if (event == jsMaps.api.supported_events.mouseout) eventTranslation = 'mouseleave';
        if (event == jsMaps.api.supported_events.mouseover) eventTranslation = 'mouseenter';
        if (event == jsMaps.api.supported_events.rightclick) eventTranslation = 'contextmenu';
        if (event == jsMaps.api.supported_events.tilesloaded || event == jsMaps.api.supported_events.zoom_changed) eventTranslation = 'actiontickcomplete';
        if (event == jsMaps.api.supported_events.tilt_changed) eventTranslation = 'actiontickcomplete';
        if (event == jsMaps.api.supported_events.domready) eventTranslation = 'boundschange';
        if (event == jsMaps.api.additional_events.position_changed) eventTranslation = 'dragend';
        if (event == jsMaps.api.additional_events.mouseup) eventTranslation = 'mouseup';
        if (event == jsMaps.api.additional_events.mousedown) eventTranslation = 'mousedown';
    } else {
        if (event == jsMaps.api.supported_events.click) eventTranslation = 'tap';
        if (event == jsMaps.api.supported_events.dblclick) eventTranslation = 'dblclick';
        if (event == jsMaps.api.supported_events.dragend) eventTranslation = 'dragend';
        if (event == jsMaps.api.supported_events.dragstart) eventTranslation = 'dragstart';
        if (event == jsMaps.api.supported_events.drag) eventTranslation = 'drag';
        if (event == jsMaps.api.supported_events.mousemove) eventTranslation = 'mousemove';
        if (event == jsMaps.api.supported_events.mouseout) eventTranslation = 'mouseleave';
        if (event == jsMaps.api.supported_events.mouseover) eventTranslation = 'mouseenter';
        if (event == jsMaps.api.supported_events.rightclick) eventTranslation = 'contextmenu';
        if (event == jsMaps.api.additional_events.position_changed) eventTranslation = 'geometrychange';
        if (event == jsMaps.api.additional_events.mouseup) eventTranslation = 'mouseup';
        if (event == jsMaps.api.additional_events.mousedown) eventTranslation = 'mousedown';
        if (event == jsMaps.api.additional_events.icon_changed) eventTranslation = 'optionschange';
    }

    jsMaps.Yandex.cnt++;
    jsMaps.Yandex.attachedEvents[jsMaps.Yandex.cnt] = null;

    var fn = functionToRun;
    var curCnt = jsMaps.Yandex.cnt;

    ymaps.ready(function () {
        if (once) {
            content.object.events.once(eventTranslation, fn);
        } else {
            jsMaps.Yandex.attachedEvents[curCnt] = content.object.events.add(eventTranslation, fn);
        }
    }, this);

    return {c: curCnt, f: fn, e: eventTranslation};
};

/**
 *
 * @param map
 * @param eventObject
 * @returns {*}
 */
jsMaps.Yandex.prototype.removeEvent = function (map, eventObject) {
    ymaps.ready(function () {
        jsMaps.Yandex.attachedEvents[eventObject.c].remove(eventObject.e,eventObject.f);
    }, this);
};

/**
 * Generate markers
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.markerOptions} parameters
 */
jsMaps.Yandex.prototype.marker = function (map,parameters) {

    var options = {interactiveZIndex: true,visible: true};
    var props = {};

    if (parameters.zIndex != null) options.zIndex = parameters.zIndex;

    if (parameters.icon != null) {
        options.iconLayout = 'default#image';
        options.iconImageHref = parameters.icon;
    }

    if (parameters.draggable != null) options.draggable = parameters.draggable;
    if (parameters.title != null) props.hintContent = parameters.title;

    var hooking = function () {};
    hooking.prototype = new jsMaps.MarkerStructure();
    hooking.prototype.object = null;
    hooking.prototype.__className = 'marker';
    hooking.prototype.defaultLocation = parameters.position;
    hooking.prototype.defaultOptions = options;

    ymaps.ready(function () {
        map = map.object;
        hooking.prototype.object =  new ymaps.Placemark([parameters.position.lat, parameters.position.lng],props,options);
        map.geoObjects.add(hooking.prototype.object);
        hooking.prototype.map = map
    }, this);

    /**
     *
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.getPosition = function () {
        if (this.object == null) {
            return {lat: this.defaultLocation.lat, lng: this.defaultLocation.lng};
        }

        var coordinates =  this.object.geometry.getCoordinates();
        return {lat: coordinates[0], lng: coordinates[1]}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        ymaps.ready(function () {
            this.object.geometry.setCoordinates([lat, lng]);
        }, this);
    };

    hooking.prototype.getVisible = function () {
        if (this.object == null) {
            return this.defaultOptions.visible;
        }

        return this.object.options.get('visible');
    };

    hooking.prototype.setVisible = function (variable) {
        ymaps.ready(function () {
            this.object.options.set('visible', variable);
        }, this);
    };

    hooking.prototype.getIcon = function () {
        if (this.object == null) {
            return this.defaultOptions.iconImageHref;
        }

        return this.object.options.get('iconImageHref');
    };

    hooking.prototype.setIcon = function (icon) {
        ymaps.ready(function () {
            this.object.options.set('iconImageHref', icon);
        }, this);
    };

    hooking.prototype.getZIndex = function () {
        if (this.object == null) {
            return this.defaultOptions.zIndex;
        }

        return this.object.options.get('zIndex');
    };

    hooking.prototype.setZIndex = function (number) {
        ymaps.ready(function () {
            this.object.options.set('zIndex', number);
        }, this);
    };

    hooking.prototype.setDraggable = function (flag) {
        ymaps.ready(function () {
            this.object.options.set('draggable', flag);
        }, this);
    };

    hooking.prototype.remove = function () {
        ymaps.ready(function () {
           var parentMap = this.object.getMap();
           parentMap.geoObjects.remove(this.object);
        }, this);
    };

    return new hooking();
};
