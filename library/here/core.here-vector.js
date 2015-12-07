

jsMaps.Here.DraggablePolylineMarker = function (obj,behavior) {
    // disable the default draggability of the underlying map
    // when starting to drag a marker object:
    obj.addEventListener('dragstart', function (ev) {
        var target = ev.target;
        if (target instanceof H.map.DomMarker) {
            var data = target.getData();

            if (typeof data.line!='undefined') {
                behavior.disable();
            }
        }
    }, false);


    // re-enable the default draggability of the underlying map
    // when dragging has completed
    obj.addEventListener('dragend', function (ev) {
        var target = ev.target;
        if (target instanceof mapsjs.map.DomMarker) {
            behavior.enable();

            var data = target.getData();

            if (typeof data.line!='undefined') {
                behavior.enable();
            }
        }
    }, false);

    // Listen to the drag event and move the position of the marker
    // as necessary
    obj.addEventListener('drag', function (ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof mapsjs.map.DomMarker) {
            var data = target.getData();
            if (typeof data.line!='undefined') {
                var pos = obj.screenToGeo(pointer.viewportX, pointer.viewportY);

                target.setPosition(pos);

                var old_pos = data['pos'];

                var arrayOfPaths = [];
                var path = data['line'].getStrip();

                var prev = {lat: 0,lng: 0};

                for (var m in data['line'].markers) {
                    if (data['line'].markers.hasOwnProperty(m) == false) continue;
                    var mr = data['line'].markers[m];

                    if (target.center != mr.center) {
                        mr.setVisibility(false);
                    }
                }

                var eachFn = function(lat, lng, alt, idx) {
                    if (lat == old_pos.lat && lng ==old_pos.lng) {
                        lat = pos.lat;
                        lng = pos.lng;
                    }

                    if (prev.lat == 0) {
                        prev = {lat: lat,lng: lng};
                    } else {
                        var hereCenter = new H.geo.Strip();
                        hereCenter.pushLatLngAlt(prev.lat,prev.lng);
                        hereCenter.pushLatLngAlt(lat,lng);

                        var pt = hereCenter.getBounds().getCenter();

                        if (pt.lat == old_pos.lat && pt.lng ==old_pos.lng) {
                            arrayOfPaths.push ({lat: pt.lat, lng: pt.lng});
                            pos = pt;
                        }

                        prev = {lat: lat,lng: lng};
                    }

                    arrayOfPaths.push ({lat: lat, lng: lng});
                };

                path.eachLatLngAlt(eachFn);

                data['line'].setStrip(jsMaps.Here.ReturnStrip(arrayOfPaths));
                data['pos'] = pos;
                target.setData(data);
            }
        }

    }, false);
};

