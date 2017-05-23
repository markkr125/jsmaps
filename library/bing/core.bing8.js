if (typeof jsMaps.Bing == 'undefined') {
    jsMaps.Bing = function(mapDomDocument) {};
    jsMaps.Bing.prototype = new jsMaps.Abstract();
}

/**
 * This parameter will state if the window was loaded or not
 *
 * @type {boolean}
 */
jsMaps.Bing.windowInitializedFinished = false;

/**
 * To load bing maps properly, we need to wait until the window is fully loaded
 *
 * This little magic trick will make sure we don't call bing related functions before the window is fully loaded.
 *
 * @param fn
 * @param context
 */
jsMaps.Bing.ready = function (fn,context) {
    if (jsMaps.Bing.windowInitializedFinished == false) {
        window.addEventListener('load', function () {
            jsMaps.Bing.windowInitializedFinished = true;
            fn.bind(context)();
        }, false);

        return;
    }

    fn.bind(context)();
};

jsMaps.Bing.cnt = 0;
jsMaps.Bing.attachedEvents = {};

/**
 * Helper function, this should allow us to hide certain parts of the map, that bing cannot hide after the map was initialized.
 *
 * @param boolOption
 * @param elementSelector
 * @param parent
 */
jsMaps.Bing.toggleDisplay = function (boolOption,elementSelector,parent) {
    var requestedDoc = parent.querySelector(elementSelector);

    if (requestedDoc != null) {
        if (boolOption == true) {
            // Change the display setting to the original display setting
            if (typeof requestedDoc.originalDisplay != 'undefined') {
                requestedDoc.style.display = requestedDoc.originalDisplay;
            }
        } else {
            if (typeof requestedDoc.originalDisplay == 'undefined') {
                requestedDoc.originalDisplay = requestedDoc.style.display;
            }

            requestedDoc.style.display = 'none';
        }
    }
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
    var hooking = function() {};
    hooking.prototype = new jsMaps.MapStructure();

    jsMaps.Bing.ready (function () {
        var myOptions = {
            credentials: jsMaps.config.bing.key,
            zoom: options.zoom,
            center: new Microsoft.Maps.Location(options.center.latitude, options.center.longitude),
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            showMapTypeSelector: options.map_type,
            showScalebar: options.scale_control,
            disablePanning: false,
            disableScrollWheelZoom: (options.mouse_scroll == false),
            showZoomButtons: options.zoom_control,
            disableStreetside: (options.street_view == false)
        };

        if (typeof providerOptions != 'undefined') {
            myOptions = jsMaps.merge(myOptions,providerOptions);
        }


        hooking.prototype.object = new Microsoft.Maps.Map(mapDomDocument, myOptions);
    });

    hooking.prototype.__className = 'MapStructure';
    hooking.prototype.MapCenter = {lat: options.center.latitude,lng: options.center.longitude};
    hooking.prototype.MapZoom = options.zoom;
    hooking.prototype.mapDomDocument = mapDomDocument;

    hooking.prototype.getCenter = function () {
        if (this.object == null) {
            return {lat: this.MapCenter.lat, lng: this.MapCenter.lng};
        }

        var center = this.object.getCenter();
        return {lat:center.latitude, lng: center.longitude};
    };

    hooking.prototype.getElement = function () {
        if (this.object == null) {
            return this.mapDomDocument;
        }

        return this.object.getRootElement();
    };

    /**
     * @param {jsMaps.api.options} options
     */
    hooking.prototype.setOptions = function (options) {
        jsMaps.Bing.ready(function () {
            // Currently, only this option we use that can be modified by bing setOptions function.,
            var opts = {};
            if (typeof options.mouse_scroll != 'undefined') opts.disableScrollWheelZoom = (options.mouse_scroll == false);
            this.object.setOptions(opts);

            // To updating these options we need to call a special function
            var view = {};
            if (typeof options.center != 'undefined' && typeof options.center.latitude != 'undefined' && typeof options.center.longitude != 'undefined') view.center = new Microsoft.Maps.Location(options.center.latitude, options.center.longitude);
            if (typeof options.zoom != 'undefined') view.zoom = options.zoom;
            this.object.setView(view);

            // Trigger events for zoom change and center change


            // These options can be set only on the constructor, so we will need to use some tricks to make this work.
            // Wishful thinking: As this is a "great" idea, these trick will not backfire.
            if (typeof options.street_view != 'undefined') {
                // Didn't get the "Streetside" feature on my map, so no touching this right now.
            }

            if (typeof options.scale_control != 'undefined') {
                jsMaps.Bing.toggleDisplay(options.scale_control,"#ScaleBarId",this.getElement());
            }

            if (typeof options.map_type != 'undefined') {
                jsMaps.Bing.toggleDisplay(options.map_type,"#MapStyleSelector",this.getElement());
            }

            if (typeof options.zoom_control != 'undefined') {
                jsMaps.Bing.toggleDisplay(options.zoom_control,"#ZoomOutButton",this.getElement());
                jsMaps.Bing.toggleDisplay(options.zoom_control,"#ZoomInButton",this.getElement());
            }
        },this);
    };

    hooking.prototype.setDraggable = function (flag) {
        jsMaps.Bing.ready(function () {
            this.object.setOptions({disablePanning: !flag});
        },this);
    };

    hooking.prototype.latLngToPoint = function (lat, lng) {
        if (this.object == null) {
            return  {x: 0,y: 0};
        }

        var xy = this.object.tryLocationToPixel(new Microsoft.Maps.Location(lat, lng),Microsoft.Maps.PixelReference.control);
        return {x: xy.x,y: xy.y}
    };

    hooking.prototype.pointToLatLng = function (x, y) {
        if (this.object == null) {
            return  {lat: 0,lng: 0};
        }

        var pos = this.object.tryPixelToLocation(new Microsoft.Maps.Point(x, y),Microsoft.Maps.PixelReference.control);
        return {lat:pos.latitude,lng:pos.longitude};
    };

    /**
     * The transition parameter will not work, as bing doesn't have this anymore
     *
     * @param lat
     * @param lng
     * @param transition
     */
    hooking.prototype.setCenter = function (lat, lng,transition) {
        this.setOptions({center: {latitude: lat, longitude: lng}});
    };

    hooking.prototype.getZoom = function () {
        if (this.object == null) {
            return this.MapCenter.MapZoom;
        }

        return this.object.getZoom();
    };

    hooking.prototype.setZoom = function (number) {
        this.setOptions({zoom: number});
    };

    hooking.prototype.getBounds = function () {
        return jsMaps.Bing.prototype.bounds(this.object);
    };

    /**
     *
     * @param {jsMaps.BoundsStructure} bounds
     */
    hooking.prototype.fitBounds = function (bounds) {
        jsMaps.Bing.ready(function () {
            bounds.noData();
            var mapOptions = this.object.getOptions();
            mapOptions.bounds = bounds.bounds;

            this.object.setView(mapOptions);
        }, this);
    };

    return new hooking();
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
        if (typeof Microsoft.Maps.LocationRect != 'undefined') {
            bounds = new Microsoft.Maps.LocationRect([]);
        } else {
            bounds = {getTopLeft: {lat: -1,lng: -1},getBottomRight:  {lat: -1,lng: -1}};
        }

    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.BoundsStructure();

    hooking.prototype.bounds = bounds;
    hooking.prototype.nothing = (typeof mapObject == 'undefined' || typeof Microsoft == 'undefined');
    hooking.prototype.arrayPath = [];

    hooking.prototype.noData = function () {
        if (this.nothing == true) {
            for (var i in this.arrayPath) {
                if (this.arrayPath.hasOwnProperty(i) == false) continue;

                if (typeof  this.arrayPath[i].latitude == 'undefined') {
                    this.arrayPath[i] = new Microsoft.Maps.Location(this.arrayPath[i].lat, this.arrayPath[i].lng);
                }
            }

            this.bounds = Microsoft.Maps.LocationRect.fromLocations(this.arrayPath);
            this.nothing = false;
        }
    };

    hooking.prototype.addLatLng = function (lat, lng) {
        if (typeof Microsoft.Maps.Location == 'undefined') {
            this.arrayPath.push({lat:lat, lng:lng});
        } else {
            this.arrayPath.push(new Microsoft.Maps.Location(lat, lng));
        }
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
 * @param content
 * @param event
 * @returns {string}
 */
jsMaps.Bing.eventTranslation = function (content,event) {
    var eventTranslation = '';

    if (content.__className == 'MapStructure') {
        if (event == jsMaps.api.supported_events.bounds_changed || event == jsMaps.api.supported_events.center_changed) eventTranslation = 'viewchangeend'; // Not supported by bing, Binding this to viewchangeend
        if (event == jsMaps.api.supported_events.click) eventTranslation = 'click';
        if (event == jsMaps.api.supported_events.dblclick) eventTranslation = 'dblclick'; // dblclick Not supported by bing, Binding this to click
        if (event == jsMaps.api.supported_events.dragend) eventTranslation = 'viewchangeend';
        if (event == jsMaps.api.supported_events.dragstart) eventTranslation = 'viewchangestart';
        if (event == jsMaps.api.supported_events.drag) eventTranslation = 'viewchange';
        if (event == jsMaps.api.supported_events.idle) eventTranslation = 'viewchangeend'; // Not supported by bing, Binding this to viewchangeend
        if (event == jsMaps.api.supported_events.maptypeid_changed) eventTranslation = 'maptypechanged';
        if (event == jsMaps.api.supported_events.mousemove) eventTranslation = 'mousemove';
        if (event == jsMaps.api.supported_events.mouseout) eventTranslation = 'mouseout';
        if (event == jsMaps.api.supported_events.mouseover) eventTranslation = 'mouseover';
        if (event == jsMaps.api.supported_events.rightclick) eventTranslation = 'rightclick';
        if (event == jsMaps.api.supported_events.tilesloaded|| event == jsMaps.api.supported_events.zoom_changed) eventTranslation = 'viewchangeend'; // Not supported by bing, Binding this to viewchangeend
        if (event == jsMaps.api.supported_events.tilt_changed) eventTranslation = 'viewchangeend'; // Not supported by bing, Binding this to viewchangeend
        if (event == jsMaps.api.supported_events.domready) eventTranslation = 'viewchangeend'; // Not supported by bing, Binding this to viewchangeend
        if (event == jsMaps.api.additional_events.mouseup) eventTranslation = 'mouseup';
        if (event == jsMaps.api.additional_events.mousedown) eventTranslation = 'mousedown';
        if (event == jsMaps.api.additional_events.position_changed) eventTranslation = 'dragend';
    } else {
        if (event == jsMaps.api.supported_events.click) eventTranslation = 'click';
        if (event == jsMaps.api.supported_events.dblclick) eventTranslation = 'dblclick'; // dblclick Not supported by bing, Binding this to click
        if (event == jsMaps.api.supported_events.drag)  eventTranslation = 'drag';
        if (event == jsMaps.api.supported_events.dragend) eventTranslation = 'dragend';
        if (event == jsMaps.api.supported_events.dragstart) eventTranslation = 'dragstart';
        if (event == jsMaps.api.additional_events.position_changed) eventTranslation = 'dragend';
        if (event == jsMaps.api.additional_events.icon_changed) eventTranslation = 'changed';
        if (event == jsMaps.api.additional_events.mousedown)  eventTranslation = 'mousedown';
        if (event == jsMaps.api.supported_events.mouseout)  eventTranslation = 'mouseout';
        if (event == jsMaps.api.supported_events.mouseover)  eventTranslation = 'mouseover';
        if (event == jsMaps.api.additional_events.mouseup) eventTranslation = 'mouseup';
        if (event == jsMaps.api.additional_events.rightclick) eventTranslation = 'rightclick';
    }

    return eventTranslation;
};

/**
 * @returns {boolean|*}
 */
jsMaps.Bing.isTouch = function () {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

/**
 * @param eventTranslation
 * @returns {*}
 */
jsMaps.Bing.customEventTranslation = function (eventTranslation) {
    if (jsMaps.Bing.isTouch()) {
        if (eventTranslation == jsMaps.api.supported_events.click
            || eventTranslation == jsMaps.api.additional_events.mousedown
            || eventTranslation == jsMaps.api.supported_events.mouseover
        ) eventTranslation = 'touchstart';

        if (eventTranslation == jsMaps.api.additional_events.mousemove || eventTranslation == jsMaps.api.supported_events.drag) eventTranslation = 'touchmove';

        if (eventTranslation == jsMaps.api.additional_events.mouseup
            || eventTranslation == jsMaps.api.additional_events.mouseout
        ) eventTranslation = 'touchend';
    }

    if (eventTranslation == jsMaps.api.supported_events.rightclick) eventTranslation = 'contextmenu';
    if (eventTranslation == jsMaps.api.supported_events.mouseover) eventTranslation = 'mouseenter';

    return eventTranslation;
};

/**
 * Attach map events
 *
 * @param content
 * @param event
 * @param functionToExecute
 * @param once
 * @returns {*}
 */
jsMaps.Bing.prototype.attachEvent = function (content,event,functionToExecute,once) {
    var eventTranslation = jsMaps.Bing.eventTranslation(content,event);
    var functionToRun = functionToExecute;

    jsMaps.Bing.cnt++;
    jsMaps.Bing.attachedEvents[jsMaps.Bing.cnt] = null;

    var curCnt = jsMaps.Bing.cnt;

    if (content.__className == 'MapStructure') {
        if (event == jsMaps.api.supported_events.zoom_changed) {
            var localZoom = content.object.getZoom();
            functionToRun = function (event) {

                if(localZoom != content.object.getZoom()){
                    localZoom = content.object.getZoom();

                    functionToExecute(event);
                }
            }
        }

        if (event == jsMaps.api.supported_events.bounds_changed || event == jsMaps.api.supported_events.center_changed) {
            functionToRun = function (ev) {
                if (ev.eventName != event) {
                    return;
                }

                functionToExecute(ev);
            }
        }
    }

    var fn = functionToRun;

    if (eventTranslation == 'click') {
        fn = function (event) {
            if (typeof content.object.clickable != 'undefined' && content.object.clickable == false) {
                return;
            }

            // Implement double click, for some reason microsoft removed it
            if (event == jsMaps.api.supported_events.dblclick) {
                if (typeof this.timeSinceLastClick == 'undefined') {
                    this.timeSinceLastClick = (new Date()).getTime();
                }

                var now = (new Date()).getTime();
                if (now - content.object.timeSinceLastClick < 400) {
                        functionToRun(event);
                }

                this.timeSinceLastClick = (new Date()).getTime();
            } else {
                functionToRun(event);
            }
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

    var eventType = 'bing';

    if (typeof content.__markerType != 'undefined' && content.__markerType == 'domMarker') {
        eventType = 'custom';
    }

    jsMaps.Bing.ready(function () {
        if (eventType == 'custom') {
            var useEvent = jsMaps.Bing.customEventTranslation(event);
            eventTranslation = useEvent;

            if (once) {
                content.object._element.addEventListener(useEvent, function(e) {
                    content.object._element.removeEventListener(useEvent, arguments.callee);
                    return useFn(e);
                });
            } else {
                content.object._element.addEventListener(useEvent, useFn, false);
                jsMaps.Bing.attachedEvents[curCnt] = content.object._element;
            }
        } else {
            if (once) {
                var lister = Microsoft.Maps.Events.addThrottledHandler(content.object,eventTranslation,function (event) {
                    Microsoft.Maps.Events.removeHandler(lister);
                    useFn(event);
                });
            } else {
                jsMaps.Bing.attachedEvents[curCnt] = Microsoft.Maps.Events.addThrottledHandler(content.object,eventTranslation, useFn);
            }
        }
    }, this);

    return {c: curCnt, f: useFn, e: eventTranslation,t: eventType};
};

/**
 * Remove an event listner
 *
 * @param map
 * @param eventObject
 * @returns {*}
 */
jsMaps.Bing.prototype.removeEvent = function (map, eventObject) {
    jsMaps.Bing.ready(function () {
        if (eventObject.t == 'custom') {
            jsMaps.Bing.attachedEvents[eventObject.c].removeEventListener(eventObject.e, eventObject.f);
        } else {
            Microsoft.Maps.Events.removeHandler(jsMaps.Bing.attachedEvents[eventObject.c]);
        }
    }, this);
};

/**
 * Trigger an event
 *
 * @param element
 * @param eventName
 */
jsMaps.Bing.prototype.triggerEvent = function (element,eventName) {
    jsMaps.Bing.ready(function () {
        if (typeof element.__markerType != 'undefined' && element.__markerType == 'domMarker') {
            var useEvent = jsMaps.Bing.customEventTranslation(eventName);

            var eventObj = new CustomEvent(useEvent, {detail: {}});
            element.object._element.dispatchEvent(eventObj);
        } else {
            var eventTranslation = jsMaps.Bing.eventTranslation(element,eventName);

            var dispatchOn = element.object;
            Microsoft.Maps.Events.invoke(dispatchOn,eventTranslation);
        }
    }, this);
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
    var options = {description: parameters.content};
    var position = {lat:0,lng: 0};

    if (parameters.position != null) {
        position = {lat:parameters.position.lat,lng: parameters.position.lng};
    }

    var hooking = function () {
    };

    hooking.prototype = new jsMaps.InfoWindowStructure();
    hooking.openedOnce = false;

    jsMaps.Bing.ready(function () {
        hooking.prototype.object = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(position.lat, position.lng), options);
    }, this);

    hooking.prototype.getPosition = function () {
        if (this.object == null) {
            return {lat: 0, lng: 0};
        }

        var pos = this.object.getLocation();
        return {lat: pos.latitude, lng: pos.longitude}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        jsMaps.Bing.ready(function () {
            this.object.setLocation(new Microsoft.Maps.Location(lat, lng));
        }, this);
    };

    hooking.prototype.close = function () {
        jsMaps.Bing.ready(function () {
            this.object.setOptions({visible: false});
        }, this);
    };

    /**
     *
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.MarkerStructure} marker
     */
    hooking.prototype.open = function (map, marker) {
        jsMaps.Bing.ready(function () {
            var pos = marker.getPosition();
            this.object.setOptions({visible: true});

            this.object.setOptions({offset: marker.object.getAnchor()});
            this.object.setLocation(new Microsoft.Maps.Location(pos.lat, pos.lng));

            this.object.setMap(map.object);
        }, this);
    };

    hooking.prototype.setContent = function (content) {
        jsMaps.Bing.ready(function () {
            this.object.setOptions({description: content});
        }, this);
    };

    return new hooking();
};