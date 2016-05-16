jsMaps.Native.Vector = {
    vml: 'vml',
    svg: 'svg',
    elements: {
        polyLine: 'polyLine',
        polygon: 'polygon',
        circle: 'circle'
    }
};

jsMaps.Native.VectorCount = 0;

/**
 * Vector generator
 *
 * @class
 */
jsMaps.Native.Overlay.Vector = function (vectorOptions, vectorPoints, vectorType) {
    this._backend = jsMaps.Native.Vector.svg;
    if (jsMaps.Native.Browser.ielt9) this._backend = jsMaps.Native.Vector.vml;

    this._getCircleCoordinate = function () {
        var latin = this._vectorOptions.center.lat,
            lonin = this._vectorOptions.center.lng,
            radius = this._vectorOptions.radius;

        var locs = [];
        var lat1 = latin * Math.PI / 180.0;
        var lon1 = lonin * Math.PI / 180.0;
        var d = radius / 1000 / 6371;
        var x;
        for (x = 0; x <= 360; x+=10) {
            var tc = (x / 90) * Math.PI / 2;
            var lat = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc));
            lat = 180.0 * lat / Math.PI;
            var lon;
            if (Math.cos(lat1) == 0) {
                lon = lonin; // endpoint a pole
            }
            else {
                lon = ((lon1 - Math.asin(Math.sin(tc) * Math.sin(d) / Math.cos(lat1)) + Math.PI) % (2 * Math.PI)) - Math.PI;
            }
            lon = 180.0 * lon / Math.PI;
            var loc = new jsMaps.geo.Location(lat, lon);
            locs.push(loc);
        }
        return locs;
    };

    if (vectorType == jsMaps.Native.Vector.elements.circle) {
        vectorPoints = [];
        vectorPoints.push(vectorOptions.center);
    }

    this._vectorPoints   = vectorPoints;

    this._vectorType     = vectorType;
    this._vectorOptions  = vectorOptions;
    this.clickable       = (typeof vectorOptions.clickable!='undefined') ? vectorOptions.clickable: true;

    this._vectorNumber = jsMaps.Native.VectorCount;
    jsMaps.Native.VectorCount++;


    this._createVectorElement = function () {
        switch (this._backend) {
            case jsMaps.Native.Vector.svg:
                if (typeof this.theMap.vectorCanvas == 'undefined') {
                    this.theMap.vectorCanvas = document.createElementNS("http://www.w3.org/2000/svg","svg");
                    this.theMap.vectorCanvas.setAttribute("viewBox","0 0 "+this.theMap.mapsize.width+" "+this.theMap.mapsize.height);
                }

                this.vectorEl = this.theMap.vectorCanvas;

                this.vectorEl.width = this.theMap.mapsize.width;
                this.vectorEl.height = this.theMap.mapsize.height;
                this.vectorEl.setAttribute("viewBox","0 0 "+this.theMap.mapsize.width+" "+this.theMap.mapsize.height);
                break;
            case jsMaps.Native.Vector.vml:
                if(document.namespaces){
                    if (document.namespaces['v'] == null) {
                        document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', "#default#VML");

                        var stl = document.createStyleSheet();
                        stl.addRule("v\\:group", "behavior: url(#default#VML);");
                        stl.addRule("v\\:polyline", "behavior: url(#default#VML);");
                        stl.addRule("v\\:stroke", "behavior: url(#default#VML);");
                        stl.addRule("v\\:fill", "behavior: url(#default#VML);");
                        stl.addRule("v\\:shape", "behavior: url(#default#VML);display:inline-block");
                        stl.addRule("v\\:path", "behavior: url(#default#VML);");
                    }
                }

                if (typeof this.theMap.vectorCanvas == 'undefined') {
                    this.theMap.vectorCanvas = document.createElement("div");
                }

                this.vectorEl = this.theMap.vectorCanvas;
                break;
            default:
                throw "Cannot create element, unknown backend " + this._backend;
        }

        this.vectorEl.style.width = this.theMap.mapsize.width + "px";
        this.vectorEl.style.height = this.theMap.mapsize.height + "px";
        this.vectorEl.setAttribute("height", this.theMap.mapsize.height + "px");
        this.vectorEl.setAttribute("width", this.theMap.mapsize.width + "px");
        this.vectorEl.style.position = "absolute";
        this.vectorEl.style.top = "0";
        this.vectorEl.style.left = "0";
    };

    this.clear = function () {
        this._clearVector();
    };

    this.destroy = function () {
        if (this.root) {
            this.vectorEl.removeChild(this.root);
        }

        this._removeMarkers();
    };

    this._setStyle = function () {
        var opacity,fillOpacity,strokeOpacity,stroke,fill,strokeWidth,path;

        opacity       = (this._vectorOptions.opacity)       ? this._vectorOptions.opacity: 1;
        fillOpacity   = (this._vectorOptions.fillOpacity)   ? this._vectorOptions.fillOpacity: 1;
        strokeOpacity = (this._vectorOptions.strokeOpacity) ? this._vectorOptions.strokeOpacity: 1;

        strokeWidth = (this._vectorOptions.strokeWidth) ? this._vectorOptions.strokeWidth: 4;

        switch (this._backend) {
            case jsMaps.Native.Vector.svg:
                stroke        = (this._vectorOptions.stroke)        ? jsMaps.convertHex(this._vectorOptions.stroke, 100 * strokeOpacity,false): '#FF0000';
                fill          = (this._vectorOptions.fill)          ? jsMaps.convertHex(this._vectorOptions.fill, 100 * fillOpacity,false) : '';

                if (this._vectorType == jsMaps.Native.Vector.elements.polygon || this._vectorType == jsMaps.Native.Vector.elements.circle) {
                    this.vectorPath.setAttribute("fill", fill);
                } else {
                    this.vectorPath.setAttribute("fill", "none");
                }

                this.vectorPath.setAttribute("stroke",stroke);
                this.vectorPath.setAttribute("stroke-width",strokeWidth);
                break;
            case jsMaps.Native.Vector.vml:
                stroke        = (this._vectorOptions.stroke)        ? this._vectorOptions.stroke : '#FF0000';
                fill          = (this._vectorOptions.fill)          ? this._vectorOptions.fill : '';

                if (this._vectorType == jsMaps.Native.Vector.elements.polyLine || fill == ''){
                    this.fillEl.setAttribute("on","false");
                } else {
                    this.fillEl.setAttribute("true","false");
                    this.fillEl.setAttribute("color",fill);
                    this.fillEl.setAttribute("opacity",fillOpacity);
                }

                this.strokeEl.setAttribute("opacity",strokeOpacity*100+'%');
                this.strokeEl.setAttribute("color",stroke);
                this.strokeEl.setAttribute("weight",strokeWidth+'px');

                break;
            default:
                throw "Cannot init element, unknown backend " + this._backend;
        }
    };

    this._initElement = function () {
        var opacity,fillOpacity,strokeOpacity,stroke,fill,strokeWidth,path;

        opacity       = (this._vectorOptions.opacity)       ? this._vectorOptions.opacity: 1;
        fillOpacity   = (this._vectorOptions.fillOpacity)   ? this._vectorOptions.fillOpacity: 1;
        strokeOpacity = (this._vectorOptions.strokeOpacity) ? this._vectorOptions.strokeOpacity: 1;

        strokeWidth = (this._vectorOptions.strokeWidth) ? this._vectorOptions.strokeWidth: 4;

        switch (this._backend) {
            case jsMaps.Native.Vector.svg:
                stroke        = (this._vectorOptions.stroke)        ? jsMaps.convertHex(this._vectorOptions.stroke, 100 * strokeOpacity,false): '#FF0000';
                fill          = (this._vectorOptions.fill)          ? jsMaps.convertHex(this._vectorOptions.fill, 100 * fillOpacity,false) : '';

                this.root=document.createElementNS("http://www.w3.org/2000/svg","g");

                this.vectorPath = document.createElementNS("http://www.w3.org/2000/svg","path");
                this.root.appendChild(this.vectorPath);

                if (this._vectorType == jsMaps.Native.Vector.elements.polygon || this._vectorType == jsMaps.Native.Vector.elements.circle) {
                    this.vectorPath.setAttribute("fill", fill);
                } else {
                    this.vectorPath.setAttribute("fill", "none");
                }

                this.vectorPath.setAttribute("stroke",stroke);
                this.vectorPath.setAttribute("stroke-width",strokeWidth);

                this.vectorPath.style.pointerEvents = "visiblePainted";
                this.vectorEl.appendChild(this.root);
                break;
            case jsMaps.Native.Vector.vml:
                stroke        = (this._vectorOptions.stroke)        ? this._vectorOptions.stroke : '#FF0000';
                fill          = (this._vectorOptions.fill)          ? this._vectorOptions.fill : '';

                if (this._vectorType == jsMaps.Native.Vector.elements.circle) {
                    this.vectorPath= document.createElement("v:oval");
                    this.vectorPath.style.position = 'absolute';
                } else {
                    this.vectorPath= document.createElement("v:polyline");
                }

                this.fillEl = document.createElement("v:fill");

                if (this._vectorType == jsMaps.Native.Vector.elements.polyLine || fill == ''){
                    this.fillEl.setAttribute("on","false");
                } else {
                    this.fillEl.setAttribute("true","false");
                    this.fillEl.setAttribute("color",fill);
                    this.fillEl.setAttribute("opacity",fillOpacity);
                }

                this.strokeEl = document.createElement("v:stroke");
                this.strokeEl.setAttribute("opacity",strokeOpacity*100+'%');
                this.strokeEl.setAttribute("color",stroke);
                this.strokeEl.setAttribute("weight",strokeWidth+'px');

                this.vectorPath.appendChild(this.fillEl);
                this.vectorPath.appendChild(this.strokeEl);
                this.root = this.vectorPath;

                this.vectorEl.appendChild(this.root);
                break;
            default:
                throw "Cannot init element, unknown backend " + this._backend;
        }
    };

    this._clearVector = function () {
        if (this._vectorNumber ==  0) {
            this.vectorEl.style.width = this.theMap.mapsize.width + "px";
            this.vectorEl.style.height = this.theMap.mapsize.height + "px";

            this.vectorEl.setAttribute("viewBox","0 0 "+this.theMap.mapsize.width+" "+this.theMap.mapsize.height);

            this.vectorEl.points = undefined;
        }

        if (jsMaps.Native.Browser.any3d) {
            if (this._vectorNumber ==  0) {
                jsMaps.Native.Utils.setTransform(this.vectorEl, {x: 0, y: 0});
                jsMaps.Native.Utils.setTransformOrigin(this.vectorEl, {x: 0, y: 0});
            }
        } else {
            if (this._vectorNumber ==  0) {
                this.vectorEl.style.top = 0;
                this.vectorEl.style.left = 0;
            }

            if (this._backend == jsMaps.Native.Vector.vml) {
                if (this._vectorType == jsMaps.Native.Vector.elements.circle) {
                    this.vectorPath.style.width = "0px";
                    this.vectorPath.style.height = "0px";
                } else {
                    this.vectorPath.style.width = this.theMap.mapsize.width + "px";
                    this.vectorPath.style.height = this.theMap.mapsize.height + "px";
                }
            }
        }

        this.vectorPath.style.display = "none";

        if (this._backend == jsMaps.Native.Vector.vml) {
            this.vectorPath.style.display = "";

            if (this._vectorType != jsMaps.Native.Vector.elements.circle) {
                this.root.points.value="";
            }
        }
    };

    this._addPath = function (point,i) {
        switch (this._backend) {
            case jsMaps.Native.Vector.svg:
                if (this.vectorPath.style.display== "none") this.vectorPath.style.display = "";

                if (this._vectorType == jsMaps.Native.Vector.elements.polyLine || this._vectorType == jsMaps.Native.Vector.elements.polygon) {
                    if (i == 0) {
                        this.svgPath = "M"+point["x"]+","+point["y"]
                    } else {
                        this.svgPath += " L"+point["x"]+","+point["y"];
                    }

                    if (i == this._vectorPoints.length - 1) {
                        var firstSvgPoint = this.theMap.latlngToXY(this._vectorPoints[0]);

                        if (this._vectorType == jsMaps.Native.Vector.elements.polygon) {

                            if (firstSvgPoint["x"] != point["x"] && firstSvgPoint["y"] != point["y"]) {
                                this.svgPath += " L" + firstSvgPoint["x"] + "," + firstSvgPoint["y"] + " ";
                            }

                            this.svgPath += " z";
                        }
                    }
                }

                break;
            case jsMaps.Native.Vector.vml:
                point["x"] = Math.round(point["x"]);
                point["y"] = Math.round(point["y"]);

                if (i == 0) {
                    this.vmlPath = " " + point["x"] + "," + point["y"] + " ";
                } else {
                    this.vmlPath += " " + point["x"] + "," + point["y"] + " ";
                }
                break;
            default:
                throw "Cannot clear vector, unknown backend " + this._backend;
        }
    };

    this._finishDraw = function () {
        switch (this._backend) {
            case jsMaps.Native.Vector.svg:
                this.vectorPath.setAttribute("d",this.svgPath);
                break;
            case jsMaps.Native.Vector.vml:
                if (this._vectorType == jsMaps.Native.Vector.elements.polygon) {
                    this.vectorPath.setAttribute("filled",true);
                } else {
                    this.vectorPath.setAttribute("filled",false);
                }

                if (this._vectorType != jsMaps.Native.Vector.elements.circle) {
                    this.root.points.value = this.vmlPath;
                }
                break;
            default:
                throw "Cannot clear vector, unknown backend " + this._backend;
        }
    };


    /**
     * Attaching Eventhandlers to the marker.
     * e.g. for showing infobox on a click on the marker
     * @param t
     * @param f
     * @param fc
     * @param c
     */
    this.attachEvent = function (t, f, fc, c) {
        var usingElement = this.marker;

        if (!fc) fc = this;
        if (!c) c = false;

        // workaround for detecting a click on touch devices
        // original click event is suppressed by touchmove-handler of the map
        if ((jsMaps.Native.Browser.mobile)) {
            if (t == "click") {
                this.originalClickFunction = f;
                // attach handler to shape area

                jsMaps.Native.Event.attach(this.vectorPath, "touchstart", this._touchclickdetectstart, fc, c);
                jsMaps.Native.Event.attach(this.vectorPath, "touchmove", this._touchclickdetectmove, fc, c);
                jsMaps.Native.Event.attach(this.vectorPath, "touchend", this._touchclickdetectstop, fc, c);

                usingElement = this.marker;
            }
        }

        // normal devices
        else {
            if (t == "click") {
                this.originalClickFunction = f;

                jsMaps.Native.Event.attach(this.vectorPath, jsMaps.Native.Event.mousedown, this._mouseclickdetectstart, fc, c);
                jsMaps.Native.Event.attach(this.vectorPath, jsMaps.Native.Event.mousemove, this._mouseclickdetectmove, fc, c);
                jsMaps.Native.Event.attach(this.vectorPath, jsMaps.Native.Event.mouseup, this._mouseclickdetectstop, fc, c);

                usingElement = this.marker;
            }
        }

        return usingElement;
    };

    this.markers = [];

    this._removeMarkers = function () {
        if (this.markers.length > 0) {
            for (var o in this.markers) {
                if (this.markers.hasOwnProperty(o) == false) continue;
                if (this.markers[o].moving == true) {
                    this.markers[o].setVisible(false);
                    continue;
                }

                while (this.markers[o].marker.firstChild) {
                    this.markers[o].marker.removeChild(this.markers[o].marker.firstChild);
                }

                if (this.markers[o].shadow) {
                    while (this.markers[o].shadow.firstChild) {
                        this.markers[o].shadow.removeChild(this.markers[o].shadow.firstChild);
                    }
                }

                this.markers[o].clear();
                this.markers[o].destroy();

                delete this.markers[o];
            }
        }
    };

    this.setVisible = function (visible) {
        if (visible) {
            this.vectorPath.style.display = '';
            this.render(true);
        } else {
            this._removeMarkers();
            this.vectorPath.style.display = 'none';
        }
    };

    this._circleMarkers = function() {
        var _radius = jsMaps.pixelValue(this._vectorOptions.center.lat,this._vectorOptions.radius,this.theMap.zoom());
        var _point = this.theMap.latlngToXY(this._vectorOptions.center);

        var paths = [];
        paths.push(this.theMap.XYTolatlng(_point.x+_radius,_point.y)); // right
        paths.push(this.theMap.XYTolatlng(_point.x,_point.y+_radius)); // bottom
        paths.push(this.theMap.XYTolatlng(_point.x-_radius,_point.y)); // left
        paths.push(this.theMap.XYTolatlng(_point.x,_point.y-_radius)); // top

        return paths;
    };

    this._attachMarkers = function () {
        if (this.moving) return;
        this._removeMarkers();

        if (this._vectorOptions.editable) {
            var strokeOpacity = (this._vectorOptions.strokeOpacity) ? this._vectorOptions.strokeOpacity: 1;
            var strokeWidth = (this._vectorOptions.strokeWidth) ? this._vectorOptions.strokeWidth: 4;

            var stroke;
            if (this._backend == jsMaps.Native.Vector.svg) stroke = (this._vectorOptions.stroke)   ? jsMaps.convertHex(this._vectorOptions.stroke, 100 * strokeOpacity,false): '#FF0000';
            if (this._backend == jsMaps.Native.Vector.vml) stroke = (this._vectorOptions.stroke)   ? this._vectorOptions.stroke : '#FF0000';

            var stWidth = parseFloat(strokeWidth);
            if (stWidth < 9 ) stWidth = 9;

            var newPaths = (this._vectorType == jsMaps.Native.Vector.elements.circle) ? this._circleMarkers() : this._vectorPoints;
            var bounds;

            var _list = [];
            for (var io in newPaths) {
                if (newPaths.hasOwnProperty(io) == false) continue;

                newPaths[io].pos = io;
                newPaths[io].isCenter = 0;

                if (typeof newPaths[parseInt(io) + 1] != 'undefined' && newPaths[parseInt(io) + 1].isCenter !=1) {
                    bounds = new jsMaps.Native.InnerBounds({lat:0,lng:0},{lat:0,lng:0});
                    bounds.extend(newPaths[io]);
                    bounds.extend(newPaths[parseInt(io) + 1]);

                    var pt = bounds.getCenter();
                    pt.isCenter = 1;
                    pt.pos = io;

                    _list.push(newPaths[io]);

                    if (this._vectorType != jsMaps.Native.Vector.elements.circle) {
                         _list.push(bounds.getCenter());
                    }
                } else {
                    _list.push(newPaths[io]);

                    if (this._vectorType == jsMaps.Native.Vector.elements.polygon) {
                        var last = newPaths[io];

                        if (last.lat != _list[0].lat && last.lng != _list[0].lng) {
                            bounds = new jsMaps.Native.InnerBounds({lat:0,lng:0},{lat:0,lng:0});
                            bounds.extend(newPaths[io]);
                            bounds.extend(_list[0]);

                            pt = bounds.getCenter();
                            pt.isCenter = 1;
                            pt.pos = io;

                            _list.push(pt);
                        }
                    }
                }
            }

            for (var i in _list) {
                if (_list.hasOwnProperty(i) == false) continue;

                var p = _list[i];

                var div = document.createElement("div");
                div.style.backgroundColor="white";
                div.style.width=stWidth+"px";
                div.style.height=stWidth+"px";
                div.onmouseover = function () {
                    this.style.backgroundColor="yellow";
                };

                div.onmouseout = function () {
                    this.style.backgroundColor="white";
                };

                if (p.isCenter == 1) {
                    div.style.border="1px solid "+stroke;
                    div.style.borderRadius="50%";

                    div.style.opacity = 0.7;
                    div.style.filter = "alpha( opacity=60 )";
                } else {
                    div.style.border="1px solid "+stroke;
                    div.style.borderRadius="50%";
                }

                var icon = new jsMaps.Native.Overlay.MarkerImage();
                icon.url = div;
                icon.anchor =  {'x':parseInt(stWidth)/2,'y': parseInt(stWidth)};

                var options = {
                    position: new jsMaps.geo.Location(p.lat,  p.lng),
                    map: this.theMap,
                    title: "",
                    draggable: true,
                    visible: true,
                    icon: icon,
                    raiseOnDrag: false
                };

                var marker = new jsMaps.Native.Overlay.Marker(options);
                marker.vectorObject = this;
                marker.vectorPosition = p.pos;
                marker.isCenter = p.isCenter;

                marker.addCallbackMoveFunction(function () {
                    if (this.vectorObject._vectorType == jsMaps.Native.Vector.elements.circle) {
                        this.vectorObject._vectorOptions.radius = jsMaps.CRSEarth.distance(
                            this.vectorObject._vectorOptions.center,
                            this.position);

                        this.vectorObject.render(true);
                        return;
                    }

                    if (this.isCenter == 0) {
                        this.vectorObject._vectorPoints[this.vectorPosition] = this.position;
                        this.vectorObject.render(true);
                    } else {
                        if (this.posAdded == false) {
                            var newList = [];

                            var newPos = {lat: this.position.lat,lng: this.position.lng ,isCenter: 0,pos: this.vectorPosition, recent: true};
                            var cp = 0;

                            for (var z in this.vectorObject._vectorPoints) {
                                if (this.vectorObject._vectorPoints.hasOwnProperty(z) == false) continue;
                                newList.push(this.vectorObject._vectorPoints[z]);

                                if (z == this.vectorPosition) {
                                    newList.push(newPos);
                                }

                                cp++;
                            }

                            this.vectorObject._vectorPoints = newList;

                            this.posAdded = true;
                            this.vectorObject.render(true);
                        } else {
                            for (var x in this.vectorObject._vectorPoints) {
                                if (this.vectorObject._vectorPoints.hasOwnProperty(x) == false) continue;

                                var curr = this.vectorObject._vectorPoints[x];
                                if (typeof curr.recent != 'undefined') {
                                    this.vectorObject._vectorPoints[x] = this.position;
                                    break;
                                }
                            }

                            this.vectorObject.render(true);
                        }
                    }
                });

                marker.addCallbackFunction(function () {
                    this.posAdded=false;
                });

                this.markers.push(marker);
            }
        }
    };

    this.init = function (theMap) {
        this.theMap = theMap;

        if (typeof this.theMap.vectorContainer == 'undefined') {
            this.theMap.movingVector = false;
            this.theMap.vectorContainer = jsMaps.Native.CreateDiv(theMap.overlayDiv,'vector-container');
            this.theMap.overlayDiv.appendChild(this.theMap.vectorContainer);
        }

        this._createVectorElement();
        this._initElement();

        this.theMap.vectorContainer.appendChild(this.vectorEl);

        this._makeMovable();
    };

    this.pointsBounds = function (coordinates) {
        if  (this._vectorType == jsMaps.Native.Vector.elements.circle) {
            coordinates = this._getCircleCoordinate();
        } else {
            if (!coordinates) coordinates = this._vectorPoints;
        }

        var boundsSouth = 90;
        var boundsNorth = -90;
        var boundsWest = 180;
        var boundsEast = -180;

        for (var i in coordinates) {
            if (coordinates.hasOwnProperty(i) == false) continue;

            var lng = coordinates[i].lng;

            var lat = coordinates[i].lat;
            if (lat > boundsNorth) {
                boundsNorth = lat;
            }
            if (lat < boundsSouth) {
                boundsSouth = lat;
            }
            if (lng > boundsEast) {
                boundsEast = lng;
            }
            if (lng < boundsWest) {
                boundsWest = lng;
            }
        }

        //return line bounds
        var sw = new jsMaps.geo.Location(boundsSouth, boundsWest);
        var ne = new jsMaps.geo.Location(boundsNorth, boundsEast);
        var b = new jsMaps.Native.InnerBounds(sw, ne);

        return (b);
    };

    this.adjustOnMovement = function (all) {
        var dxLeft = this.vectorEl.bottomleft.x;
        var dxTop = this.vectorEl.topright.y;

        switch (this._backend) {
            case jsMaps.Native.Vector.svg:
                this.vectorEl.style.display = "";
                if (this._vectorNumber > 0 && typeof all == 'undefined') return;

                this.vectorEl.style.width = (this.vectorEl.topright.x - this.vectorEl.bottomleft.x) + "px";
                this.vectorEl.style.height = (-this.vectorEl.topright.y + this.vectorEl.bottomleft.y)+ "px";

                if (jsMaps.Native.Browser.any3d) {
                    jsMaps.Native.Utils.setTransform(this.vectorEl, {x: dxLeft, y: dxTop},1);
                    jsMaps.Native.Utils.setTransformOrigin(this.vectorEl, {x: (-1 * dxLeft), y: (-1 * dxTop)});
                } else {
                    this.vectorEl.style.top = dxTop + "px";
                    this.vectorEl.style.left = dxLeft + "px";
                }
                break;
            case jsMaps.Native.Vector.vml:
                this.vectorPath.style.display = "none";
                break;
        }
    };

    /**
     * workaround for detecting a mouseclick on a marker eg. to open infowindow
     * to not open infowindow accidentially when marker is moved
     */
    this._mouseclickdetectstart = function (evt) {
        //ewi: which mousebutton?
        this.leftclick = false;
        if (!evt) evt = window.event;
        if (evt.which) this.leftclick = (evt.which == 1);
        else if (evt.button) this.leftclick = (evt.button == 0) || (evt.button == 1);
    };

    this._mouseclickdetectmove = function () {
        this.leftclick = false;
    };

    this._mouseclickdetectstop = function () {
        if (this.leftclick)
            this.originalClickFunction();
    };

    this._mousedown = function (evt) {
        if (this._vectorOptions.draggable == false) return;

        this._mouseclickdetectstart(evt);

        if (typeof evt.touches=='undefined' || evt.touches.length == 0) {
            if (this.leftclick == false) return;
        }

        if (typeof evt.touches!='undefined' &&  evt.touches.length > 1 ) {
            return;
        }

        this.moving = true;
        jsMaps.Native.Event.trigger(this.vectorPath,jsMaps.api.supported_events.dragstart);

        var useEvt = (typeof evt.touches!='undefined' && typeof evt.touches[0] !='undefined') ? evt.touches[0] : evt;

        // calculate mousecursor-offset on marker div
        this.clickx =  this.theMap.pageX(useEvt);
        this.clicky = this.theMap.pageY(useEvt);

        jsMaps.Native.Event.stopPropagation(evt);
        jsMaps.Native.Event.preventDefault(evt);

        var w = (jsMaps.Native.Browser.ie) ? this.theMap.mapParent: window;

        jsMaps.Native.Event.attach(w, "mousemove", this._mousemove, this, false);
        jsMaps.Native.Event.attach(w, "mouseup", this._mouseup, this, false);

        jsMaps.Native.Event.attach(w, "touchmove", this._mousemove, this, false);
        jsMaps.Native.Event.attach(w, "touchend", this._mouseup, this, false);

        jsMaps.Native.Event.attach(parent, "mouseup", this._mouseup, this, false);
        jsMaps.Native.Event.attach(document.documentElement, "mouseup", this._mouseup, this, false);

        jsMaps.Native.setCursor(this.theMap.clone, "grabbing");
    };

    this._moveVector = function (point) {
        var previousLoc = this.theMap.XYTolatlng(this.clickx, this.clicky);
        var latLng = this.theMap.XYTolatlng(point.x,point.y);

        this.theMap.movingVector = true;
        this.vectorEl.points = point;

        var latVariance = latLng.lat - previousLoc.lat;
        var longVariance = latLng.lng - previousLoc.lng;

        for (var i in this._vectorPoints) {
            if (this._vectorPoints.hasOwnProperty(i) == false) continue;

            this._vectorPoints[i].lat += latVariance;
            this._vectorPoints[i].lng += longVariance;
        }

        this.vectorEl.bottomleft = this.theMap.latlngToXY(this.theMap.mapBounds(false).sw());
        this.vectorEl.topright = this.theMap.latlngToXY(this.theMap.mapBounds(false).ne());

        this.render(true);
    };

    var mapMoveSpeedX = 1;
    var mapMoveSpeedY = 1;
    var mapMoveMaxSpeed = 20;

    this._mousemove = function (evt) {
        if (this.moving) {
            var useEvt = (typeof evt.touches!='undefined' && typeof evt.touches[0] !='undefined') ? evt.touches[0] : evt;

            this._removeMarkers();

            var x = this.theMap.pageX(useEvt);
            var y = this.theMap.pageY(useEvt);

            jsMaps.Native.Event.trigger(this.vectorPath,jsMaps.api.supported_events.drag);

            var latLng = this.theMap.XYTolatlng(x, y);
            var previousLoc = this.theMap.XYTolatlng(this.clickx, this.clicky);

            this.xy = {x: x, y: y};

            var latVariance = latLng.lat - previousLoc.lat;
            var longVariance = latLng.lng - previousLoc.lng;

            if (latVariance == 0 && longVariance == 0) return;

            this.clickx =  this.theMap.pageX(useEvt);
            this.clicky =  this.theMap.pageY(useEvt);

            if (this._vectorType == jsMaps.Native.Vector.elements.circle) {
                this._vectorOptions.center.lat  += latVariance;
                this._vectorOptions.center.lng  += longVariance;
            } else {
                for (var i in this._vectorPoints) {
                    if (this._vectorPoints.hasOwnProperty(i) == false) continue;

                    this._vectorPoints[i].lat += latVariance;
                    this._vectorPoints[i].lng += longVariance;
                }
            }

            this.vectorEl.bottomleft = this.theMap.latlngToXY(this.theMap.mapBounds().sw());
            this.vectorEl.topright = this.theMap.latlngToXY(this.theMap.mapBounds().ne());

            this.render(true);

            jsMaps.Native.Event.stopPropagation(evt);

            this._moveMap();
        }
    };

    this._mouseup = function (evt) {
        jsMaps.Native.Event.trigger(this.vectorPath,jsMaps.api.supported_events.dragend);
        jsMaps.Native.Event.trigger(this.vectorPath,jsMaps.api.additional_events.position_changed);

        if (this.theMap.movingVector) {
            this.theMap.movingVector = false;
        }

        if (this.moving == true) {
            this.moving = false;
            jsMaps.Native.setCursor(this.theMap.clone, "pointer");

            // stop moving map
            mapMoveSpeed = 1;
            mapMoveSpeedX = 1;
            mapMoveSpeedY = 1;
            window.clearInterval(this.mapmoveInterval);

            this.render(true);
        }
    };


    this._moveMap = function () {
        var that = this;
        // move left
        if (this.xy["x"] < this.theMap.size.width / 10) {
            mapMoveSpeedX = (1 - (this.xy["x"] / (this.theMap.size.width / 10))) * mapMoveMaxSpeed;
            // move left up
            if (this.xy["y"] < this.theMap.size.height / 10) {
                window.clearInterval(this.mapmoveInterval);
                mapMoveSpeedY = (1 - (this.xy["y"] / (this.theMap.size.height / 10))) * mapMoveMaxSpeed;
                this.mapmoveInterval = window.setInterval(function () {
                    that.theMap.moveXY(mapMoveSpeedX, mapMoveSpeedY);

                    that._moveVector({x: that.xy["x"]-mapMoveSpeedX,y:  that.xy["y"]-mapMoveSpeedY});
                }, 10);
            }
            // move left down
            else if (this.xy["y"] > (this.theMap.size.height - this.theMap.size.height / 10)) {
                window.clearInterval(this.mapmoveInterval);
                mapMoveSpeedY = (1 - (this.theMap.size.height - this.xy["y"]) / (this.theMap.size.height / 10)) * mapMoveMaxSpeed;
                this.mapmoveInterval = window.setInterval(function () {
                    that.theMap.moveXY(mapMoveSpeedX, -mapMoveSpeedY);

                    that._moveVector({x: that.xy["x"]-mapMoveSpeedX,y:  that.xy["y"]+mapMoveSpeedY});
                }, 10);
            }
            // move left
            else {
                window.clearInterval(this.mapmoveInterval);
                this.mapmoveInterval = window.setInterval(function () {
                    that.theMap.moveXY(mapMoveSpeedX, 0);

                    that._moveVector({x: that.xy["x"]-mapMoveSpeedX,y:  that.xy["y"]});
                }, 10);
            }
        }
        // move right
        else if (this.xy["x"] > (this.theMap.size.width - this.theMap.size.width / 10)) {
            mapMoveSpeedX = (1 - (this.theMap.size.width - this.xy["x"]) / (this.theMap.size.width / 10)) * mapMoveMaxSpeed;
            // move right up
            if (this.xy["y"] < this.theMap.size.height / 10) {
                window.clearInterval(this.mapmoveInterval);
                mapMoveSpeedY = (1 - (this.xy["y"] / (this.theMap.size.height / 10))) * mapMoveMaxSpeed;
                this.mapmoveInterval = window.setInterval(function () {
                    that.theMap.moveXY(-mapMoveSpeedX, mapMoveSpeedY);

                    that._moveVector({x: that.xy["x"]+mapMoveSpeedX,y:  that.xy["y"]-mapMoveSpeedY});
                }, 10);
            }
            // move right down
            else if (this.xy["y"] > (this.theMap.size.height - this.theMap.size.height / 10)) {
                window.clearInterval(this.mapmoveInterval);
                mapMoveSpeedY = (1 - (this.theMap.size.height - this.xy["y"]) / (this.theMap.size.height / 10)) * mapMoveMaxSpeed;
                this.mapmoveInterval = window.setInterval(function () {
                    that.theMap.moveXY(-mapMoveSpeedX, -mapMoveSpeedY);

                    that._moveVector({x: that.xy["x"]+mapMoveSpeedX,y:  that.xy["y"]+mapMoveSpeedY});
                }, 10);
            }
            // move right
            else {
                window.clearInterval(this.mapmoveInterval);

                this.mapmoveInterval = window.setInterval(function () {
                    that.theMap.moveXY(-mapMoveSpeedX, 0);

                    that._moveVector({x: that.xy["x"]+mapMoveSpeedX,y:  that.xy["y"]});
                }, 10);
            }
        }
        else {
            // move up
            if (this.xy["y"] < this.theMap.size.height / 10) {
                window.clearInterval(this.mapmoveInterval);
                mapMoveSpeedY = (1 - (this.xy["y"] / (this.theMap.size.height / 10))) * mapMoveMaxSpeed;
                this.mapmoveInterval = window.setInterval(function () {
                    that.theMap.moveXY(0, mapMoveSpeedY);

                    that._moveVector({x: that.xy["x"],y:  that.xy["y"]-mapMoveSpeedY});
                }, 10);
            }
            // move down
            else if (this.xy["y"] > (this.theMap.size.height - this.theMap.size.height / 10)) {
                window.clearInterval(this.mapmoveInterval);
                mapMoveSpeedY = (1 - (this.theMap.size.height - this.xy["y"]) / (this.theMap.size.height / 10)) * mapMoveMaxSpeed;
                this.mapmoveInterval = window.setInterval(function () {
                    that.theMap.moveXY(0, -mapMoveSpeedY);

                    that._moveVector({x: that.xy["x"],y:  that.xy["y"]+mapMoveSpeedY});
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


    this._makeMovable = function () {
        if (this._vectorOptions.draggable == true) {
            jsMaps.Native.setCursor(this.theMap.clone, "pointer");

            jsMaps.Native.Event.attach(this.vectorPath, "mousedown", this._mousedown, this, false);
            jsMaps.Native.Event.attach(this.vectorPath, "touchstart", this._mousedown, this, false);
        } else {
            jsMaps.Native.setCursor(this.theMap.clone, "default");

            jsMaps.Native.Event.attach(this.vectorPath, "touchstart", function () {
                if (!this._vectorOptions.draggable) {
                    this.clicked = true;
                }
            }, this, false);

            jsMaps.Native.Event.attach(this.vectorPath, "touchmove", function () {
                if (!this._vectorOptions.draggable) {
                    // hand when clicked, otherwise finger
                    if (this.clicked == true)
                        jsMaps.Native.setCursor(this.theMap.clone,"grabbing");
                    else
                        jsMaps.Native.setCursor(this.theMap.clone,"pointer");
                }
            }, this, false);


            jsMaps.Native.Event.attach(this.vectorPath, "mousedown", function () {
                if (!this._vectorOptions.draggable) {
                    this.clicked = true;
                }
            }, this, false);

            jsMaps.Native.Event.attach(this.vectorPath, "mousemove", function () {
                if (!this._vectorOptions.draggable) {
                    // hand when clicked, otherwise finger
                    if (this.clicked == true)
                        jsMaps.Native.setCursor(this.theMap.clone,"grabbing");
                    else
                        jsMaps.Native.setCursor(this.theMap.clone,"pointer");
                }
            }, this, false);

            var w = (jsMaps.Native.Browser.ie) ? this.theMap.mapParent : window;

            jsMaps.Native.Event.attach(w, "touchend", function () {
                if (!this._vectorOptions.draggable) {
                    this.clicked = false;
                    // finger-cursor
                    jsMaps.Native.setCursor(this.vectorPath,"pointer");
                }
            }, this, false);

            jsMaps.Native.Event.attach(w, "mouseup", function () {
                if (!this._vectorOptions.draggable) {
                    this.clicked = false;
                    // finger-cursor
                    jsMaps.Native.setCursor(this.theMap.clone,"pointer");
                }
            }, this, false);
        }
    };

    this.hide=function(){
        if (jsMaps.Native.Browser.ielt9) {
            this.vectorPath.style.display = "none";
        }
    };

    this._circlePath = function (_radius,_point) {
        var r = _radius;
        var p = _point;
        var arc = 'a' + r + ',' + r + ' 0 1,0 ';

        // drawing a circle with two half-arcs
        return 'M' + (p.x - r) + ',' + p.y +
            arc + (r * 2) + ',0 ' +
            arc + (-r * 2) + ',0 ';
    };

    this._drawCircle = function () {
        var _radius = jsMaps.pixelValue(this._vectorOptions.center.lat,this._vectorOptions.radius,this.theMap.zoom());
        var _point = this.theMap.latlngToXY(this._vectorOptions.center);

        switch (this._backend) {
            case jsMaps.Native.Vector.svg:
                if (this.vectorPath.style.display== "none") this.vectorPath.style.display = "";
                this.svgPath  = this._circlePath(_radius,_point);
                break;
            case jsMaps.Native.Vector.vml:
                this.vectorPath.style.width = (_radius*2)+'px';
                this.vectorPath.style.height = (_radius*2)+'px';
                this.vectorPath.style.top = (_point.y-_radius)+'px';
                this.vectorPath.style.left = (_point.x-_radius)+'px';
                break;
            default:
                throw "Cannot create vector, unknown backend " + this._backend;
        }
    };

    this.render = function (overWrite) {
        if ((!this.theMap.finalDraw && overWrite != true && !this.moving) && this.theMap.movingVector == false) {
            if (typeof this.bounds == 'undefined') {
                this.vectorEl.style.display = "none";
                return;
            }

            if (!this.theMap.finalDraw) {
                this.vectorEl.style.display = "";
                this.vectorEl.bottomleft = this.theMap.latlngToXY(this.bounds.sw(),1);
                this.vectorEl.topright = this.theMap.latlngToXY(this.bounds.ne(),1);

                this.adjustOnMovement();
            }

            return;
        }

        if (this._vectorOptions.visible) {
            this.vectorPath.style.display = "";
        } else {
            this.vectorPath.style.display = "none";
        }

        this.oldZoom = this.theMap.zoom();
        this.bounds = this.theMap.mapBounds(false);
        this.vectorEl.style.display = "";

        this._clearVector();

        if (jsMaps.Native.overlaps(this.bounds, this.pointsBounds())) {
            this._attachMarkers();

            if (this._vectorType == jsMaps.Native.Vector.elements.circle) {
                this._drawCircle();
            } else {
                for (var i in this._vectorPoints) {
                    if (this._vectorPoints.hasOwnProperty(i) == false) continue;

                    var latLng = {lat: this._vectorPoints[i].lat, lng: this._vectorPoints[i].lng};
                    var point = this.theMap.latlngToXY(latLng);

                    this._addPath(point, i);
                }

                if (this._backend == jsMaps.Native.Vector.vml) {
                    var firstPoint = this.theMap.latlngToXY(this._vectorPoints[0]);
                    firstPoint["x"] = Math.round(firstPoint["x"]);
                    firstPoint["y"] = Math.round(firstPoint["y"]);

                    if (firstPoint["x"] != point["x"] && firstPoint["y"] != point["y"] && this._vectorType == jsMaps.Native.Vector.elements.polygon) {
                        this.vmlPath += " " + firstPoint["x"] + "," + firstPoint["y"] + " ";
                    }

                    this.vmlPath += " x e";
                }
            }
            this._finishDraw();
        } else {
            this._removeMarkers();
        }

        this.root.style.display = "";
    };
};