jsMaps.Here.EditPolyLine = function (path,PolyLine,obj,behavior,isPolygon, parameters) {
    var markers = [];


    var outerElement = document.createElement('div'),
        innerElement = document.createElement('div');

    outerElement.style.userSelect = 'none';
    outerElement.style.webkitUserSelect = 'none';
    outerElement.style.msUserSelect = 'none';
    outerElement.style.mozUserSelect = 'none';
    outerElement.style.cursor = 'default';

    var line = {size: 12, color: 'black'};

    if (typeof parameters != 'undefined' && typeof parameters.strokeWeight != 'undefined') {
        line.size = parameters.strokeWeight;
        line.color = parameters.strokeColor;
    }

    innerElement.style.color = 'red';
    innerElement.style.backgroundColor = 'white';
    innerElement.style.border = '1px solid '+line.color;
    innerElement.style.font = 'normal '+line.size+'px arial';
    innerElement.style.lineHeight = line.size+'px';
    innerElement.style.borderRadius="15px";

    innerElement.style.paddingTop = '2px';
    innerElement.style.paddingLeft = '4px';
    innerElement.style.width = '9px';
    innerElement.style.height = '9px';

    // add negative margin to inner element
    // to move the anchor to center of the div
    innerElement.style.marginTop = '-10px';
    innerElement.style.marginLeft = '-10px';

    outerElement.appendChild(innerElement);

    // Add text to the DOM element
    innerElement.innerHTML = '&nbsp;';

    var innerElementClone = innerElement.cloneNode(true);
    innerElementClone.style.border="1px solid "+line.color;
    innerElementClone.style.borderRadius="50%";

    innerElementClone.style.opacity = 0.7;
    innerElementClone.style.filter = "alpha( opacity=60 )";

    var outerElementClone = outerElement.cloneNode(false);
    outerElementClone.appendChild(innerElementClone);

    function changeOpacity(evt) {
        evt.target.style.backgroundColor="yellow";
    }

    function changeOpacityToOne(evt) {
        evt.target.style.backgroundColor="white";
    }

    //create dom icon and add/remove opacity listeners
    var domIcon = new H.map.DomIcon(outerElement, {
        // the function is called every time marker enters the viewport
        onAttach: function(clonedElement, domIcon, domMarker) {
            clonedElement.addEventListener('mouseover', changeOpacity);
            clonedElement.addEventListener('mouseout', changeOpacityToOne);
        },
        // the function is called every time marker leaves the viewport
        onDetach: function(clonedElement, domIcon, domMarker) {
            clonedElement.removeEventListener('mouseover', changeOpacity);
            clonedElement.removeEventListener('mouseout', changeOpacityToOne);
        }
    });

    //create dom icon and add/remove opacity listeners
    var domIconCenter = new H.map.DomIcon(outerElementClone, {
        // the function is called every time marker enters the viewport
        onAttach: function(clonedElement, domIcon, domMarker) {
            clonedElement.addEventListener('mouseover', changeOpacity);
            clonedElement.addEventListener('mouseout', changeOpacityToOne);
        },
        // the function is called every time marker leaves the viewport
        onDetach: function(clonedElement, domIcon, domMarker) {
            clonedElement.removeEventListener('mouseover', changeOpacity);
            clonedElement.removeEventListener('mouseout', changeOpacityToOne);
        }
    });

    for (var i in path) {
        if (path.hasOwnProperty(i) == false) continue;
        if (isPolygon == true && i == 0)  continue;

        var center = 0;
        var icon = {icon: domIcon };
        if (typeof path[i].center != 'undefined' &&  path[i].center == 1) {
            icon = {icon: domIconCenter };
            center = 1;
        }

        var marker =  new H.map.DomMarker({lat:path[i].lat, lng:  path[i].lng}, icon);

        marker.setData({line: PolyLine,pos: {lat:path[i].lat, lng:  path[i].lng}});
        marker.draggable = true;
        marker.center = center;

        obj.addObject(marker);

        jsMaps.Here.DraggablePolylineMarker(obj,behavior);

        markers.push(marker);
    }

    return markers;
};




/**
 * Create PolyLine
 *
 * draggable is not supported
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolyLineOptions} parameters
 * @returns jsMaps.PolyLineStructure
 */
