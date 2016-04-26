/**
 * @param {jsMaps.MapStructure} map
 * @param vector
 * @param point
 */
jsMaps.vectorPosition = function (map,vector,point) {
    var previousLoc = map.pointToLatLng(vector.clickx, vector.clicky);
    var latLng = map.pointToLatLng(point.x,point.y);

    var latVariance = latLng.lat - previousLoc.lat;
    var longVariance = latLng.lng - previousLoc.lng;

    if (vector.movingShape == 'circle') {
        var center = vector.getCenter();
        vector.setCenter(center.lat + latVariance, center.lng + longVariance);
    } else {
        var newPath = [];
        var path = vector.getPath();

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            newPath.push({lat: path[i].lat + latVariance, lng: path[i].lng + longVariance});
        }

        vector.setPath(newPath);
    }
};


/**
 * Make a vector object draggable
 *
 * @param pol
 * @param mapd
 * @param parameters
 * @param shape
 */
jsMaps.draggableVector = function (pol,mapd,parameters,shape) {
    if (typeof shape == 'undefined') shape = 'polygon';
    pol.movingShape = shape;

    jsMaps.api.attach_event(pol,'mousedown',function(e) {
        e.stopPropagation();

        if (this.draggable == false) return;
        this.moving = true;

        var position = e.getCursorPosition();
        var cursorPosition = mapd.latLngToPoint(position.lat,position.lng);

        // calculate mouse cursor-offset on marker div
        this.clickx = cursorPosition.x;
        this.clicky = cursorPosition.y;

        mapd.setDraggable(false);
        if (typeof pol.markers!='undefined' && pol.markers.length > 0) {
            for (var o in pol.markers) {
                if (pol.markers.hasOwnProperty(o) == false) continue;
                pol.markers[o].setVisible(false);
            }
        }

        var movement = jsMaps.api.attach_event(mapd,'mousemove',function(e) {
            if (this.draggable == false) return;

            if (this.moving == false || (typeof this.clickx == 'undefined' && typeof this.clicky == 'undefined')) return;

            var position = e.getCursorPosition();
            var cursorPosition = mapd.latLngToPoint(position.lat,position.lng);

            var x = cursorPosition.x;
            var y = cursorPosition.y;

            var latLng = mapd.pointToLatLng(x, y);
            var previousLoc = mapd.pointToLatLng(this.clickx, this.clicky);

            var latVariance = latLng.lat - previousLoc.lat;
            var longVariance = latLng.lng - previousLoc.lng;

            if (latVariance == 0 && longVariance == 0) return;

            this.clickx = x;
            this.clicky = y;

            if (this.movingShape == 'circle') {
                var center = this.getCenter();
                this.setCenter(center.lat+latVariance,center.lng+longVariance);
            } else {
                var newPath = [];
                var path = this.getPath();

                for (var i in path) {
                    if (path.hasOwnProperty(i) == false) continue;
                    newPath.push({lat:path[i].lat+latVariance, lng: path[i].lng+longVariance});
                }

                this.setPath(newPath);
            }

            jsMaps.moveMap(mapd,{x: x,y: y},this);
        }.bind(pol));

        if (typeof pol.mouseUp == 'undefined') {
            pol.mouseUp = jsMaps.api.attach_event(mapd, 'mouseup', function (e) {
                this.moving = false;

                if (typeof this.markers != 'undefined' && this.markers.length > 0) {
                    for (var o in this.markers) {
                        if (this.markers.hasOwnProperty(o) == false) continue;
                        this.markers[o].remove();
                    }

                    this.markers = undefined;
                }

                if (this.movingShape != 'circle') {
                    parameters.paths = this.getPath();
                }

                new jsMaps.editableVector(this, mapd, parameters, shape);

                jsMaps.api.remove_event(mapd, movement);
                mapd.setDraggable(true);
                jsMaps.api.remove_event(mapd, pol.mouseUp);
                pol.mouseUp = undefined;
            }.bind(pol), 1);
        }
    });
};

/**
 *
 * @param vector
 * @param {jsMaps.MapStructure} map
 */
jsMaps.editableCircle = function (vector,map) {
    var center = vector.getCenter();

    var _radius = jsMaps.pixelValue(center.lat,vector.getRadius(),map.getZoom());
    var _point = map.latLngToPoint(center.lat,center.lng);

    var paths = [];
    paths.push(map.pointToLatLng(_point.x+_radius,_point.y)); // right
    paths.push(map.pointToLatLng(_point.x,_point.y+_radius)); // bottom
    paths.push(map.pointToLatLng(_point.x-_radius,_point.y)); // left
    paths.push(map.pointToLatLng(_point.x,_point.y-_radius)); // top

    return paths;
};

