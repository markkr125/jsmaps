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
    ie11: ie && !(window.ActiveXObject),
    edge: 'msLaunchUri' in navigator && !('documentMode' in document),
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

jsMaps.Native.Event.leftClick = function(evt) {
    var leftClick = false;
    if (!evt) evt = window.event;
    if (evt.which)  {
        leftClick = (evt.which == 1);
    }
    else if (evt.button) {
        leftClick = (evt.button == 0) || (evt.button == 1);
    }

    return leftClick;
};


jsMaps.Native.Event.stopPropagation = function (evt) {
    if (evt.stopPropagation) {
        evt.stopPropagation(); // The W3C DOM way
    } else {
        window.event.cancelBubble = true; // The IE way
    }
};

jsMaps.Native.Dom = {
    addClass: function (object,className) {
        if (typeof object.className.indexOf == 'function' && object.className.indexOf(className)==-1) {
            object.className += " "+className;
            object.className = object.className.trim();
            object.className = object.className.replace(/\s+/g, ' ');
        }
    },

    removeClass: function (object,className) {
        if (typeof object.className.indexOf == 'function' && object.className.indexOf(className)!=-1) {
            object.className = object.className.replace(className,"");
            object.className = object.className.replace(/"  "/g,"");
            object.className = object.className.replace(/\s+/g, ' ');
        }
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

jsMaps.Native.metersPerPixel = function(latitude, zoomLevel) {
    var earthCircumference = 40075017;
    var latitudeRadians = latitude * (Math.PI/180);
    return earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
};

jsMaps.Native.pixelValue = function(latitude, meters, zoomLevel) {
    return meters / jsMaps.Native.metersPerPixel(latitude, zoomLevel);
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
        if ("onmousewheel" in window) {
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

// this is ridicules
if (jsMaps.Native.Browser.msPointer) {
    jsMaps.Native.Event.mousedown = 'MSPointerDown';
    jsMaps.Native.Event.mouseenter = 'MSPointerMove';
    jsMaps.Native.Event.mouseup = 'MSPointerUp';
    jsMaps.Native.Event.mouseenter = 'MSPointerOver';
    jsMaps.Native.Event.mouseout = 'MSPointerOut';
    jsMaps.Native.Event.mousemove = 'MSPointerHover';
} else if (jsMaps.Native.Browser.pointer) {
    jsMaps.Native.Event.mousedown = 'pointerdown';
    jsMaps.Native.Event.mouseenter = 'pointerenter';
    jsMaps.Native.Event.mouseup = 'pointerup';
    jsMaps.Native.Event.mouseenter = 'pointerover';
    jsMaps.Native.Event.mouseout = 'pointerout';
    jsMaps.Native.Event.mousemove = 'pointermove';
} else {
    jsMaps.Native.Event.mousedown = 'mousedown';
    jsMaps.Native.Event.mouseenter = 'mouseenter';
    jsMaps.Native.Event.mouseup = 'mouseup';
    jsMaps.Native.Event.mouseenter = 'mouseenter';
    jsMaps.Native.Event.mouseout = 'mouseout';
    jsMaps.Native.Event.mousemove = 'mousemove';
}


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


try {
    new CustomEvent("test");
} catch(e) {
    var CustomEvent = function(event, params) {
        var evt;
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };

        evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent; // expose definition to window
}

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

    var eventObj = new CustomEvent(eventName, {detail: {some: 'data'}});

    element.dispatchEvent(eventObj);
};

jsMaps.Native.Event.remove = function (element,eventTrigger,eventHandler) {
    if (element.removeEventListener) {                   // For all major browsers, except IE 8 and earlier
        element.removeEventListener(eventTrigger,eventHandler);
    } else if (element.detachEvent) {                    // For IE 8 and earlier versions
        var trigger = eventTrigger;
        if (eventTrigger == 'mouseenter') trigger = 'onmouseover';
        if (eventTrigger == 'mouseout') trigger = 'onmouseout';
        if (eventTrigger == 'mousemove') trigger = 'onmousemove';
        if (eventTrigger == 'mouseup') trigger = 'onmouseup';
        if (eventTrigger == 'mousedown') trigger = 'onmousedown';
        if (eventTrigger == 'click') trigger = 'onclick';


        element.detachEvent(trigger,eventHandler);
    }
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
     * @param el
     * @param offset
     * @param scale
     */
    setTransform: function (el, offset, scale) {
        var pos = offset || {'x':0,'y':0};

        if (jsMaps.Native.Utils.TRANSFORM != false) {
            el.style[jsMaps.Native.Utils.BACKFACE_VISIBILITY] = 'hidden';

            if (!jsMaps.Native.Browser.any3d) {
                var scaleX = 1;
                var scaleY = 1;

                if (scale) {
                    scaleX = scale;
                    scaleY = scale;
                }

                // targeting only ie9 here, for some reason could not get rid of the blur effect caused by the matrix transform
                if (jsMaps.Native.Browser.ie && !jsMaps.Native.Browser.ielt9) {
                    el.style[jsMaps.Native.Utils.TRANSFORM] = 'matrix(' + scaleX + ', 0, 0, ' + scaleY + ', 0, 0)';
                    el.style.left = pos.x + "px";
                    el.style.top = pos.y + "px";
                } else {
                    el.style[jsMaps.Native.Utils.TRANSFORM] = 'matrix(' + scaleX + ', 0, 0, ' + scaleY + ', ' + parseFloat(pos.x).toFixed(0) + ', ' + parseFloat(pos.y).toFixed(0) + ')';
                    el.style.filter = "blur(0px)";
                    el.style['-webkit-filter'] = "blur(0px)";
                    el.style['-moz-filter'] = "blur(0px)";
                    el.style['-ms-filter'] = "none";
                    el.style['filter'] = "none";
                }
            } else {
                el.style[jsMaps.Native.Utils.TRANSFORM] = 'translate3d(' + parseFloat(pos.x).toFixed(0) + 'px,' + parseFloat(pos.y).toFixed(0) + 'px' + ',0)' + (scale ? ' scale3d(' + scale + ',' + scale + ',1)' : '');
            }
        } else {
            el.style.left = (pos.x) + "px";
            el.style.top = (pos.y) + "px";
            
            var scaleParam = 1;
            if (scale) scaleParam = scale;

            if (scaleParam !== 1) {
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        }
    },

    setTransformOrigin: function (el, offset) {
        if (jsMaps.Native.Utils.TRANSFORM_ORIGIN != false) {
            var pos = offset || {'x': 0, 'y': 0};
            el.style[jsMaps.Native.Utils.TRANSFORM_ORIGIN] = parseFloat(pos.x).toFixed(0) + "px " + parseFloat(pos.y).toFixed(0) + "px";
        }
    }
};

jsMaps.Native.Utils.BACKFACE_VISIBILITY = jsMaps.Native.Utils.testProp(['backfaceVisibility', 'webkitBackfaceVisibility', 'oBackfaceVisibility', 'mozBackfaceVisibility', 'msBackfaceVisibility']);
jsMaps.Native.Utils.TRANSFORM = jsMaps.Native.Utils.testProp(['transform', 'webkitTransform', 'oTransform', 'mozTransform', 'msTransform']);
jsMaps.Native.Utils.TRANSFORM_ORIGIN = jsMaps.Native.Utils.testProp(['transformOrigin', 'webkitTransformOrigin', 'oTransformOrigin', 'mozTransformOrigin', 'msTransformOrigin']);
jsMaps.Native.Utils.TRANSITION = jsMaps.Native.Utils.testProp(['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);
jsMaps.Native.Utils.TRANSITION_END = ((jsMaps.Native.Utils.TRANSITION === 'webkitTransition' || jsMaps.Native.Utils.TRANSITION === 'OTransition') ? jsMaps.Native.Utils.TRANSITION + 'End' : 'transitionend');

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
/*
if (jsMaps.Native.Browser.ie) {
    jsMaps.Native.getScriptSource = function () {
        var scriptSource = (function () {
            var scripts = document.getElementsByTagName('script'),
                script = scripts[scripts.length - 1];

            if (script.getAttribute.length !== undefined) {
                return script.src
            }

            return script.getAttribute('src', -1)
        }());

        var source = scriptSource.split('/');
        source.pop();

        return source.join('/');
    };

    jsMaps.Native.scriptSource = jsMaps.Native.getScriptSource();
}
*/
/**
 * @function
 * @param {Object} object DOM-Element to apply the style="cursor: ....." argument on
 * @param {String} string
 * set cursor for an object via css-style
 * vendor specific cursors
 * or via url
 */
jsMaps.Native.setCursor = function (object, string) {
    if (typeof object.currentCursor != 'undefined' && object.currentCursor == string) return;

    if (jsMaps.Native.Browser.ie) {
        if (string == "grab")
            object.style.cursor = "url('http://jsmaps.net/resources/hand.cur'), default";
        else if (string == "grabbing")
            object.style.cursor = "url('http://jsmaps.net/resources/fist.cur'), move";
        else
            object.style.cursor = "pointer";
    }
    else {
        if (string == "grab") {
            jsMaps.Native.Dom.removeClass(object,'cursor-pointer');
            jsMaps.Native.Dom.removeClass(object,'cursor-grabbing');
            jsMaps.Native.Dom.addClass(object,'cursor-grab');
        } else if (string == "grabbing"){
            jsMaps.Native.Dom.removeClass(object,'cursor-pointer');
            jsMaps.Native.Dom.addClass(object,'cursor-grabbing');
            jsMaps.Native.Dom.removeClass(object,'cursor-grab');
        } else {
            jsMaps.Native.Dom.addClass(object,'cursor-pointer');
            jsMaps.Native.Dom.removeClass(object,'cursor-grabbing');
            jsMaps.Native.Dom.removeClass(object,'cursor-grab');
        }
    }

    object.currentCursor = string;
};

jsMaps.Native.imageNotSelectable = function(el){
    el.style.MozUserSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.webkitUserDrag = 'none';
    el.style.KhtmlUserSelect = 'none';
    el.style.OUserSelect = 'none';
    el.style.userSelect = 'none';
};