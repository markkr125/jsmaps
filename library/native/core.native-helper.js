/**
 *
 * @constructor
 */
jsMaps.Native.Tiles = function () {
    this.Layers = [];

    this.addTileLayer = function (utlStructure, servers, copyright, layerName, maxZoom, minZoom) {
        if (typeof minZoom == 'undefined') minZoom = 1;
        if (typeof maxZoom == 'undefined') maxZoom = 19;

        this.Layers.push ({
            maxzoom: maxZoom,
            minzoom: minZoom,
            layerName: layerName,
            src: function (x, y, z) {
                var index = Math.abs(x + y) % servers.length;
                var server = servers[index];

                return utlStructure.replace('{s}', server).replace('{z}', z).replace('{x}',x).replace('{y}',y);
            },
            copyright: copyright
        });
    };



    this.deleteLayer = function (index) {
        if (typeof this.Layers[index] != 'undefined') delete this.Layers[index];
    }
};

/**
 * Taken from leaflet
 *
 * @constructor
 */
var ua = navigator.userAgent.toLowerCase(),
    doc = document.documentElement,

    ie = 'ActiveXObject' in window,

    webkit = ua.indexOf('webkit') !== -1,
    phantomjs = ua.indexOf('phantom') !== -1,
    android23 = ua.search('android [23]') !== -1,
    chrome = ua.indexOf('chrome') !== -1,
    gecko = ua.indexOf('gecko') !== -1 && !webkit && !window.opera && !ie,

    mobile = typeof orientation !== 'undefined' || ua.indexOf('mobile') !== -1,
    msPointer = !window.PointerEvent && window.MSPointerEvent,
    pointer = (window.PointerEvent && navigator.pointerEnabled && navigator.maxTouchPoints) || msPointer,

    ie3d = ie && ('transition' in doc.style),
    webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
    gecko3d = 'MozPerspective' in doc.style,
    opera12 = 'OTransition' in doc.style;

