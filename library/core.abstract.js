var jsMaps = jsMaps || {};

/**
 *
 * @returns {{position: null, icon: null, title: null, zIndex: null, draggable: boolean, markerId: null}}
 * @constructor
 */
jsMaps.MarkerOptions = function () {
    /**
     * @param {{lat: *, lng: *}
     */
    return {
        position: null,
        icon: null,
        title: null,
        zIndex: null,
        draggable: false,
        markerId: null,
        html: null
    }
};

/**
 *
 * @returns {{content: null, position: null}}
 * @constructor
 */
jsMaps.InfoWindowOptions = function() {
    return {content: null,
    /**
     * @param {{lat: *, lng: *}
     */
    position: null}
};

jsMaps.staticMapOptions = {
    supported_map_types: {'roadmap': 'roadmap','satellite': 'satellite','terrain': 'terrain'},

    /**
     * @param {{lat: *, lng: *}
     */
    center: null,
    zoom: null,
    size: {width: 400,height: 400},
    maptype: 'roadmap'
};

jsMaps.supported_colors = {'black': '000000', 'brown': 'A52A2A', 'green': '008000', 'purple': '800080', 'yellow':'FFFF00', 'blue':'0000FF', 'gray':'808080', 'orange':'FFA500', 'red':'FF0000', 'white':'FFFFFF'};

/**
 *
 * @param color
 * @param label
 * @param lat
 * @param lng
 * @returns {{color: *, label: *, location: {lat: *, lng: *}}}
 */
jsMaps.staticMapMarker = function (color,label, lat, lng) {
    var supported_colors = jsMaps.supported_colors;

    if (typeof supported_colors[color]!='undefined') {
        color = supported_colors[color];
    }

    if (typeof label=='undefined' || label == null) label = '';

    return {
        color: color,
        label: label,
        location: {lat: lat, lng: lng}
    };
};

jsMaps.supported_Address_types = {
    'street_address':'street_address',
    'route':'route',
    'intersection':'intersection',
    'political':'political',
    'country':'country',
    'administrative_area_level_1':'administrative_area_level_1',
    'administrative_area_level_2':'administrative_area_level_2',
    'administrative_area_level_3':'administrative_area_level_3',
    'administrative_area_level_4':'administrative_area_level_4',
    'administrative_area_level_5':'administrative_area_level_5',
    'colloquial_area':'colloquial_area',
    'locality':'locality',
    'ward':'ward',
    'sublocality':'sublocality',
    'neighborhood':'neighborhood',
    'premise':'premise',
    'subpremise':'subpremise',
    'postal_code':'postal_code',
    'natural_feature':'natural_feature',
    'airport':'airport',
    'park':'park',
    'point_of_interest':'point_of_interest'
};

jsMaps.supported_location_types = {
    "ROOFTOP": "ROOFTOP",
    "RANGE_INTERPOLATED": "RANGE_INTERPOLATED",
    "GEOMETRIC_CENTER": "GEOMETRIC_CENTER",
    "APPROXIMATE": "APPROXIMATE"
};

jsMaps.geo = function () {};