/**
 * @param vector
 * @param {jsMaps.MapStructure} map
 * @param parameters
 * @param shape
 * @returns {*}
 */
jsMaps.editableVector = function (vector,map,parameters,shape) {
    if (typeof shape == 'undefined') shape = 'polygon';
    if (vector.editable == false) return;

    var newPaths = (shape == 'circle') ? jsMaps.editableCircle(vector,map) : parameters.paths;
    var pathLength = newPaths.length;

    if (shape == 'polygon') {
        if (pathLength % 2 === 0 || pathLength % 3 === 0) {
            var last = newPaths[pathLength-1];

            if (last.lat != newPaths[0].lat && last.lng != newPaths[0].lng ) {
                newPaths.push(newPaths[0]);
            }
        }
    }

    var npath = [];
    var noCenter = [];
    for (var n in newPaths) {
        if (newPaths.hasOwnProperty(n) == false) continue;

        var testPath = [];
        testPath.push(newPaths[n]);
        testPath.push(newPaths[parseInt(n)+1]);

        var abort = 0;

        for (var p in testPath) {
            if (testPath.hasOwnProperty(p) == false) continue;

            if (p != 'indexOf' && typeof testPath[p] == 'undefined') {
                abort = 1;
            }
        }

        if (typeof testPath[1] == 'undefined') {
            abort = 1;
        }

        newPaths[n].center = 0;

        if ( abort != 1) {
            npath.push(newPaths[n]);
            noCenter.push(newPaths[n]);

            var bounds = jsMaps.api.bounds();

            bounds.addLatLng(testPath[0].lat, testPath[0].lng);
            bounds.addLatLng(testPath[1].lat, testPath[1].lng);

            var path = bounds.getCenter();
            path.center = 1;

            npath.push(path);
        }else {
            npath.push(newPaths[n]);
            noCenter.push(newPaths[n]);
        }
    }

    if (shape != 'circle') {
        vector.setPath(noCenter,true);
    } else {
        npath = noCenter;
    }

    return jsMaps.editVectorMarker(npath,vector,map,shape,parameters);
};

jsMaps.removeVectorMarker = function (vector) {
    if (typeof vector.markers!='undefined' && vector.markers.length > 0) {
        for (var o in vector.markers) {
            if (vector.markers.hasOwnProperty(o) == false) continue;
            vector.markers[o].remove();
        }

        vector.markers = undefined;
    }
};

/**
 *
 * @param path
 * @param vector
 * @param map
 * @param shape
 * @param parameters
 * @returns {Array}
 */
jsMaps.editVectorMarker = function (path,vector,map,shape,parameters) {
    if (vector.editable == false) return [];

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
    innerElement.style.borderRadius="50%";

    innerElement.style.width = '9px';
    innerElement.style.height = '9px';
    innerElement.setAttribute('onmouseover', 'this.style.backgroundColor="yellow"; this.style.cursor="pointer";');
    innerElement.setAttribute('onmouseout', 'this.style.backgroundColor="white"; this.style.cursor="default";');

    // add negative margin to inner element
    // to move the anchor to center of the div
    innerElement.style.marginTop = '-5px';
    innerElement.style.marginLeft = '-5px';

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

    if (typeof vector.markers!='undefined' && vector.markers.length > 0) {
        for (var o in vector.markers) {
            if (vector.markers.hasOwnProperty(o) == false) continue;
            vector.markers[o].remove();
        }

        vector.markers = undefined;
    }

    for (var i in path) {
        if (path.hasOwnProperty(i) == false) continue;
        if (shape == 'polygon' && i == 0)  continue;

        var center = 0;
        var element = outerElement;
        if (typeof path[i].center != 'undefined' &&  path[i].center == 1) {
            element = outerElementClone;
            center = 1;
        }

        var marker = jsMaps.api.marker(map, {
            html: element,
            position:path[i],
            draggable: true
        });

        marker.vector = vector;
        marker.position = path[i];
        marker.draggable = true;
        marker.shape = shape;
        marker.center = center;
        marker.parameters = parameters;

        jsMaps.draggableVectorMarker(marker,map);

        markers.push(marker);
    }

    vector.markers = markers;
    return markers;
};

