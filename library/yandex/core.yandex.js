if (typeof jsMaps.Yandex == 'undefined') {
    jsMaps.Yandex = function (mapDomDocument) {};
    jsMaps.Yandex.prototype = new jsMaps.Abstract();
}

jsMaps.Yandex.MapCenter = {lat: 0,lng: 0};
jsMaps.Yandex.MapZoom = 0;

/**
 * @param {jsMaps.VectorStyle} options
 */
jsMaps.Yandex.VectorStyle =  function (options) {
    if (this.object == null) {
        return;
    }

    ymaps.ready(function () {
        if (options.strokeColor != '') {
            this.object.options.set('strokeColor', options.strokeColor);
            this.options.strokeColor = options.strokeColor;
        }

        if (options.strokeOpacity != '') {
            this.object.options.set('strokeOpacity', options.strokeOpacity);
            this.options.strokeOpacity = options.strokeOpacity;
        }

        if (options.strokeWeight != '') {
            this.object.options.set('strokeWeight', options.strokeWeight);
            this.options.strokeWidth = options.strokeWeight;
        }

        if (options.zIndex != '') {
            this.object.options.set('zIndex', options.zIndex);
            this.options.zIndex = options.zIndex;
        }

        if (options.fillColor != '') {
            this.object.options.set('fillColor', options.fillColor);
            this.options.fillColor = options.fillColor;
        }

        if (options.fillOpacity != '') {
            this.object.options.set('fillOpacity', options.fillOpacity);
            this.options.fillOpacity = options.fillOpacity;
        }
    }, this);
};