var touch = !phantomjs && (pointer || 'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch));

jsMaps.Native.Browser = {
    ie: ie,
    ielt9: ie && !document.addEventListener,
    webkit: webkit,
    gecko: gecko,
    android: ua.indexOf('android') !== -1,
    android23: android23,
    chrome: chrome,
    safari: !chrome && ua.indexOf('safari') !== -1,

    ie3d: ie3d,
    webkit3d: webkit3d,
    gecko3d: gecko3d,
    opera12: opera12,
    any3d: (ie3d || webkit3d || gecko3d) && !opera12 && !phantomjs,

    mobile: mobile,
    mobileWebkit: mobile && webkit,
    mobileWebkit3d: mobile && webkit3d,
    mobileOpera: mobile && window.opera,
    mobileGecko: mobile && gecko,

    touch: !!touch,
    msPointer: !!msPointer,
    pointer: !!pointer,

    retina: (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1
};

jsMaps.Native.Array = function(a) {
    var r = [];
    for (var i = 0, l = a.length; i < l; i++) {
        r.push(a[i]);
    }
    return r;
};

// Creates an object called "Event" if one doesn't already exist (IE).
if (!jsMaps.Native.Event) jsMaps.Native.Event = {};

jsMaps.Native.Event.stopPropagation = function (evt) {
    if (evt.stopPropagation) {
        evt.stopPropagation(); // The W3C DOM way
    } else {
        window.event.cancelBubble = true; // The IE way
    }
};

jsMaps.Native.Event.preventDefault = function (evt) {
    // suppress image dragging
    if (evt.preventDefault) {
        evt.preventDefault(); // The W3C DOM way
    } else {
        window.event.returnValue = false; // The IE way
    }
};

/**
 * Attach an event listener to an object.
 *
 * @param o - Object whose event to attach.
 * @param t - Type of jsMaps.Native.Event.
 * @param f - Method to fire when event is raised.
 * @param fc - Context of called method f. Defaults to object o.
 * @param c - Arguments to pass to function f
 */
jsMaps.Native.Event.attach = function (o, t, f, fc, c) {
    var a = (arguments.length > 5 ? jsMaps.Native.Array(arguments).slice(5, arguments.length) : []);
    var fn = function (e) {

        var ev = e || window.event;
        if ( !ev.target ) {
            ev.target = ev.srcElement;
        }

        a.unshift(ev || window.event);
        return f.apply((fc ? fc : o), a);
    };
    if (o.addEventListener) {
        if (navigator.appName.indexOf("Netscape") == -1) {
            if (t == "DOMMouseScroll") {
                t = "mousewheel";
            }
        }
        if (navigator.userAgent.indexOf("Safari") != -1) {
            if (t == "DOMMouseScroll") {
                o.onmousewheel = fn;
            } else {
                o.addEventListener(t, fn, c);
            }
        } else {
            o.addEventListener(t, fn, c);
        }
    } else {
        if (t == "DOMMouseScroll") {
            o.attachEvent("onmousewheel", fn);
        } else {
            o.attachEvent("on" + t, fn);
        }
    }

    return{o:o,type:t,fn:fn,c:c}
};

/**
 * Cancels the event if it is cancelable,
 * without stopping further propagation of the event.
 */
jsMaps.Native.Event.cancel = function(evt) {
    evt.cancelBubble = true;
    if (evt.stopPropagation)
        evt.stopPropagation();
};

/**
 * Prevents further propagation of the current event.
 */
jsMaps.Native.Event.stopEventPropagation = function(evt) {
    if (evt.preventDefault) {
        evt.preventDefault(); // The W3C DOM way
    } else {
        evt.returnValue = false; // The IE way
    }
};

/**
 *
 * @param element
 * @param eventName
 */
jsMaps.Native.Event.trigger = function (element,eventName) {
    if (jsMaps.Native.Browser.ielt9) {
        if (element.nodeType === 1 && element[eventName] >= 0) {
            element[eventName]++;
        }

        return;
    }

    if (eventName == jsMaps.api.supported_events.mouseover) eventName = 'mouseenter';
    if (eventName == jsMaps.api.supported_events.rightclick) eventName = 'contextmenu';
    if (eventName == jsMaps.api.supported_events.tilt_changed) eventName = 'orientationchange';
    var event;
    if (window.CustomEvent) {
        event = new CustomEvent(eventName, {detail: {some: 'data'}});
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, true, true, {some: 'data'});
    }

    element.dispatchEvent(event);
};

jsMaps.Native.Event.remove = function (element,eventTrigger) {
    element.removeEventListener(eventTrigger, function () {});
};

jsMaps.Native.Utils = {
    testProp: function (props) {
        var style = document.documentElement.style;

        for (var i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    },
    /**
     * http://www.useragentman.com/IETransformsTranslator/
     * http://www.boogdesign.com/b2evo/index.php/element-rotation-ie-matrix-filter?blog=2
     * @param el
     * @param offset
     * @param scale
     */
    setTransform: function (el, offset, scale) {
        var pos = offset || {'x':0,'y':0};

        el.style[jsMaps.Native.Utils.BACKFACE_VISIBILITY] = 'hidden';
        el.style[jsMaps.Native.Utils.TRANSFORM] =
                (jsMaps.Native.Browser.ie3d ? 'translate(' + pos.x + 'px,' + pos.y + 'px' + ')' + (scale ? ' scale(' + scale + ')' : '') : 'translate3d(' + parseFloat(pos.x).toFixed(0) + 'px,' + parseFloat(pos.y).toFixed(0) + 'px' + ',0)') + (scale ? ' scale3d(' + scale + ',' + scale + ',1)' : '');
    },

    setTransformOrigin: function (el, offset) {
        var pos = offset || {'x': 0, 'y': 0};
        el.style[jsMaps.Native.Utils.TRANSFORM_ORIGIN] = pos.x + "px " + pos.y + "px";
    }
};

jsMaps.Native.Utils.BACKFACE_VISIBILITY = jsMaps.Native.Utils.testProp(['backfaceVisibility', 'webkitBackfaceVisibility', 'oBackfaceVisibility', 'mozBackfaceVisibility', 'msBackfaceVisibility']);
jsMaps.Native.Utils.TRANSFORM = jsMaps.Native.Utils.testProp(['transform', 'webkitTransform', 'oTransform', 'mozTransform', 'msTransform']);
jsMaps.Native.Utils.TRANSFORM_ORIGIN = jsMaps.Native.Utils.testProp(['transformOrigin', 'webkitTransformOrigin', 'oTransformOrigin', 'mozTransformOrigin', 'msTransformOrigin']);

/*
* This is a horrible pile of code, but needed for damn ie8
*/
jsMaps.Native.IeTransform = function () {
    var ORIGIN_PATTERN = /\s*(-?[0-9.]+)(%?)\s+(-?[0-9.]+)(%?)\s*/;
    var TRANSFORM_PATTERNS = [
        /(matrix)\(\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*\)/,
        /(translate)\(\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*\)/,
        /(rotate|skew[XY])\(\s*(-?[0-9.]+)(deg|g?rad|turn)\s*\)/,
        /(scale)\(\s*(-?[0-9.]+)(%?)\s*(?:,\s*(-?[0-9.]+)(%?)\s*)\)/
    ];

    var TRANSFORM_FUNCTIONS = {
        matrix: function (v0, v1, v2, v3, dx, dy) {
            return [ v0, v1, v2, v3, dx, dy ];
        },
        translate: function (dx, dy) {
            return [ 1, 0, 0, 1, dx, dy ];
        },
        rotate: function (value, unit) {
            var angle = parseAngle(value, unit);
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            return [ cos, -sin, sin, cos, 0, 0 ];
        },
        skewX: function (value, unit) {
            return [ 1, 0, Math.tan(parseAngle(value, unit)), 1, 0, 0 ];
        },
        skewY: function (value, unit) {
            return [ 1, Math.tan(parseAngle(value, unit)), 0, 1, 0, 0 ];
        },
        scale: function (x, unitx, y, unity) {
            var fx = parseFactor(x, unitx);
            var fy = sy === undefined ? fx : parseFactor(y, unity);
            return [ fx, 0, 0, fy, 0, 0 ];
        }
    };

    function parseAngle(value, unit) {
        return {
                'deg': Math.PI / 180,
                'grad': Math.PI / 200,
                'turn': Math.PI * 2,
                'rad': 1
            }[unit] * value;
    }

    function parseFactor(value, unit) {
        return (unit === '%') ? value / 100 : value * 1;
    }

    function mfilter(M) {
        return ( 'progid:DXImageTransform.Microsoft.Matrix('
        + 'M11=' + M[0] + ','
        + 'M12=' + M[2] + ','
        + 'M21=' + M[1] + ','
        + 'M22=' + M[3] + ',SizingMethod=\'auto expand\')' );
    }

    /* simplified matrix multiplication
     * for 3x3 matrices of the form
     * / v0 v1 0 \
     * | v2 v3 0 |
     * \ dx dy 1 /
     * each matrix is supplied as a 6-vector
     * containing the values v0 to v3, dx and dy
     */
    function mmult(M1, M2) {
        return [ M1[0]*M2[0] + M1[1]*M2[2], M1[0]*M2[1] + M1[1]*M2[3],
            M1[2]*M2[0] + M1[3]*M2[2], M1[2]*M2[1] + M1[3]*M2[3],
            M1[4]*1     + M2[4]*1,     M1[5]*1     + M2[5]*1 ];
    }

    function adjustStylePx(element, property, delta) {
        element.style[property] = (delta|parseInt(element.currentStyle[property], 10)|0) + 'px';
    }

    function adjustElementPosition(element, matrix, origin) {
        var x = element.clientWidth * origin.x;
        var y = element.clientHeight * origin.y;
        var left = -x;
        var right = element.clientWidth - x;
        var top = -y;
        var bottom = element.clientHeight - y;

        var f = [
            matrix[0] * left,
            matrix[0] * right,
            matrix[2] * top,
            matrix[2] * bottom,
            matrix[1] * left,
            matrix[1] * right,
            matrix[3] * top,
            matrix[3] * bottom
        ];

        var minx = Math.min(f[0], f[1]) + Math.min(f[2], f[3]);
        var miny = Math.min(f[4], f[5]) + Math.min(f[6], f[7]);
        var maxx = Math.max(f[0], f[1]) + Math.max(f[2], f[3]);
        var maxy = Math.max(f[4], f[5]) + Math.max(f[6], f[7]);

        if (element.currentStyle.position !== 'absolute') {
            element.style.position = 'relative';
        }

        /* divide by two because IEs transform origin is always .5 .5 */
        adjustStylePx(element, 'marginLeft', (minx - left)/2);
        adjustStylePx(element, 'marginTop', (miny - top)/2);
        adjustStylePx(element, 'marginRight', (right - maxx)/2);
        adjustStylePx(element, 'marginBottom', (bottom - maxy)/2);

        adjustStylePx(element, 'left', matrix[4]);
        adjustStylePx(element, 'top', matrix[5]);
    }

    this.applyTransform = function (rule, transform, transformOrigin) {
        var i, match, offset, elements;
        var matrix = [ 1, 0, 0, 1, 0, 0 ];
        var origin = { x: 0.5, y: 0.5 };

        for (i=0; i<TRANSFORM_PATTERNS.length; i++) {
            offset = 0;
            while ((match = TRANSFORM_PATTERNS[ i ].exec(transform.substr(offset)))) {
                offset += match.shift().length;
                matrix = mmult( matrix, TRANSFORM_FUNCTIONS[ match.shift() ].apply(null, match) );
            }
        }
        if ((match = ORIGIN_PATTERN.exec(transformOrigin))) {
            origin.x = parseFactor(match[1], match[2]);
            origin.y = parseFactor(match[3], match[4]);
        }

        elements = document.querySelectorAll(rule.selectorText);
        for (i=0; i < elements.length; i++) {
            adjustElementPosition(elements[i], matrix, origin);
        }

        rule.style.filter = mfilter(matrix);

    };
};

/**
 * An area defined by 2 Points
 *
 * @param southwest
 * @param northeast
 * @constructor
 */
jsMaps.Native.InnerBounds = function (southwest, northeast) {
    this.southwest = southwest;
    this.northeast = northeast;
    this.center = new jsMaps.geo.Location((southwest.lat + northeast.lat) / 2, (southwest.lng + northeast.lng) / 2);

    this.sw = function () {
        return this.southwest;
    };

    this.ne = function () {
        return this.northeast;
    };

    /**
     * Taken From leafLet js
     *
     * http://leafletjs.com/
     *
     * @param obj
     * @returns {*}
     */
    this.extend = function (obj) { // (LatLng) or (LatLngBounds)
        var sw = this.southwest,
            ne = this.northeast,
            sw2, ne2;

        sw2 = obj;
        ne2 = obj;

        if (this.southwest.lat == 0 && this.southwest.lng == 0) sw = false;
        if (this.northeast.lat == 0 && this.northeast.lng == 0) ne = false;

        if (!sw && !ne) {
            this.southwest = new jsMaps.geo.Location(sw2.lat, sw2.lng);
            this.northeast = new jsMaps.geo.Location(ne2.lat, ne2.lng);
        } else {
            sw.lat = Math.min(sw2.lat, sw.lat);
            sw.lng = Math.min(sw2.lng, sw.lng);
            ne.lat = Math.max(ne2.lat, ne.lat);
            ne.lng = Math.max(ne2.lng, ne.lng);

            this.southwest = sw;
            this.northeast = ne;
        }

        this.center = new jsMaps.geo.Location((sw.lat + ne.lat) / 2, (sw.lng + ne.lng) / 2);
        return this;
    };

    this.getCenter = function () {
        return this.center;
    };

    this.getOpticalCenter = function (themap) {
        var swXY = themap.latlngToXY(this.southwest,1);
        var neXY = themap.latlngToXY(this.northeast,1);
        var centerX = Math.abs(swXY["x"] + neXY["x"]) / 2;
        var centerY = Math.abs(swXY["y"] + neXY["y"]) / 2;
        return themap.XYTolatlng(centerX, centerY);
    };

    this.getZoomLevel = function (themap) {
        var origZoom = themap.getZoom();
        var swXY = themap.latlngToXY(this.southwest);
        var neXY = themap.latlngToXY(this.northeast);
        var dx = Math.abs(swXY["x"] - neXY["x"]);
        var dy = Math.abs(swXY["y"] - neXY["y"]);
        var zoomX = themap.width / dx;
        var zoomY = themap.height / dy;

        var zoom;
        if (zoomX > zoomY) zoom = zoomY;
        if (zoomX <= zoomY) zoom = zoomX;

        var dzoom = (Math.log(zoom)) / (Math.log(2));
        var newzoom = origZoom + dzoom;
        return (newzoom);
    };

    this.getDistance = function () {
        return distance(this.southwest.lat, this.southwest.lng, this.northeast.lat, this.northeast.lng);
    };

    this.getDistanceText = function () {
        var d = parseFloat(distance(this.southwest.lat, this.southwest.lng, this.northeast.lat, this.northeast.lng));

        if (d < 1000) {
            return Math.round(d) + "m";
        }

        var km;

        if (d < 10000) {
            km = Math.round(d / 10) / 100;
            return km + "km";
        }
        if (d < 100000) {
            km = Math.round(d / 100) / 10;
            return km + "km";
        }
        km = Math.round(d / 1000);
        return km + "km";
    };

    this.getInnerRadius = function () {
        var w = distance(this.center.lat, this.southwest.lng, this.center.lat, this.northeast.lng);
        var h = distance(this.southwest.lat, this.center.lng, this.northeast.lat, this.center.lng);
        if (w > h) {
            return h / 2;
        } else {
            return w / 2;
        }
    };

    function distance(latdeg1, lngdeg1, latdeg2, lngdeg2) {
        //Umrechnung von Grad auf Radian
        var lat1 = latdeg1 * Math.PI / 180;
        var lng1 = lngdeg1 * Math.PI / 180;
        var lat2 = latdeg2 * Math.PI / 180;
        var lng2 = lngdeg2 * Math.PI / 180;

        //Eigentliche Berechnung
        var w = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)) * 180 / Math.PI;
        return w / 360 * 40000 * 1000; //in meter
    }
};