jsMaps.Here.prototype.polyLine = function (map,parameters) {
    var options = {
        zIndex: parameters.zIndex,
        visibility: parameters.visible,
        style: { lineWidth: parameters.strokeWeight, strokeColor:jsMaps.convertHex(parameters.strokeColor,parameters.strokeOpacity*100) }
    };

    var PolyLine = new H.map.Polyline(jsMaps.Here.ReturnStrip(parameters.path), options);

    var obj = map.object.map;
    var behavior = map.object.behavior;

    obj.addObject(PolyLine);

    var markers = undefined;
    PolyLine.clickable = parameters.clickable;


    if (parameters.editable != null && parameters.editable == true) {
        PolyLine.setData({'editEvent':true});
        markers = jsMaps.Here.EditPolyLine(parameters.path,PolyLine,obj,behavior,false,parameters);
    } else {
        PolyLine.setData({'editEvent':false});
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolyLineStructure();

    hooking.prototype.object = PolyLine;

    hooking.prototype.getEditable = function () {
        var tmp_data = this.object.getData();
        return (typeof tmp_data.editEvent != 'editEvent')? tmp_data.editEvent: false;
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        var path = this.object.getStrip();


        var eachFn = function(lat, lng, alt, idx) {
            arrayOfPaths.push ({lat: lat, lng: lng});
        };

        path.eachLatLngAlt(eachFn);

        return arrayOfPaths;
    };

    hooking.prototype.getPaths = function () {
        return hooking.prototype.getPath();
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisibility();
    };

    hooking.prototype.setDraggable = function (draggable) {
        // Not supported
    };

    hooking.prototype.setEditable = function (editable) {
        if (editable == true){
            if (typeof markers == 'undefined') {
                this.object.setData({'editEvent':true});
                markers = jsMaps.Here.EditPolyLine(this.getPath(),this.object,obj,behavior);
            }
        }
        else {
            this.object.setData({'editEvent':false});

            if (typeof markers!='undefined' && markers.length > 0) {
                for (var o in markers) {
                    if (markers.hasOwnProperty(o) == false) continue;
                    obj.removeObject(markers[o]);
                }

                markers = undefined;
            }
        }
    };

    hooking.prototype.setPath = function (pathArray) {
        var originMap =this.object.getRootGroup();

        if (typeof markers!='undefined' && markers.length > 0) {
            for (var o in markers) {
                if (markers.hasOwnProperty(o) == false) continue;
                originMap.removeObject(markers[o]);
            }
        }

        this.object.setStrip(jsMaps.Here.ReturnStrip(pathArray));

        var getEditable = this.getEditable();

        if (getEditable == true) {
            markers = jsMaps.Here.EditPolyLine(this.getPath(),this.object,obj,behavior);
        }
    };

    hooking.prototype.setPaths = function (pathsArray) {
        hooking.prototype.setPath(pathsArray);
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        var originMap =this.object.getRootGroup();

        if (typeof markers!='undefined' && markers.length > 0) {
            for (var o in markers) {
                if (markers.hasOwnProperty(o) == false) continue;
                originMap.removeObject(markers[o]);
                map.object.map.addObject(markers[o]);
            }
        }

        originMap.removeObject(this.object);
        map.object.map.addObject(this.object);
    };

    hooking.prototype.setVisible = function (visible) {
        if (typeof markers!='undefined' && markers.length > 0) {
            for (var o in markers) {
                if (markers.hasOwnProperty(o) == false) continue;
                markers[o].setVisibility(visible);
            }
        }

        this.object.setVisibility(visible);
    };

    hooking.prototype.removeLine = function () {
        var mapObjectTmp = this.object.getRootGroup();

        if (typeof markers!='undefined' && markers.length > 0) {
            for (var o in markers) {
                if (markers.hasOwnProperty(o) == false) continue;
                mapObjectTmp.removeObject(markers[o]);
            }

            markers = undefined;
        }

        mapObjectTmp.removeObject(this.object);
    };

    return new hooking();
};



jsMaps.Here.EditablePolygon = function (Polygon,parameters,obj,behavior) {
    Polygon.setData({'editEvent':true});

    var newPaths = parameters.paths;

    var pathLength = newPaths.length;

    if (pathLength % 2 === 0 || pathLength % 3 === 0) {
        var last = newPaths[pathLength-1];

        if (last.lat != newPaths[0].lat && last.lng != newPaths[0].lng ) {
            newPaths.push(newPaths[0]);
        }
    }

    var npath = [];
    var noCenter = [];
    for (var n in newPaths) {
        if (newPaths.hasOwnProperty(n) == false) continue;

        var testPath = [newPaths[n],newPaths[parseInt(n)+1]];
        var abort = 0;

        for (var p in testPath) {
            if (testPath.hasOwnProperty(p) == false) continue;

            if (typeof testPath[p] == 'undefined') {
                abort = 1;
            }
        }

        newPaths[n].center = 0;

        if ( abort != 1) {
            npath.push(newPaths[n]);
            noCenter.push(newPaths[n]);
            var hereCenter = new H.geo.Strip();

            hereCenter.pushLatLngAlt(testPath[0].lat,testPath[0].lng);
            hereCenter.pushLatLngAlt(testPath[1].lat,testPath[1].lng);

            var path = hereCenter.getBounds().getCenter();
            path.center = 1;

            npath.push(path);
        }else {
            npath.push(newPaths[n]);
            noCenter.push(newPaths[n]);
        }
    }

    Polygon.setStrip(jsMaps.Here.ReturnStrip(noCenter));
    return jsMaps.Here.EditPolyLine(npath,Polygon,obj,behavior,true,parameters);
};

jsMaps.Here.prototype.draggableVector = function (vectorHooking,mapObject,parameters) {
    var map = mapObject.object.map;
    var behavior = mapObject.object.behavior;
    var vector = vectorHooking.object;

    vector.addEventListener('pointerdown',function (e){
        e.stopPropagation();
        e.preventDefault();

        if (this.dragggable == false) return;
        if (typeof vectorHooking.markers!='undefined' && vectorHooking.markers.length > 0) {
            for (var o in vectorHooking.markers) {
                if (vectorHooking.markers.hasOwnProperty(o) == false) continue;
                map.removeObject(vectorHooking.markers[o]);
            }

            vectorHooking.markers = undefined;
        }

        this.moving = true;

        // calculate mouse cursor-offset on marker div
        this.clickx = e.currentPointer.viewportX;
        this.clicky = e.currentPointer.viewportY;

        behavior.disable(H.mapevents.Behavior.DRAGGING);
    }, false);


    map.addEventListener('pointermove',function (e) {
        e.stopPropagation();
        e.preventDefault();

        if (this.dragggable == false) return;
        if (this.moving == false || (typeof this.clickx == 'undefined' && typeof this.clicky == 'undefined')) return;

        var x =  e.currentPointer.viewportX;
        var y = e.currentPointer.viewportY;

        var latLng = map.screenToGeo(x, y);
        var previousLoc = map.screenToGeo(this.clickx, this.clicky);

        var latVariance = latLng.lat - previousLoc.lat;
        var longVariance = latLng.lng - previousLoc.lng;

        if (latVariance == 0 && longVariance == 0) return;

        this.clickx = e.currentPointer.viewportX;
        this.clicky = e.currentPointer.viewportY;

        var strip = new H.geo.Strip();
        var path = this.getStrip();

        var eachFn = function(lat, lng, alt, idx) {
            strip.pushLatLngAlt(lat+latVariance,lng+longVariance);
        };

        path.eachLatLngAlt(eachFn);
        this.setStrip(strip);

        jsMaps.Here.prototype.moveMap(mapObject,{x: x,y: y},this,'vector');
    },false, vector);

    map.addEventListener('pointerup',function (e) {
        behavior.enable(H.mapevents.Behavior.DRAGGING);
        this.moving = false;


        if (typeof vectorHooking.markers!='undefined' && vectorHooking.markers.length > 0) {
            for (var o in vectorHooking.markers) {
                if (vectorHooking.markers.hasOwnProperty(o) == false) continue;
                map.removeObject(vectorHooking.markers[o]);
            }

            vectorHooking.markers = undefined;
        }

        var path = this.getStrip();
        var altArray = [];

        var eachFn = function(lat, lng, alt, idx) {
            altArray.push({lat:lat,lng:lng});
        };

        path.eachLatLngAlt(eachFn);

        parameters.paths = altArray;

        vectorHooking.markers = jsMaps.Here.EditablePolygon(this,parameters,map,behavior);
        this.markers = vectorHooking.markers;
    },false, vector);
};

/**
 * @param mapObject
 * @param vector
 * @param point
 */
jsMaps.Here.prototype.vectorPosition = function (mapObject,vector,point) {
    var map = mapObject.object.map;

    var previousLoc = map.screenToGeo(vector.clickx, vector.clicky);
    var latLng = map.screenToGeo(point.x,point.y);

    var latVariance = latLng.lat - previousLoc.lat;
    var longVariance = latLng.lng - previousLoc.lng;

    var strip = new H.geo.Strip();
    var path = vector.getStrip();

    var eachFn = function(lat, lng, alt, idx) {
        strip.pushLatLngAlt(lat+latVariance,lng+longVariance);
    };

    path.eachLatLngAlt(eachFn);
    vector.setStrip(strip);
};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolygonOptions} parameters
 * @returns jsMaps.PolygonStructure
 */
