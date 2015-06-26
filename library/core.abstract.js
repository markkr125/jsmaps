var jsMaps = jsMaps || {};

jsMaps.markerOptions = {
    /**
     * @param {{lat: *, lng: *}
     */
    position: null,
    icon: null,
    title: null,
    zIndex: null,
    draggable: false,
    markerId: null
};

jsMaps.infoWindowOptions = {
    content: null,
    /**
     * @param {{lat: *, lng: *}
     */
    position: null
};

jsMaps.staticMapOptions = {
    supported_map_types: ['roadmap','satellite','terrain'],

    /**
     * @param {{lat: *, lng: *}
     */
    center: null,
    zoom: null,
    size: {width: 400,height: 400},
    maptype: 'roadmap'
};

/**
 *
 * @param color
 * @param label
 * @param lat
 * @param lng
 * @returns {{color: *, label: *, location: {lat: *, lng: *}}}
 */
jsMaps.staticMapMarker = function (color,label, lat, lng) {
    var supported_colors = {'black': '000000', 'brown': 'A52A2A', 'green': '008000', 'purple': '800080', 'yellow':'FFFF00', 'blue':'0000FF', 'gray':'808080', 'orange':'FFA500', 'red':'FF0000', 'white':'FFFFFF'};

    if (typeof supported_colors[color]!='undefined') color = supported_colors[color];
    if (typeof label=='undefined' || label == null) label = '';

    return {
        color: color,
        label: label,
        location: {lat: lat, lng: lng}
    };
};

jsMaps.supported_Address_types = [
    'street_address',
    'route',
    'intersection',
    'political',
    'country',
    'administrative_area_level_1',
    'administrative_area_level_2',
    'administrative_area_level_3',
    'administrative_area_level_4',
    'administrative_area_level_5',
    'colloquial_area',
    'locality',
    'ward',
    'sublocality',
    'neighborhood',
    'premise',
    'subpremise',
    'postal_code',
    'natural_feature',
    'airport',
    'park',
    'point_of_interest'
];

jsMaps.geo = function () {};
jsMaps.geo.Location = function (lat,lng) {
    return {lat: lat, lng: lng};
};

/**
 *
 * @returns {{getTopLeft: {lat: number, lng: number}, getBottomRight: {lat: number, lng: number}, location_type: string}}
 * @constructor
 */
jsMaps.geo.View_port = function () {
    return {
        getTopLeft: {lat: 0, lng: 0},
        getBottomRight: {lat: 0, lng: 0},
        location_type: ''
    }
};

/**
 *
 * @param {jsMaps.geo.location} location
 * @param {jsMaps.geo.View_port} view_port
 * @returns {{location: jsMaps.geo.location, geometry: jsMaps.geo.View_port}}
 */
jsMaps.Geometry = function (location, view_port) {
    return {location: location, view_port: view_port};
};

/**
 *
 * @param address
 * @param {[]} result_type
 * @param {boolean} partial
 * @param geometry
 * @returns {{}}
 * @constructor
 */
jsMaps.AddressSearchResult = function (address,result_type,partial,geometry) {
    return {address: address, result_type: result_type, partial: partial, geometry: geometry};
};

/**
 *
 * @param color
 * @param weight
 * @param path
 * @returns {{color: *, weight: *, path: {lat: number, lng: number}[]}}
 */
jsMaps.staticMapPath = function (color, weight ,path) {
    var supported_colors = {'black': '000000', 'brown': 'A52A2A', 'green': '008000', 'purple': '800080', 'yellow':'FFFF00', 'blue':'0000FF', 'gray':'808080', 'orange':'FFA500', 'red':'FF0000', 'white':'FFFFFF'};

    if (typeof supported_colors[color]!='undefined') color = supported_colors[color];

    return {
        color: color,
        weight: weight,
        path: path
    };
};

jsMaps.PolyLineOptions = {
    clickable: true,
    draggable: false,
    editable: false,
    path: [],
    strokeColor: '',
    strokeOpacity: 0.0,
    strokeWeight: 1,
    visible: true,
    zIndex: 0,
    polyLineId: ''
};

jsMaps.PolygonOptions = {
    clickable: true,
    draggable: false,
    editable: false,
    fillColor: '',
    fillOpacity: 0.0,
    paths: [],
    strokeColor: '',
    strokeOpacity: 0.0,
    strokeWeight: 10,
    visible: true,
    zIndex: 1,
    polygonId: ''
};

jsMaps.PolyLineStructure = function () {
    return {
        object: null,
        polyLineId: null,
        getDraggable: function () {
        },
        getEditable: function () {
        },

        /**
         *
         * @returns {{lat: string, lng: string}[]}
         */
        getPath: function () {
            return [];
        },

        getVisible: function () {
        },

        /**
         *
         * @param draggable
         */
        setDraggable: function (draggable) {
        },

        setEditable: function (editable) {
        },

        setPath: function (pathArray) {
        },

        /**
         *
         * @param {jsMaps.MapStructure} map
         */
        setMap: function (map) {
        },

        setVisible: function (visible) {
        },

        removeLine: function () {
        }
    }
};

