var SUPPORTED_MAP_PROVIDERS = ['google','here','bing','yandex','native'];

jsMaps.config = {
    here: {
        app_id: '',
        app_code: ''
    },
    bing: {
        key: ''
    }
};

jsMaps.api = {
    /**
     * @type jsMaps.Abstract
     */
    object: null,
    markerCounter: 0,
    polyLineIdCounter: 0,
    polygonIdCounter: 0,
    options: {
        center: {
            latitude: -34.397,
            longitude: 150.644
        },
        zoom: 8,
        mouse_scroll: true,
        zoom_control: true,
        map_type: false,
        scale_control: true,
        street_view: true
    },
    supported_events: {
        bounds_changed: 'bounds_changed',
        center_changed: 'center_changed',
        click: 'click',
        dblclick: 'dblclick',
        drag: 'drag',
        dragend: 'dragend',
        dragstart: 'dragstart',
        idle: 'idle',
        maptypeid_changed: 'maptypeid_changed',
        mousemove: 'mousemove',
        mouseout: 'mouseout',
        mouseover: 'mouseover',
        rightclick: 'rightclick',
        tilesloaded: 'tilesloaded',
        tilt_changed: 'tilt_changed',
        zoom_changed: 'zoom_changed',
        domready: 'domready' // only for info window
    },
    additional_events: { // Events that a re specific only for poly lines, markers etc...
        icon_changed: 'icon_changed',
        position_changed: 'position_changed',
        rightclick: 'rightclick',
        drag: 'drag',
        mouseup:'mouseup',
        mousedown: 'mousedown'
    },
    /**
     *
     * @param mapDomDocument
     * @param provider
     * @param options
     * @param providerOptions
     * @returns jsMaps.MapStructure
     */
    init: function (mapDomDocument, provider, options, providerOptions) {
        if (typeof options != 'undefined') {
            options = jsMaps.merge(this.options,options);
        }

        this.supported_map_providers(provider);

        if (typeof mapDomDocument == 'string' ) {
            mapDomDocument = document.querySelector(mapDomDocument);
        }

        if (typeof mapDomDocument != 'object') throw "Unable to find the map element id "+mapDomDocument;

        this.object = this.fetch_object(provider);
        var init = this.object.initializeMap(mapDomDocument, this.options, providerOptions);
        init.parent = this.object;

        return init;
    },

    /**
     *
     * @param element
     * @param event
     * @param fn
     * @param once
     */
    attach_event: function (element,event,fn,once) {
        if (this.object == null) throw "Invalid map object";

        if (typeof element._events == 'undefined') {
            element._events = {};
            element._eventsActive = {};
            element.propegationStoped = {};
            element.eventNum = 0;
        }

        if (typeof element._events[event] == 'undefined') {
            element._events[event] = 0;
            element._eventsActive[event] = {};
            element.propegationStoped[event] = 0;
        }

        element._events[event]++;
        var num =  element._events[event];

        var fx = function (event) {
            if (this.propegationStoped[event.getEventName()] == 0) {
                this._eventsActive[event.getEventName()][num] = 1;
            }

            if (this._eventsActive[event.getEventName()][num] != 1 && this.propegationStoped[event.getEventName()] == 1) {
                return;
            }

            fn.bind(element)(event);
        };

        return this.object.attachEvent(element,event,fx.bind(element),once);
    },

    /**
     *
     * @param element
     * @param eventObject
     */
    remove_event: function (element,eventObject) {
        if (this.object == null) throw "Invalid map object";

        this.object.removeEvent(element,eventObject);
    },

    trigger_event: function (element,eventName) {
        this.object.triggerEvent(element,eventName);
    },

    /**
     *
     * @param map
     * @return jsMaps.BoundsStructure
     */
    bounds: function (map) {
        if (this.object == null) throw "Invalid map object";

        return this.object.bounds(map);
    },

    /**
     *
     * @param provider
     * @returns {*}
     */
    fetch_object: function (provider) {
        var object;

        if (provider == 'google') {
            object = new jsMaps.Google();
        }

        if (provider == 'here') {
            object = new jsMaps.Here();
        }

        if (provider == 'bing') {
            object = new jsMaps.Bing();
        }

        if (provider == 'yandex') {
            object = new jsMaps.Yandex();
        }

        if (provider == 'native') {
            object = new jsMaps.Native();
        }

        return object;
    },

    /**
     *
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.MarkerOptions} parameters
     * @returns jsMaps.MarkerStructure
     */
    marker: function (map,parameters) {
        if (typeof map == 'undefined' ||map == null) throw "Invalid map object";

        var options = new jsMaps.MarkerOptions();

        if (typeof parameters != 'undefined') {
            parameters = jsMaps.merge(options,parameters);
        }

        var marker = map.parent.marker(map,parameters);
        if (parameters.markerId  == null &&marker.markerId == null) {
            this.markerCounter++;
            marker.markerId = this.markerCounter;
        } else if (parameters.markerId != null && marker.markerId == null) {
            marker.markerId = parameters.markerId;
        }

        map.parent.markers.push(marker);

        return marker;
    },

    /**
     *
     * @param {jsMaps.InfoWindowOptions} windowOptions
     * @returns {jsMaps.InfoWindowStructure}
     */
    infoWindow: function (windowOptions) {
        if (typeof windowOptions != 'undefined') {
            windowOptions = jsMaps.merge(new jsMaps.InfoWindowOptions(),windowOptions);
        }

        return this.object.infoWindow(windowOptions);
    },

    /**
     *
     * @param {jsMaps.MapStructure} map
     * @param markerIds
     */
    removeMarkers: function (map,markerIds) {
        var checkMarkers = (typeof markerIds != 'undefined');
        var object = map.parent;

        for (var i in object.markers) {
            if (object.markers.hasOwnProperty(i) == false) continue;

            /**
             * @type jsMaps.MarkerStructure
             */
            var markerItem = object.markers[i];

            if (checkMarkers == true && markerIds.indexOf(markerItem.markerId)) {
                markerItem.remove();
                delete object.markers[i];
            } else if (checkMarkers == false) {
                markerItem.remove();
                delete object.markers[i];
            }
        }

        if (object.markers.length == 0) object.markers = [];
    },

    /**
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.PolyLineOptions} parameters
     * @returns jsMaps.PolyLineStructure
     */
    polyLine: function (map, parameters) {
        if (typeof parameters != 'undefined') {
            parameters = jsMaps.merge(new jsMaps.PolyLineOptions(),parameters);
        }

        var polyLine = this.object.polyLine(map,parameters);

        if (parameters.polyLineId == null && polyLine.polyLineId == null) {
            this.polyLineIdCounter++;
            polyLine.polyLineId = this.polyLineIdCounter;
        } else if (parameters.polyLineId != null && polyLine.polyLineId == null) {
            polyLine.polyLineId = parameters.polyLineId;
        }

        map.parent.polyLines.push(polyLine);

        return polyLine;
    },

    /**
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.PolygonOptions} parameters
     * @returns jsMaps.PolygonStructure
     */
    polygon: function (map, parameters) {
        if (typeof parameters != 'undefined') {
            parameters = jsMaps.merge(new jsMaps.PolygonOptions(),parameters);
        }

        var polygon = this.object.polygon(map,parameters);

        if (parameters.polygonId == null && polygon.polygonId == null) {
            this.polygonIdCounter++;
            polygon.polygonId = this.polygonIdCounter;
        } else if (parameters.polygonId != null && polygon.polygonId == null) {
            polygon.polygonId = parameters.polygonId;
        }

        map.parent.polygons.push(polygon);

        return polygon;
    },

    /**
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.CircleOptions} parameters
     * @returns jsMaps.CircleStructure
     */
    circle: function (map, parameters) {
        if (typeof parameters != 'undefined') {
            parameters = jsMaps.merge(new jsMaps.PolygonOptions(),parameters);
        }

        var circle = this.object.circle(map,parameters);

        if (parameters.circleId == null && circle.circleId == null) {
            this.polygonIdCounter++;
            circle.circleId = this.polygonIdCounter;
        } else if (parameters.circleId != null && circle.circleId == null) {
            circle.circleId = parameters.circleId;
        }

        map.parent.polygons.push(circle);

        return circle;
    },

    removePolyLine: function (map,PolyLineIds) {
        var checkPolyLine = (typeof PolyLineIds != 'undefined');
        var object = map.parent;

        for (var i in object.polyLines) {
            if (object.polyLines.hasOwnProperty(i) == false) continue;

            /**
             * @type jsMaps.PolyLineStructure
             */
            var polyLineItem = object.polyLines[i];

            if (checkPolyLine == true && PolyLineIds.indexOf(polyLineItem.polyLineId)) {
                polyLineItem.removeLine();
                delete object.polyLines[i];
            } else if (checkPolyLine == false) {
                polyLineItem.removeLine();
                delete object.polyLines[i];
            }
        }

        if (object.polyLines.length == 0) object.polyLines = [];
    },

    removePolygon: function (map,PolygonIds) {
        var checkPolyLine = (typeof PolygonIds != 'undefined');
        var object = map.parent;

        for (var i in object.polygons) {
            if (object.polygons.hasOwnProperty(i) == false) continue;

            /**
             * @type jsMaps.PolygonStructure
             */
            var polygonItem = object.polygons[i];

            if (checkPolyLine == true && PolygonIds.indexOf(polygonItem.polygonId)) {
                polygonItem.removePolyGon();
                delete object.polygons[i];
            } else if (checkPolyLine == false) {
                polygonItem.removePolyGon();
                delete object.polygons[i];
            }
        }

        if (object.polygons.length == 0) object.polygons = [];
    },

    /**
     *
     * @param provider
     * @param {jsMaps.staticMapOptions} parameters
     * @param {jsMaps.staticMapMarker[]} markers
     * @param {jsMaps.staticMapPath} path
     */
    staticMap: function (provider,parameters,markers,path) {
        /**
         *
         * @type {jsMaps.Abstract}
         */
        var object = this.fetch_object(provider);
        return object.staticMap(parameters,markers,path);
    },

    /**
     *
     * @param provider
     * @param addressSearch
     * @param {function} fn
     */
    addressSearch: function (provider,addressSearch,fn) {
        /**
         *
         * @type {jsMaps.Abstract}
         */
        var object = this.fetch_object(provider);
        object.addressGeoSearch(addressSearch,fn);
    },

    /**
     *
     * @param provider
     */
    supported_map_providers: function (provider) {
        // Make sure that this is a supported supplier
        if (SUPPORTED_MAP_PROVIDERS.indexOf(provider) < 0) throw "Unsupported maps provider "+provider;
    }

};