jsMaps.Here.prototype.polygon = function (map,parameters) {
    var options = {
        zIndex: parameters.zIndex,
        visibility: parameters.visible,
        style: { lineWidth: parameters.strokeWeight, strokeColor: jsMaps.convertHex(parameters.strokeColor,parameters.strokeOpacity*100) , fillColor: jsMaps.convertHex(parameters.fillColor,parameters.fillOpacity*100)}
    };

    var Polygon = new H.map.Polygon(jsMaps.Here.ReturnStrip(parameters.paths), options);

    var obj = map.object.map;
    var behavior = map.object.behavior;

    obj.addObject(Polygon);

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolygonStructure();

    var markers = undefined;
    Polygon.clickable = parameters.clickable;

    if (parameters.editable != null && parameters.editable == true) {
        Polygon.setData({'editEvent':true});

        markers = jsMaps.Here.EditablePolygon(Polygon,parameters,obj,behavior);
    } else {
        Polygon.setData({'editEvent':false});
    }

    Polygon.markers = markers;
    Polygon.dragggable = parameters.draggable;

    hooking.prototype.markers = markers;
    hooking.prototype.object = Polygon;

    hooking.prototype.getEditable = function () {
        var tmp_data = this.object.getData();
        return (typeof tmp_data.editEvent != 'editEvent')? tmp_data.editEvent: false;
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        var path = this.object.getStrip();


        var eachFn = function(lat, lng, alt, idx) {
            arrayOfPaths.push ({lat: lat, lng: lng});
        };

        path.eachLatLngAlt(eachFn);

        return arrayOfPaths;
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisibility();
    };

    hooking.prototype.setDraggable = function (draggable) {
        this.object.dragggable = draggable;
    };

    hooking.prototype.setEditable = function (editable) {
        if (editable == true){
            if (typeof this.markers == 'undefined') {
                this.object.setData({'editEvent':true});
                this.markers = jsMaps.Here.EditPolyLine(this.getPath(),this.object,obj,behavior);
            }
        }
        else {
            this.object.setData({'editEvent':false});

            if (typeof this.markers!='undefined' && this.markers.length > 0) {
                for (var o in this.markers) {
                    if (this.markers.hasOwnProperty(o) == false) continue;
                    obj.removeObject(this.markers[o]);
                }

                this.markers = undefined;
            }
        }
    };

    hooking.prototype.setPath = function (pathArray) {
        var originMap =this.object.getRootGroup();

        if (typeof this.markers!='undefined' && this.markers.length > 0) {
            for (var o in this.markers) {
                if (this.markers.hasOwnProperty(o) == false) continue;
                originMap.removeObject(this.markers[o]);
            }
        }

        this.object.setStrip(jsMaps.Here.ReturnStrip(pathArray));

        var getEditable = this.getEditable();

        if (getEditable == true) {
            this.markers = jsMaps.Here.EditablePolygon(this.object,this.getPath(),obj,behavior);
        }
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        var originMap =this.object.getRootGroup();

        if (typeof this.markers!='undefined' && this.markers.length > 0) {
            for (var o in markers) {
                if (this.markers.hasOwnProperty(o) == false) continue;
                originMap.removeObject(this.markers[o]);
                map.object.map.addObject(this.markers[o]);
            }
        }

        originMap.removeObject(this.object);
        map.object.map.addObject(this.object);
    };

    hooking.prototype.setVisible = function (visible) {
        if (typeof this.markers!='undefined' && this.markers.length > 0) {
            for (var o in this.markers) {
                if (this.markers.hasOwnProperty(o) == false) continue;
                this.markers[o].setVisibility(visible);
            }
        }

        this.object.setVisibility(visible);
    };

    hooking.prototype.removePolyGon = function () {
        var mapObjectTmp = this.object.getRootGroup();

        if (typeof this.markers!='undefined' && this.markers.length > 0) {
            for (var o in this.markers) {
                if (this.markers.hasOwnProperty(o) == false) continue;
                mapObjectTmp.removeObject(this.markers[o]);
            }

            this.markers = undefined;
        }

        mapObjectTmp.removeObject(this.object);
    };

    var object = new hooking();
    jsMaps.Here.prototype.draggableVector(object, map, parameters);

    return object;
};