jsMaps.draggableVectorMarker = function (marker,map) {
    jsMaps.api.attach_event(marker,'drag',function(e) {
        if (this.shape == 'circle') {
            var radius = jsMaps.CRSEarth.distance(
                this.vector.getCenter(),
                this.getPosition());

            for (var mi in this.vector.markers) {
                if (this.vector.markers.hasOwnProperty(mi) == false) continue;
                var circle = this.vector.markers[mi];

                if (this != circle) {
                    circle.setVisible(false);
                }
            }

            this.vector.setRadius(radius);
            return;
        }

        var old_pos = this.position;

        var arrayOfPaths = [];
        var path = this.vector.getPath();

        var prev = {lat: 0,lng: 0};
        var countCenter = 0;

        for (var m in this.vector.markers) {
            if (this.vector.markers.hasOwnProperty(m) == false) continue;
            var mr = this.vector.markers[m];

            if (mr.center == 1) countCenter++;

            if (this.center != mr.center) {
                mr.setVisible(false);
            }
        }

        for (var x in path) {
            if (path.hasOwnProperty(x) == false) continue;

            var p = path[x];
            var pos = this.getPosition();

            var lat = p.lat;
            var lng = p.lng;

            if (lat == old_pos.lat && lng ==old_pos.lng) {
                lat = pos.lat;
                lng = pos.lng;
            }

            if (prev.lat == 0) {
                prev = {lat: lat,lng: lng};
            } else {
                var bounds = jsMaps.api.bounds();

                bounds.addLatLng(prev.lat, prev.lng);
                bounds.addLatLng(lat, lng);

                var pt = bounds.getCenter();

                if (pt.lat == old_pos.lat && pt.lng ==old_pos.lng) {

                    if (countCenter == x) {
                        arrayOfPaths.push ({lat: pt.lat, lng: pt.lng});
                    } else {
                        arrayOfPaths.push ({lat: pos.lat, lng: pos.lng});
                    }

                    pos = pt;
                }

                prev = {lat: lat,lng: lng};
            }

            arrayOfPaths.push ({lat: lat, lng: lng});
        }

        this.vector.setPath(arrayOfPaths,true);
        marker.position = pos;
    });


    var mouseUp = function (e) {
        if (typeof this.vector.markers != 'undefined' && this.vector.markers.length > 0) {
            for (var o in this.vector.markers) {
                if (this.vector.markers.hasOwnProperty(o) == false) continue;
                this.vector.markers[o].remove();
            }

            this.vector.markers = undefined;
        }

        if (this.shape != 'circle') {
            this.parameters.paths = this.vector.getPath();
        }

        new jsMaps.editableVector(this.vector, map, this.parameters, this.shape);
    };

    marker.dragEnd = jsMaps.api.attach_event(marker, 'dragend', mouseUp);
};

/**
 *
 * @param {jsMaps.MapStructure} mapObject
 * @param xy
 * @param attachedObject
 */