/**
 *  Taken From leaflet js
 *
 * @type {{wrapLng: number[], R: number, distance: Function}}
 */
jsMaps.Native.CRSEarth = {
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

/**
 * @param parentElement
 * @param className
 * @returns {HTMLElement}
 * @constructor
 */
jsMaps.Native.CreateDiv  = function (parentElement,className) {
    var scaleDiv = document.createElement("div");
    scaleDiv.className += className;

    parentElement.appendChild(scaleDiv);
    return scaleDiv;
};

/**
 * Ugly solution for mouseout i found online, should work for now
 * TODO: find a better solution for this
 *
 * @param elem
 * @returns {Array}
 * @constructor
 */
jsMaps.Native.TraverseChildren = function (elem){
    var children = [];
    var q = [];
    q.push(elem);
    while (q.length>0)
    {
        var elem = q.pop();
        children.push(elem);
        pushAll(elem.children);
    }
    function pushAll(elemArray){
        for(var i=0;i<elemArray.length;i++)
        {
            q.push(elemArray[i]);
        }

    }
    return children;
};

/**
 * @return {boolean}
 */
jsMaps.Native.MakeMouseOutFn = function(elem,event){
    var list = this.TraverseChildren(elem);

    var e = event.toElement || event.relatedTarget;
    return !~list.indexOf(e);
};


jsMaps.Native.overlaps = function(bounds1, bounds2) {
    return !(bounds1.sw().lng > bounds2.ne().lng || bounds1.ne().lng < bounds2.sw().lng ||
    bounds1.sw().lat > bounds2.ne().lat || bounds1.ne().lat < bounds2.sw().lat);
};

/**
 * @function
 * @param {Object} object DOM-Element to apply the style="cursor: ....." argument on
 * @param {String} string
 * set cursor for an object via css-style
 * vendor specific cursors
 * or via url
 */
jsMaps.Native.setCursor = function (object, string) {
    // Internet Explorer
    if (navigator.userAgent.indexOf("MSIE") != -1) {	// tested on IE6 and IE8
        if (string == "grab")
            object.style.cursor = "default";
        else if (string == "grabbing")
            object.style.cursor = "move";
        else
            object.style.cursor = "pointer";
    }
    // others
    else {
        object.style.cursor = "-moz-" + string;			// tested on firefox 3.6
        if (object.style.cursor != "-moz-" + string) {
            object.style.cursor = "-webkit-" + string;		// tested on safari 5 and chrome 12
            if (object.style.cursor != "-webkit-" + string) {
                object.style.cursor = "-ms-" + string;
                if (object.style.cursor != "-ms-" + string) {		// missing, not sure if it works
                    object.style.cursor = "-khtml-" + string;
                    if (object.style.cursor != "-khtml-" + string) {		// missing, not sure if it works
                        object.style.cursor = string;
                        if (object.style.cursor != string) {
                            object.style.cursor = "pointer";
                        }
                    }
                }
            }
        }
    }
};

jsMaps.Native.imageNotSelectable = function(el){
    el.style.MozUserSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.webkitUserDrag = 'none';
    el.style.KhtmlUserSelect = 'none';
    el.style.OUserSelect = 'none';
    el.style.userSelect = 'none';
};