/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.CircleOptions} parameters
 * @returns jsMaps.CircleStructure
 */
jsMaps.Here.prototype.circle = function (map,parameters) {
    var options = {
        zIndex: parameters.zIndex,
        visibility: parameters.visible,
        style: { lineWidth: parameters.strokeWeight, strokeColor: jsMaps.convertHex(parameters.strokeColor,parameters.strokeOpacity*100) , fillColor: jsMaps.convertHex(parameters.fillColor,parameters.fillOpacity*100)}
    };

    var circle = new H.map.Circle(parameters.center,parameters.radius, options);

    var obj = map.object.map;
    var behavior = map.object.behavior;

    obj.addObject(circle);

    circle.clickable = parameters.clickable;

    var hooking = function () {};
    hooking.prototype = new jsMaps.CircleStructure();

    hooking.prototype.object = circle;

    hooking.prototype.getBounds = function () {
        return jsMaps.Here.prototype.bounds(this.object);
    };

    hooking.prototype.getCenter = function () {
        var center = this.getCenter();
        return {lat: center.lat,lng: center.lng};
    };

    hooking.prototype.getDraggable = function () {
        return false; // todo: support this
    };

    hooking.prototype.getEditable = function () {
        return false; // todo: support this
    };

    hooking.prototype.getRadius = function () {
        return this.object.getRadius();
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisibility();
    };

    hooking.prototype.setCenter = function (lat, lng) {
        this.object.setCenter({lat: lat, lng: lng});
    };

    hooking.prototype.setDraggable = function (draggable) {
        // not supported
    };

    hooking.prototype.setEditable = function (editable) {
        // not supported
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        var originMap =this.object.getRootGroup();

        originMap.removeObject(this.object);
        map.object.map.addObject(this.object);
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setVisibility(visible);
    };

    hooking.prototype.setRadius = function (radius) {
        this.object.setRadius(radius);
    };

    hooking.prototype.removeCircle = function () {
        var mapObjectTmp = this.object.getRootGroup();
        mapObjectTmp.removeObject(this.object);
    };

    return new hooking();
};