jsMaps.moveMap = function (mapObject,xy,attachedObject) {
    var viewPort = mapObject.getViewPort();

    var mapMoveSpeedX = 1;
    var mapMoveSpeedY = 1;
    var mapMoveMaxSpeed = 20;
    var hasObject = (typeof attachedObject != 'undefined');
    var that = this;

    // move left
    if (xy["x"] < viewPort.width / 10) {
        mapMoveSpeedX = (1 - (xy["x"] / (viewPort.width / 10))) * mapMoveMaxSpeed;

        // move left up
        if (xy["y"] < viewPort.height / 10) {
            window.clearInterval(this.mapmoveInterval);
            mapMoveSpeedY = (1 - (xy["y"] / (viewPort.height / 10))) * mapMoveMaxSpeed;
            this.mapmoveInterval = window.setInterval(function () {
                if (hasObject && typeof attachedObject.moving != 'undefined' && attachedObject.moving == false) {
                    window.clearInterval(that.mapmoveInterval);
                    return;
                }

                mapObject.moveXY(mapMoveSpeedX, mapMoveSpeedY);

                if (hasObject) jsMaps.vectorPosition(mapObject,attachedObject,{x: xy["x"]-mapMoveSpeedX,y:  xy["y"]-mapMoveSpeedY});
            }, 10);
        }
        // move left down
        else if (xy["y"] > (viewPort.height - viewPort.height / 10)) {
            window.clearInterval(this.mapmoveInterval);
            mapMoveSpeedY = (1 - (viewPort.height - xy["y"]) / (viewPort.height / 10)) * mapMoveMaxSpeed;
            this.mapmoveInterval = window.setInterval(function () {
                if (hasObject && typeof attachedObject.moving != 'undefined' && attachedObject.moving == false) {
                    window.clearInterval(that.mapmoveInterval);
                    return;
                }

                mapObject.moveXY(mapMoveSpeedX, -mapMoveSpeedY);

                if (hasObject) jsMaps.vectorPosition(mapObject,attachedObject,{x: xy["x"]-mapMoveSpeedX,y:  xy["y"]+mapMoveSpeedY});
            }, 10);
        }
        // move left
        else {
            window.clearInterval(this.mapmoveInterval);
            this.mapmoveInterval = window.setInterval(function () {
                if (hasObject && typeof attachedObject.moving != 'undefined' && attachedObject.moving == false) {
                    window.clearInterval(that.mapmoveInterval);
                    return;
                }
                mapObject.moveXY(mapMoveSpeedX, 0);

                if (hasObject) jsMaps.vectorPosition(mapObject,attachedObject,{x: xy["x"]-mapMoveSpeedX,y:  xy["y"]});
            }, 10);
        }
    }
    // move right
    else if (xy["x"] > (viewPort.width - viewPort.width / 10)) {
        mapMoveSpeedX = (1 - (viewPort.width - xy["x"]) / (viewPort.width / 10)) * mapMoveMaxSpeed;
        // move right up
        if (xy["y"] < viewPort.height / 10) {
            window.clearInterval(this.mapmoveInterval);
            mapMoveSpeedY = (1 - (xy["y"] / (viewPort.height / 10))) * mapMoveMaxSpeed;
            this.mapmoveInterval = window.setInterval(function () {
                if (hasObject && typeof attachedObject.moving != 'undefined' && attachedObject.moving == false) {
                    window.clearInterval(that.mapmoveInterval);
                    return;
                }
                mapObject.moveXY(-mapMoveSpeedX, mapMoveSpeedY);

                if (hasObject) jsMaps.vectorPosition(mapObject,attachedObject,{x: xy["x"]+mapMoveSpeedX,y:  xy["y"]-mapMoveSpeedY});
            }, 10);
        }
        // move right down
        else if (xy["y"] > (viewPort.height - viewPort.height / 10)) {
            window.clearInterval(this.mapmoveInterval);
            mapMoveSpeedY = (1 - (viewPort.height - xy["y"]) / (viewPort.height / 10)) * mapMoveMaxSpeed;
            this.mapmoveInterval = window.setInterval(function () {
                if (hasObject && typeof attachedObject.moving != 'undefined' && attachedObject.moving == false) {
                    window.clearInterval(that.mapmoveInterval);
                    return;
                }
                mapObject.moveXY(-mapMoveSpeedX, -mapMoveSpeedY);

                if (hasObject) jsMaps.vectorPosition(mapObject,attachedObject,{x: xy["x"]+mapMoveSpeedX,y:  xy["y"]+mapMoveSpeedY});
            }, 10);
        }
        // move right
        else {
            window.clearInterval(this.mapmoveInterval);

            this.mapmoveInterval = window.setInterval(function () {
                if (hasObject && typeof attachedObject.moving != 'undefined' && attachedObject.moving == false) {
                    window.clearInterval(that.mapmoveInterval);
                    return;
                }
                mapObject.moveXY(-mapMoveSpeedX, 0);

                if (hasObject) jsMaps.vectorPosition(mapObject,attachedObject,{x: xy["x"]+mapMoveSpeedX,y:  xy["y"]});
            }, 10);
        }
    }
    else {
        // move up
        if (xy["y"] < viewPort.height / 10) {
            window.clearInterval(this.mapmoveInterval);
            mapMoveSpeedY = (1 - (xy["y"] / (viewPort.height / 10))) * mapMoveMaxSpeed;
            this.mapmoveInterval = window.setInterval(function () {
                if (hasObject && typeof attachedObject.moving != 'undefined' && attachedObject.moving == false) {
                    window.clearInterval(that.mapmoveInterval);
                    return;
                }

                mapObject.moveXY(0, mapMoveSpeedY);
                if (hasObject) jsMaps.vectorPosition(mapObject,attachedObject,{x: xy["x"],y:  xy["y"]-mapMoveSpeedY});
            }, 10);
        }
        // move down
        else if (xy["y"] > (viewPort.height - viewPort.height / 10)) {
            window.clearInterval(this.mapmoveInterval);
            mapMoveSpeedY = (1 - (viewPort.height - xy["y"]) / (viewPort.height / 10)) * mapMoveMaxSpeed;
            this.mapmoveInterval = window.setInterval(function () {
                if (hasObject && typeof attachedObject.moving != 'undefined' && attachedObject.moving == false) {
                    window.clearInterval(that.mapmoveInterval);
                    return;
                }

                mapObject.moveXY(0, -mapMoveSpeedY);
                if (hasObject) jsMaps.vectorPosition(mapObject,attachedObject,{x: xy["x"],y:  xy["y"]+mapMoveSpeedY});
            }, 10);
        }
        // stop moving
        else {
            window.clearInterval(this.mapmoveInterval);
            mapMoveSpeedX = 1;
            mapMoveSpeedY = 1;
        }
    }
};