jsMaps.PolygonStructure = function () {
    return {
        object: null,
        polygonId: null,
        getDraggable: function () {
        },
        getEditable: function () {
        },

        /**
         *
         * @returns {{lat: string, lng: string}[]}
         */
        getPath: function () {
            return [];
        },

        /**
         *
         * @returns {{lat: string, lng: string}[]}
         */
        getPaths: function () {
            return [];
        },

        getVisible: function () {
        },

        /**
         *
         * @param draggable
         */
        setDraggable: function (draggable) {
        },

        setEditable: function (editable) {
        },

        setPath: function (pathArray) {
        },

        setPaths: function (pathsArray) {
        },

        /**
         *
         * @param {jsMaps.MapStructure} map
         */
        setMap: function (map) {
        },

        setVisible: function (visible) {
        },

        removePolyGon: function () {
        }
    }
};

jsMaps.BoundsStructure = function () {
    return {
        bounds: null,

        addLatLng: function (lat, lng) {
        },
        /**
         * @returns {{lat: *, lng: *}}
         */
        getCenter: function () {
        },

        /**
         * @returns {{lat: *, lng: *}}
         */
        getTopLeft: function () {
        },

        /**
         * @returns {{lat: *, lng: *}}
         */
        getBottomRight: function () {
        }
    }
};

jsMaps.MapStructure = function () {
    return {
        object: null,

        /**
         * @type jsMaps.Abstract
         */
        parent: null,

        getCenter: function () {
        },

        setCenter: function (lat, lng) {
        },

        /**
         * @returns jsMaps.BoundsStructure
         */
        getBounds: function () {
        },

        getZoom: function () {
        },

        setZoom: function (number) {
        },

        /**
         *
         * @param {jsMaps.BoundsStructure} bounds
         */
        fitBounds: function (bounds) {
        }
    }
};

jsMaps.InfoWindowStructure = function () {
    return {
        object: null,

        /**
         *
         * @returns {{lat: *, lng: *}}
         */
        getPosition: function() {
        },

        setPosition: function (lat, lng) {
        },

        close: function() {
        },

        setContent: function(content) {
        },

        /**
         *
         * @param {jsMaps.MapStructure} map
         * @param {jsMaps.MarkerStructure} marker
         */
        open: function(map,marker) {

        }
    }
};

jsMaps.MarkerStructure = function () {
    return {
        object: null,
        markerId: null,

        /**
         *
         * @returns {{lat: *, lng: *}}
         */
        getPosition: function () {
        },

        setPosition: function (lat, lng) {
        },

        getVisible: function () {
        },

        setVisible: function (variable) {
        },

        /**
         * @returns jsMaps.BoundsStructure
         */
        getIcon: function () {
        },

        setIcon: function (icon) {
        },

        getZIndex: function () {
        },

        setZIndex: function (number) {
        },

        setDraggable: function (flag) {
        },

        remove: function () {
        }
    }
};

jsMaps.Abstract = function(mapDomDocument){};
jsMaps.Abstract.prototype.markers = [];
jsMaps.Abstract.prototype.polyLines = [];
jsMaps.Abstract.prototype.polygons = [];

/**
 *
 * @param mapDomDocument
 * @param options
 * @param providerOptions
 *
 * @returns jsMaps.MapStructure
 */
jsMaps.Abstract.prototype.initializeMap = function(mapDomDocument,options,providerOptions) {};
jsMaps.Abstract.prototype.attachEvent = function(content,event,fn,once) {};
jsMaps.Abstract.prototype.removeEvent = function(map,eventObject) {};

/**
 *
 * @param map
 * @returns jsMaps.BoundsStructure
 */
jsMaps.Abstract.prototype.bounds = function(map) {
    return jsMaps.BoundsStructure;
};

/**
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.markerOptions} parameters
 * @returns jsMaps.MarkerStructure
 */
jsMaps.Abstract.prototype.marker = function(map,parameters) {};

/**
 *
 * @param {jsMaps.infoWindowOptions} parameters
 * @returns jsMaps.InfoWindowStructure
 */
jsMaps.Abstract.prototype.infoWindow = function(parameters) {};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolyLineOptions} parameters
 * @returns jsMaps.PolyLineStructure
 */
jsMaps.Abstract.prototype.polyLine = function(map,parameters) {};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolygonOptions} parameters
 * @returns jsMaps.PolygonStructure
 */
jsMaps.Abstract.prototype.polygon = function(map,parameters) {};

/**
 * @param {jsMaps.staticMapOptions} parameters
 * @param {jsMaps.staticMapMarker[]} markers
 * @param {jsMaps.staticMapPath} path
 * @returns string
 */
jsMaps.Abstract.prototype.staticMap = function(parameters,markers,path) {};

/**
 *
 * @param search
 * @param {function} fn
 */
jsMaps.Abstract.prototype.addressGeoSearch = function(search,fn) {};

jsMaps.loader = function(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

jsMaps.merge = function (obj1, obj2) {
    for (var p in obj2) {
        if (obj2.hasOwnProperty(p) == false) continue;

        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor == Object) {
                obj1[p] = jsMaps.merge(obj1[p], obj2[p]);

            } else {
                obj1[p] = obj2[p];

            }
        } catch (e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];

        }
    }
    return obj1;
};

jsMaps.callUrlJson = function(url, callback){
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status >= 200 && this.status < 400) {
                callback(JSON.parse(this.responseText));
            }
        }
    };

    request.send();
    request = null;
};

jsMaps.addEventListener = function (el, eventName, handler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, handler);
    } else {
        el.attachEvent('on' + eventName, function(){
            handler.call(el);
        });
    }
};
jsMaps.removeEventListener = function (el, eventName, handler) {
    if (el.removeEventListener)
        el.removeEventListener(eventName, handler);
    else
        el.detachEvent('on' + eventName, handler);
};

jsMaps.convertHex = function (hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
};

if (typeof Array.isArray === 'undefined') {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
}