jsMaps.Yandex.VectorGetStyle =  function () {
    var return_values = new jsMaps.VectorStyle();

    if (typeof this.options.fillColor != 'undefined' && typeof this.options.fillOpacity != 'undefined') {
        return_values.fillColor     = this.options.fillColor;
        return_values.fillOpacity   = this.options.fillOpacity;
    }

    return_values.strokeColor   = this.options.strokeColor;
    return_values.strokeOpacity = this.options.strokeOpacity;
    return_values.strokeWeight  = this.options.strokeWidth;
    return_values.zIndex        = this.options.zIndex;

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

    hooking.prototype.getElement = function () {
        if (this.object == null) {
            return mapDomDocument;
        }

        return this.object.container.getElement()
    };

    hooking.prototype.setPropOption = function (type,option,setting) {
        if (type == 'controls') {
            if (setting === false) {
                this.object.controls.remove(option);
            } else if (setting === true) {
                this.object.controls.add(option);
            }
        }

        if (type == 'behaviors') {
            if (setting === false) {
                this.object.behaviors.disable(option);
            } else if (setting === true) {
                this.object.behaviors.enable(option);
            }
        }
    };

    /**
     *
     * @param {jsMaps.api.options} options
     */
    hooking.prototype.setOptions = function (options) {
        ymaps.ready(function () {
            var opts = {};

            if (typeof options.center != 'undefined' && typeof options.center.latitude != 'undefined' && typeof options.center.longitude != 'undefined') {
                this.setCenter(options.center.latitude,options.center.longitude);
            }

            if (typeof options.zoom != 'undefined') {
                this.setZoom(options.zoom);
            }

            if (typeof options.zoom_control != 'undefined') this.setPropOption('controls','zoomControl',options.zoom_control);
            if (typeof options.map_type != 'undefined') this.setPropOption('controls','typeSelector',options.map_type);
            if (typeof options.scale_control != 'undefined') this.setPropOption('controls','rulerControl',options.scale_control);

            if (typeof options.mouse_scroll != 'undefined') this.setPropOption('behaviors','scrollZoom',options.mouse_scroll);
        }, this);
    };

    hooking.prototype.setDraggable = function (flag) {
        ymaps.ready(function () {
            if (flag) {
                this.object.behaviors.enable(['drag'])
            } else {
                this.object.behaviors.disable(['drag'])
            }

        },this);
    };

    hooking.prototype.latLngToPoint = function (lat, lng) {
        if (this.object == null) {
            return  {x: 0,y: 0};
        }

        var projection = this.object.options.get('projection');
        var xy = this.object.converter.globalToPage(
            projection.toGlobalPixels(
                // geographical coordinates
                [lat, lng],
                this.object.getZoom()
            )
        );

        return {x: xy[0],y: xy[1]}
    };

    hooking.prototype.pointToLatLng = function (x, y) {
        if (this.object == null) {
            return  {lat: 0,lng: 0};
        }

        var projection = this.object.options.get('projection');
        var pos = projection.fromGlobalPixels(
            this.object.converter.pageToGlobal([x, y]), this.object.getZoom()
        );

        return {lat:pos[0],lng:pos[1]};
    };

    hooking.prototype.setCenter = function (lat, lng, transition) {
        ymaps.ready(function () {
            if (transition == 1) {
                this.object.setCenter([newPixelCenter.lat,newPixelCenter.lng],this.object.getZoom(),{duration: 200});
            } else {
                this.object.setCenter([lat,lng]);
            }
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

jsMaps.Yandex.eventTranslation = function (content,event) {
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
        if (event == jsMaps.api.supported_events.click) eventTranslation = 'click';
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

    return eventTranslation;
};

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
    var eventTranslation = jsMaps.Yandex.eventTranslation (content,event);

    jsMaps.Yandex.cnt++;
    jsMaps.Yandex.attachedEvents[jsMaps.Yandex.cnt] = null;

    var fn = functionToRun;
    var curCnt = jsMaps.Yandex.cnt;

    if (event == jsMaps.api.supported_events.zoom_changed) {
        var localZoom = content.getZoom();
        fn = function (event) {
            if(localZoom != content.getZoom()){
                localZoom = content.getZoom();

                functionToRun(event);
            }
        }
    }

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
            var event = this.eventObject.get('coords');
            return  {lat: event[0], lng: event[1]};
        };

        fn(new eventHooking);
    };


    ymaps.ready(function () {
        if (once) {
            content.object.events.once(eventTranslation, useFn);
        } else {
            jsMaps.Yandex.attachedEvents[curCnt] = content.object.events.add(eventTranslation, useFn);
        }
    }, this);

    return {c: curCnt, f: useFn, e: eventTranslation};
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
 *
 * @param element
 * @param eventName
 */
jsMaps.Yandex.prototype.triggerEvent = function (element,eventName) {
    ymaps.ready(function () {
        var eventTranslation = jsMaps.Yandex.eventTranslation(element,eventName);
        element.object.events.fire(eventTranslation);
    }, this);
};

/**
 * Generate markers
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.MarkerOptions} parameters
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
    hooking.prototype.collection = null;
    hooking.prototype.options = options;
    hooking.prototype.__className = 'marker';
    hooking.prototype.defaultLocation = parameters.position;
    hooking.prototype.defaultOptions = options;

    ymaps.ready(function () {
        map = map.object;

        var obj = null;

        if (parameters.html != null && typeof parameters.html == 'object') {
            obj = document.createElement('div');
            obj.innerHTML = parameters.html.innerHTML;

            options.iconLayout = ymaps.templateLayoutFactory.createClass('<div>' + parameters.html.innerHTML + '</div>');
        } else if (parameters.html != null && typeof parameters.html == 'string') {
            obj = document.createElement('div');
            obj.appendChild(parameters.html);

            options.iconLayout = ymaps.templateLayoutFactory.createClass('<div>' + parameters.html + '</div>');
        }

        var coordinates = [];

        if (obj!=null) {
            document.body.appendChild(obj);
            obj.style.display = 'inline-block';
            coordinates.push([-1*obj.offsetHeight,-1*obj.offsetHeight]);
            coordinates.push([obj.offsetWidth,obj.offsetWidth]);

            document.body.removeChild(obj);
        }

        if (typeof  options.iconLayout != 'undefined' && coordinates.length > 0) {
            options.iconShape = {
                type: 'Rectangle',
                coordinates: coordinates
            };
        }

        if (parameters.draggable != null) options.draggable = parameters.draggable;

        hooking.prototype.object =  new ymaps.Placemark([parameters.position.lat, parameters.position.lng],props,options);
        hooking.prototype.collection = new ymaps.GeoObjectCollection(null, {});
        hooking.prototype.collection.add(hooking.prototype.object);

        map.geoObjects.add(hooking.prototype.collection);
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
           var parentMap = this.collection.getMap();
           parentMap.geoObjects.remove(this.collection);
        }, this);
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
jsMaps.Yandex.prototype.infoWindow = function (parameters) {
    var options = {content: parameters.content,position: []};
    if (parameters.position != null) options.position = [parameters.position.lat, parameters.position.lng];

    var hooking = function () {};
    hooking.prototype = new jsMaps.InfoWindowStructure();

    hooking.prototype.object = null;
    hooking.prototype.options = options;
    hooking.prototype.marker = null;

    hooking.prototype.getPosition = function () {
        if (this.object == null) {
            return {lat: this.options.position[0], lng: this.options.position[1]}
        }

        var pos = this.object.getPosition();
        return {lat: pos[0], lng: pos[1]}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        if (this.object == null) return;

        ymaps.ready(function () {
            this.object.setPosition([lat, lng]);
        }, this);

    };

    hooking.prototype.close = function () {
        if (this.object == null) return;

        ymaps.ready(function () {
            this.object.close(true);
        }, this);
    };

    /**
     *
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.MarkerStructure} marker
     */
    hooking.prototype.open = function(map,marker) {
        ymaps.ready(function () {
            this.object = marker.object.balloon;
            this.marker = marker.object;

            marker.object.properties.set('balloonContentBody',this.options.content);
            marker.object.balloon.open();
        }, this);
    };

    hooking.prototype.setContent = function (content) {
        if (this.marker == null) return;

        ymaps.ready(function () {
            this.marker.properties.set('balloonContentBody',content);
        }, this);
    };

    return new hooking();
};

jsMaps.Yandex.toYandexPath =  function (path) {
    if (typeof path == 'undefined' || path == []) return [];

    var newPath = [];

    for (var i in path) {
        if (path.hasOwnProperty(i) == false) continue;

        if (Array.isArray(path[i])) {
            var recentArray = [];
            for (var c in path[i]) {
                if (path[i].hasOwnProperty(c) == false) continue;
                recentArray.push([path[i][c].lat, path[i][c].lng]);
            }
            newPath.push(recentArray);
        } else {
            newPath.push([path[i].lat, path[i].lng]);
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
jsMaps.Yandex.prototype.polyLine = function (map,parameters) {

    var options = {
        draggable: parameters.draggable,
        strokeColor:parameters.strokeColor,
        strokeOpacity: parameters.strokeOpacity,
        strokeWidth: parameters.strokeWeight,
        visible: parameters.visible,
        zIndex: parameters.zIndex
    };
    var hooking = function () {};
    hooking.prototype = new jsMaps.PolyLineStructure();

    hooking.prototype.object = null;
    hooking.prototype.options = options;

    ymaps.ready(function () {
        var polyLine = new ymaps.Polyline(jsMaps.Yandex.toYandexPath(parameters.path), {}, options);
        polyLine.editable = parameters.editable;
        polyLine.clickable = parameters.clickable;

        map.object.geoObjects.add(polyLine);

        if (parameters.editable) {
            polyLine.editor.startEditing();
        }
        hooking.prototype.object = polyLine;
    }, this);

    hooking.prototype.getEditable = function () {
        if (this.object == null) {
            return parameters.editable;
        }

        return this.object.editable;
    };

    hooking.prototype.getPath = function () {
        if (this.object == null) {
            return parameters.path;
        }

        var arrayOfPaths = [];
        var path = this.object.geometry.getCoordinates();

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            var pos = path[i];

            arrayOfPaths.push ({lat: pos[0], lng: pos[1]});
        }

        return arrayOfPaths;
    };

    hooking.prototype.getPaths = function () {
        if (this.object == null) {
            return parameters.path;
        }

        var arrayOfPaths = [];
        var path = this.object.geometry.getCoordinates();

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            var pos = path[i];

            if (Array.isArray(pos)) {
                var recentArray = [];
                for (var c in pos) {
                    if (pos.hasOwnProperty(c) == false) continue;
                    var pos2 = pos[c];

                    recentArray.push({lat: pos2[0], lng: pos2[1]});
                }

                arrayOfPaths.push(recentArray);
            } else {
                arrayOfPaths.push ({lat: pos[0], lng: pos[1]});
            }
        }

        return arrayOfPaths;
    };

    hooking.prototype.getVisible = function () {
        if (this.object == null) {
            return parameters.visible;
        }

        return this.object.options.get('visible');
    };

    hooking.prototype.setDraggable = function (draggable) {
        ymaps.ready(function () {
            this.object.options.set('draggable',draggable);
        }, this);
    };

    hooking.prototype.setEditable = function (editable) {
        ymaps.ready(function () {
            this.object.editable = editable;

            if (editable == true) {
                this.object.editor.startEditing();
            } else {
                this.object.editor.stopEditing()
            }
        }, this);
    };

    hooking.prototype.setPath = function (pathArray) {
        ymaps.ready(function () {
            this.object.geometry.setCoordinates(jsMaps.Yandex.toYandexPath(pathArray));
        }, this);
    };

    hooking.prototype.setPaths = function (pathsArray) {
        ymaps.ready(function () {

            this.object.geometry.setCoordinates(jsMaps.Yandex.toYandexPath(pathsArray));
        }, this);
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        ymaps.ready(function () {
            this.object.geometry.setMap(map.object);
        }, this);
    };

    hooking.prototype.setVisible = function (visible) {
        ymaps.ready(function () {
            this.object.options.set('visible', visible);

            if (visible == false && this.object.editable == true) {
                this.object.editor.stopEditing();
            } else if (visible == true && this.object.editable == true) {
                this.object.editor.startEditing();
            }
        }, this);
    };

    hooking.prototype.removeLine = function () {
        ymaps.ready(function () {
            var parentMap = this.object.getMap();
            parentMap.geoObjects.remove(this.object);
        }, this);
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Yandex.VectorStyle.bind(object);
    object.getStyle = jsMaps.Yandex.VectorGetStyle.bind(object);

    return object;
};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolygonOptions} parameters
 * @returns jsMaps.PolygonStructure
 */
jsMaps.Yandex.prototype.polygon = function (map,parameters) {
    var options = {
        draggable: parameters.draggable,
        fillColor: parameters.fillColor,
        fillOpacity: parameters.fillOpacity,
        strokeColor: parameters.strokeColor,
        strokeOpacity: parameters.strokeOpacity,
        strokeWidth: parameters.strokeWeight,
        visible: parameters.visible,
        zIndex: parameters.zIndex
    };

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolygonStructure();

    hooking.prototype.object = null;
    hooking.prototype.options = options;

    ymaps.ready(function () {
        var Polygon = new ymaps.Polygon([jsMaps.Yandex.toYandexPath(parameters.paths)],{},options);
        Polygon.editable = parameters.editable;
        Polygon.clickable = parameters.clickable;

        map.object.geoObjects.add(Polygon);

        if (parameters.editable) {
            Polygon.editor.startEditing();
        }
        hooking.prototype.object = Polygon;
    }, this);


    hooking.prototype.getEditable = function () {
        if (this.object == null) {
            return parameters.editable;
        }

        return this.object.editable;
    };

    hooking.prototype.getPath = function () {
        if (this.object == null) {
            return parameters.paths;
        }

        var arrayOfPaths = [];
        var path = this.object.geometry.getCoordinates();

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            var pos = path[i];

            arrayOfPaths.push ({lat: pos[0], lng: pos[1]});
        }

        return arrayOfPaths;
    };

    hooking.prototype.getVisible = function () {
        if (this.object == null) {
            return parameters.visible;
        }

        return this.object.options.get('visible');
    };

    hooking.prototype.setDraggable = function (draggable) {
        ymaps.ready(function () {
            this.object.options.set('draggable',draggable);
        }, this);
    };

    hooking.prototype.setEditable = function (editable) {
        ymaps.ready(function () {
            this.object.editable = editable;

            if (editable == true) {
                this.object.editor.startEditing();
            } else {
                this.object.editor.stopEditing()
            }
        }, this);
    };

    hooking.prototype.setPath = function (pathArray) {
        ymaps.ready(function () {
            this.object.geometry.setCoordinates(jsMaps.Yandex.toYandexPath(pathArray));
        }, this);
    };

    hooking.prototype.getDraggable = function () {
        if (this.object == null) {
            return parameters.draggable;
        }

        return this.object.options.get('draggable');
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        ymaps.ready(function () {
            this.object.geometry.setMap(map.object);
        }, this);
    };

    hooking.prototype.setVisible = function (visible) {
        ymaps.ready(function () {
            this.object.options.set('visible', visible);

            if (visible == false && this.object.editable == true) {
                this.object.editor.stopEditing();
            } else if (visible == true && this.object.editable == true) {
                this.object.editor.startEditing();
            }
        }, this);
    };

    hooking.prototype.removePolyGon = function () {
        ymaps.ready(function () {
            var parentMap = this.object.getMap();
            parentMap.geoObjects.remove(this.object);
        }, this);
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Yandex.VectorStyle.bind(object);
    object.getStyle = jsMaps.Yandex.VectorGetStyle.bind(object);

    return object;
};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.CircleOptions} parameters
 * @returns jsMaps.CircleStructure
 */
jsMaps.Yandex.prototype.circle = function (map,parameters) {
    var options = {
        draggable: parameters.draggable,
        fillColor: parameters.fillColor,
        fillOpacity: parameters.fillOpacity,
        strokeColor: parameters.strokeColor,
        strokeOpacity: parameters.strokeOpacity,
        strokeWidth: parameters.strokeWeight,
        visible: parameters.visible,
        zIndex: parameters.zIndex
    };

    var hooking = function () {};
    hooking.prototype = new jsMaps.CircleStructure();

    hooking.prototype.object = null;
    hooking.prototype.options = options;

    ymaps.ready(function () {
        var circle = new ymaps.Circle([
            // The coordinates of the center of the circle.
            [parameters.center.lat, parameters.center.lng],
            // The radius of the circle in meters.
            parameters.radius
        ], {}, options);

        circle.editable = parameters.editable;
        circle.clickable = parameters.clickable;

        map.object.geoObjects.add(circle);

        // Currently not supported by yandex
        //if (parameters.editable) {
        //    circle.editor.startEditing();
        //}
        hooking.prototype.object = circle;
    }, this);

    hooking.prototype.getBounds = function () {
        if (this.object == null) {
            return null;
        }

        return jsMaps.Yandex.prototype.bounds(this.object.geometry);
    };

    hooking.prototype.getCenter = function () {
        if (this.object == null) {
            return parameters.center;
        }

        var pos = this.object.geometry.getCoordinates();
        return {lat: pos[0], lng: pos[1]};
    };

    hooking.prototype.getDraggable = function () {
        if (this.object == null) {
            return parameters.draggable;
        }

        return this.object.options.get('draggable');
    };

    hooking.prototype.getEditable = function () {
        if (this.object == null) {
            return parameters.editable;
        }

        return this.object.editable;
    };

    hooking.prototype.getRadius = function () {
        if (this.object == null) {
            return parameters.radius;
        }

        return this.object.geometry.getRadius();
    };

    hooking.prototype.getVisible = function () {
        if (this.object == null) {
            return parameters.visible;
        }

        return this.object.options.get('visible');
    };

    hooking.prototype.setCenter = function (lat, lng) {
        ymaps.ready(function () {
            this.object.geometry.setCoordinates([lat,lng]);
        }, this);
    };

    hooking.prototype.setDraggable = function (draggable) {
        ymaps.ready(function () {
            this.object.options.set('draggable',draggable);
        }, this);
    };

    hooking.prototype.setEditable = function (editable) {
        ymaps.ready(function () {
            this.object.editable = editable;

            if (editable == true) {
                this.object.editor.startEditing();
            } else {
                this.object.editor.stopEditing()
            }
        }, this);
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        ymaps.ready(function () {
            this.object.geometry.setMap(map.object);
        }, this);
    };

    hooking.prototype.setVisible = function (visible) {
        ymaps.ready(function () {
            this.object.options.set('visible', visible);

            if (visible == false && this.object.editable == true) {
                this.object.editor.stopEditing();
            } else if (visible == true && this.object.editable == true) {
                this.object.editor.startEditing();
            }
        }, this);
    };

    hooking.prototype.setRadius = function (radius) {
        ymaps.ready(function () {
            this.object.geometry.setRadius(radius);
        }, this);
    };

    hooking.prototype.removeCircle = function () {
        ymaps.ready(function () {
            var parentMap = this.object.getMap();
            parentMap.geoObjects.remove(this.object);
        }, this);
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Yandex.VectorStyle.bind(object);
    object.getStyle = jsMaps.Yandex.VectorGetStyle.bind(object);

    return object;
};