jsMaps.geo.Location = function (lat,lng) {
    lat = parseFloat(lat);
    lng = parseFloat(lng);

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
 * @returns {{location: jsMaps.geo.location, view_port: {getTopLeft: {lat: number, lng: number}, getBottomRight: {lat: number, lng: number}, location_type: string}}}
 */
jsMaps.Geometry = function (location, view_port) {
    return {
        location: location, view_port: {
            getTopLeft: view_port.getTopLeft,
            getBottomRight: view_port.getBottomRight,
            location_type: view_port.location_type
        }
    };
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
 * @param fillColor
 */
jsMaps.staticMapPath = function (color, weight ,path, fillColor) {
    var supported_colors = {'black': '000000', 'brown': 'A52A2A', 'green': '008000', 'purple': '800080', 'yellow':'FFFF00', 'blue':'0000FF', 'gray':'808080', 'orange':'FFA500', 'red':'FF0000', 'white':'FFFFFF'};

    if (typeof supported_colors[color]!='undefined') color = supported_colors[color];
    if (typeof supported_colors[fillColor]!='undefined') fillColor = supported_colors[fillColor];

    return {
        color: color,
        weight: weight,
        path: path,
        fillColor: fillColor
    };
};

/**
 *
 * @returns {{clickable: boolean, draggable: boolean, editable: boolean, path: Array, strokeColor: string, strokeOpacity: number, strokeWeight: number, visible: boolean, zIndex: number, polyLineId: string}}
 * @constructor
 */
jsMaps.PolyLineOptions = function () {
    return {
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
    }
};

/**
 *
 * @returns {{clickable: boolean, draggable: boolean, editable: boolean, fillColor: string, fillOpacity: number, radius: number, strokeColor: string, strokeOpacity: number, strokeWeight: number, visible: boolean, zIndex: number, circleId: string, center: {lat: number, lng: number}}}
 * @constructor
 */
jsMaps.CircleOptions = function () {
    return {
        clickable: true,
        draggable: false,
        editable: false,
        fillColor: '',
        fillOpacity: 0.0,
        radius: 0,
        strokeColor: '',
        strokeOpacity: 0.0,
        strokeWeight: 10,
        visible: true,
        zIndex: 1,
        circleId: '',
        center: {lat: 0, lng: 0}
    }
};


/**
 *
 * @returns {{clickable: boolean, draggable: boolean, editable: boolean, fillColor: string, fillOpacity: number, paths: Array, strokeColor: string, strokeOpacity: number, strokeWeight: number, visible: boolean, zIndex: number, polygonId: string}}
 * @constructor
 */
jsMaps.PolygonOptions = function () {
    return {clickable: true,
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
    polygonId: ''}
};

jsMaps.VectorStyle = function () {
    return {
        fillColor: '',
        fillOpacity: '',
        strokeColor: '',
        strokeOpacity: '',
        strokeWeight: '',
        zIndex: ''}
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
         * @param {jsMaps.VectorStyle} parameters

         * @private
         */
        _setStyle: function (parameters) {
        },

        /**
         * @param {jsMaps.VectorStyle} parameters
         */
        setStyle: function (parameters) {
            var options = new jsMaps.VectorStyle();

            if (typeof parameters != 'undefined') {
                parameters = jsMaps.merge(options,parameters);
            }

            this._setStyle(parameters);
        },

        /**
         *
         * @returns {jsMaps.VectorStyle}
         */
        getStyle: function () {
            return new jsMaps.VectorStyle();
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

jsMaps.CircleStructure = function () {
    return {
        object: null,
        circleId: null,
        getBounds: function () {
        },
        getCenter: function () {
        },
        getDraggable: function () {
        },
        getEditable: function () {
        },
        /**
         * @param {jsMaps.VectorStyle} parameters

         * @private
         */
        _setStyle: function (parameters) {
        },

        /**
         * @param {jsMaps.VectorStyle} parameters
         */
        setStyle: function (parameters) {
            var options = new jsMaps.VectorStyle();

            if (typeof parameters != 'undefined') {
                parameters = jsMaps.merge(options,parameters);
            }

            this._setStyle(parameters);
        },
        /**
         *
         * @returns {jsMaps.VectorStyle}
         */
        getStyle: function () {
            return new jsMaps.VectorStyle();
        },

        getRadius: function () {
        },
        getVisible: function () {
        },
        setCenter: function (lat, lng) {
        },
        setDraggable: function (draggable) {
        },
        setEditable: function (editable) {
        },
        /**
         *
         * @param {jsMaps.MapStructure} map
         */
        setMap: function (map) {
        },
        setVisible: function (visible) {
        },
        setRadius: function (radius) {
        },
        removeCircle: function () {
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
         * @param {jsMaps.VectorStyle} parameters

         * @private
         */
        _setStyle: function (parameters) {
        },

        /**
         * @param {jsMaps.VectorStyle} parameters
         */
        setStyle: function (parameters) {
            var options = new jsMaps.VectorStyle();

            if (typeof parameters != 'undefined') {
                parameters = jsMaps.merge(options,parameters);
            }

            this._setStyle(parameters);
        },

        /**
         *
         * @returns {jsMaps.VectorStyle}
         */
        getStyle: function () {
            return new jsMaps.VectorStyle();
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

        setCenter: function (lat, lng, transition) {
        },

        latLngToPoint: function (lat, lng) {
            return {x:0,y:0};
        },

        /**
         *
         * @param {jsMaps.api.options} options
         */
        setOptions: function (options) {

        },

        pointToLatLng: function (x, y) {
            return {lat:0,lng:0};
        },

        setDraggable: function (flag) {
        },

        getViewPort: function () {
            var element = this.getElement();
            return {width: element.offsetWidth,height: element.offsetHeight};
        },

        /**
         * @returns HTMLDivElement
         */
        getElement: function () {
        },

        moveXY: function (x, y) {
            var center = this.getCenter();

            var pixelCenter = this.latLngToPoint(center.lat,center.lng);
            var newPixelCenter = this.pointToLatLng(pixelCenter.x-x,pixelCenter.y-y);

            this.setCenter(newPixelCenter.lat,newPixelCenter.lng, 0);
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
jsMaps.Abstract.prototype.triggerEvent = function(element,eventName) {};

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
 * @param {jsMaps.MarkerOptions} parameters
 * @returns jsMaps.MarkerStructure
 */
jsMaps.Abstract.prototype.marker = function(map,parameters) {};

/**
 *
 * @param {jsMaps.InfoWindowOptions} parameters
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
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.CircleOptions} parameters
 * @returns jsMaps.CircleStructure
 */
jsMaps.Abstract.prototype.circle = function(map,parameters) {};

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

/**
 * Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility
 */
if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function(elt /*, from*/)
    {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++)
        {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

/**
 * http://stackoverflow.com/questions/18020265/object-create-not-supported-in-ie8
 */
if (!Object.create) {
    Object.create = function(o, properties) {
        if (typeof o !== 'object' && typeof o !== 'function') throw new TypeError('Object prototype may only be an Object: ' + o);
        else if (o === null) throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");

        if (typeof properties != 'undefined') throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");

        function F() {}

        F.prototype = o;

        return new F();
    };
}

function FatalError(){ Error.apply(this, arguments); this.name = "FatalError"; }
FatalError.prototype = Object.create(Error.prototype);


jsMaps.Event = function (e,eventName,container) {
    return {
        eventObject: e,
        eventName: eventName,
        container: container,
        getCursorPosition: function () {
            return {lat: 0, lng: 0};
        },

        stopPropagation: function () {
            this.container.propegationStoped[this.getEventName()] = 1;
        },

        getEventName: function () {
            return this.eventName;
        }
    }
};


jsMaps.loader = function(fn) {
    if ( document.addEventListener ) {
        // Use the handy event callback
        document.addEventListener( "DOMContentLoaded", function(){
            document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
            fn();
        }, false );

    } else {
        // ensure firing before onload,
        // maybe late but safe also for iframes
        document.attachEvent("onreadystatechange", function(){
            if ( document.readyState === "complete" ) {
                document.detachEvent( "onreadystatechange", arguments.callee );
                fn();
            }
        });

    }
};

jsMaps.metersPerPixel = function(latitude, zoomLevel) {
    var earthCircumference = 40075017;
    var latitudeRadians = latitude * (Math.PI/180);
    return earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
};

jsMaps.pixelValue = function(latitude, meters, zoomLevel) {
    return meters / jsMaps.metersPerPixel(latitude, zoomLevel);
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

/**
 *
 * @param hex
 * @param opacity
 * @param returnArray
 * @returns {*}
 */
jsMaps.convertHex = function (hex,opacity,returnArray){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    if (returnArray == true) {
        return {red: r, greed: g, blue: b,opacity:opacity/100}
    }

    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
};

/**
 * Thanks to:
 * http://stackoverflow.com/a/5624139
 *
 * @param r
 * @param g
 * @param b
 * @returns {*}
 */
jsMaps.convertRgb = function (r,g,b){
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    return rgbToHex(r,g,b);
};


if (typeof Array.isArray === 'undefined') {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
}

/**
 *  Taken From leaflet js
 *
 * @type {{wrapLng: number[], R: number, distance: Function}}
 */
jsMaps.CRSEarth = {
    wrapLng: [-180, 180],

    R: 6378137,

    // distance between two geographical points using spherical law of cosines approximation
    distance: function (latlng1, latlng2) {
        var rad = Math.PI / 180,
            lat1 = latlng1.lat * rad,
            lat2 = latlng2.lat * rad,
            a = Math.sin(lat1) * Math.sin(lat2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);

        return this.R * Math.acos(Math.min(a, 1));
    }
};

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

if (('ActiveXObject' in window) && !document.addEventListener) {
    Function.prototype.bind = (function () {
    }).bind || function (b) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        function c() {
        }

        var a = [].slice, f = a.call(arguments, 1), e = this, d = function () {
            return e.apply(this instanceof c ? this : b || window, f.concat(a.call(arguments)));
        };
        c.prototype = this.prototype;
        d.prototype = new c();
        return d;
    };
}

jsMaps.centerCalculator = {
    rad2degr: function (rad) {
        return rad * 180 / Math.PI;
    },
    degr2rad: function (degr) {
        return degr * Math.PI / 180;
    },
    /**
     * @param latLngInDegr array of arrays with latitude and longtitude pairs (in degrees)
     *   e.g. [[latitude1, longtitude1], [latitude2][longtitude2] ...]
     *
     * @return array with the center latitude longtitude pair (in degrees)
     */
    getLatLngCenter: function (latLngInDegr) {
        var sumX = 0, sumY = 0, sumZ = 0, lat, lng;

        var LATIDX = 0;
        var LNGIDX = 1;

        for (var i = 0; i < latLngInDegr.length; i++) {
            lat = this.degr2rad(latLngInDegr[i]['lat']);
            lng = this.degr2rad(latLngInDegr[i]['lng']);

            // sum of cartesian coordinates
            sumX += Math.cos(lat) * Math.cos(lng);
            sumY += Math.cos(lat) * Math.sin(lng);
            sumZ += Math.sin(lat);
        }

        var avgX = sumX / latLngInDegr.length;
        var avgY = sumY / latLngInDegr.length;
        var avgZ = sumZ / latLngInDegr.length;

        // convert average x, y, z coordinate to latitude and longtitude
        lng = Math.atan2(avgY, avgX);
        var hyp = Math.sqrt(avgX * avgX + avgY * avgY);
        lat = Math.atan2(avgZ, hyp);

        return ({lat: this.rad2degr(lat).toFixed(6), lng: this.rad2degr(lng).toFixed(6)});
    }
};