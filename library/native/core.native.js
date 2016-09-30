/**
 * The native maps is a fork of https://github.com/robotnic/khtmlib
 *
 * khtmlib credits:
 *  verion 0.54
 *  LGPL Bernhard Zwischenbrugger
 *
 * @param mapDomDocument
 * @constructor
 */
if (typeof jsMaps.Native == 'undefined') {
    jsMaps.Native = function (mapDomDocument) {};
    jsMaps.Native.prototype = new jsMaps.Abstract();
}

jsMaps.Native.MapCount = 0;
jsMaps.Native.Overlay = {};

/**
 * @param {jsMaps.VectorStyle} options
 */
jsMaps.Native.VectorStyle =  function (options) {
    if (options.strokeColor != '') this.object._vectorOptions.stroke = options.strokeColor;
    if (options.strokeOpacity != '') this.object._vectorOptions.strokeOpacity = options.strokeOpacity;
    if (options.strokeWeight != '') this.object._vectorOptions.strokeWidth = options.strokeWeight;
    if (options.zIndex != '') this.object._vectorOptions.zIndex = options.zIndex;
    if (options.fillColor != '') this.object._vectorOptions.fill = options.fillColor;
    if (options.fillOpacity != '')  this.object._vectorOptions.fillOpacity=  options.fillOpacity;

    this.object._setStyle();
    this.object.render(true);
};


jsMaps.Native.VectorGetStyle =  function () {
    var return_values = new jsMaps.VectorStyle();

    if (typeof this.object._vectorOptions.fill != 'undefined' && typeof this.object._vectorOptions.fillOpacity != 'undefined') {
        return_values.fillColor     = this.object._vectorOptions.fill;
        return_values.fillOpacity   = this.object._vectorOptions.fillOpacity;
    }

    return_values.strokeColor   = this.object._vectorOptions.stroke;
    return_values.strokeOpacity = this.object._vectorOptions.strokeOpacity;
    return_values.strokeWeight  = this.object._vectorOptions.strokeWidth;
    return_values.zIndex        = this.object._vectorOptions.zIndex;

    return return_values;
};

/**
 * create the map
 *
 * @param map
 * @param options
 * @param {jsMaps.Native.Tiles} tileLayers
 * @returns {jsMaps.MapStructure}
 */
jsMaps.Native.prototype.initializeMap = function (map, options, tileLayers) {
    jsMaps.Native.Dom.addClass(map,'jsMaps-Native');

    jsMaps.Native.MapCount++;
    this.MapNumber = jsMaps.Native.MapCount;

    // **** Overlays handling ****
    this.addOverlay = function (obj) {
        this.overlays.push(obj);
        if (typeof(obj.init) == "function") {
            obj.init(this);
        }
        this.renderOverlay(obj);

        return obj;
    };

    this.renderOverlay = function (obj) {
        obj.render();
    };

    this.renderOverlays = function () {
        this.overlayDiv.style.display = "";

        var that = this;
        var i = 0;

        for (var obj in this.overlays) {
            if (this.overlays.hasOwnProperty(obj) == false) continue;
            if (i == 0) {
                try {
                    //this.overlays[obj].clear(that);
                } catch (e) {
                }
                i++;
            }

            this.overlays[obj].render();

        }
    };

    this.hideOverlays = function () {
        for (var obj in this.overlays) {
            if (this.overlays.hasOwnProperty(obj) == false) continue;
            try {
                if (typeof this.overlays[obj].hide !='undefined') {
                    this.overlays[obj].hide(that);
                }
            } catch (e) {
            }
        }
    };

    this.removeOverlays = function () {
        while (this.overlays.length > 0) {
            var overlay = this.overlays.pop();
            overlay.clear();
        }
    };

    this.stopRenderOverlays = function () {
        for (var obj in this.overlays) {
            if (this.overlays.hasOwnProperty(obj) == false) continue;

            if (typeof(this.overlays[obj].cancel) == "function") {
                this.overlays[obj].cancel();
            }
        }
    };

    this.removeOverlay = function (ov) {
        for (var i = 0; i < this.overlays.length; i++) {
            var overlay = this.overlays[i];
            if (ov == overlay) {
                if (typeof ov.clear != 'undefined') {
                    ov.clear();
                }

                this.overlays.splice(i, 1);
                break;
            }
        }
    };

    // every change (lat,lng,zoom) will call a user defined function
    this.callbackFunctions = [];
    this.addCallbackFunction = function (func) {
        if (typeof(func) == "function") {
            this.callbackFunctions.push(func);
        }
    };
    this.executeCallbackFunctions = function () {
        for (var i = 0; i < this.callbackFunctions.length; i++) {
            this.callbackFunctions[i].call();
        }
    };


    /*==================================================
     //
     //    Touchscreen and Mouse EVENTS
     //
     ===================================================*/

    //
    //  Touchscreen
    //  Here also the multitouch zoom is done
    this.moving=false;

    this.start = function(evt) {
        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            evt.returnValue = false; // The IE way
        }

        jsMaps.Native.Dom.addClass(document.body,'jsMaps-Native-no-scroll');

        this.moving = this.center();
        this.moveAnimationBlocked = true;

        clearTimeout(this.animateMoveTimeout);

        if (evt.touches.length == 1) {
            if (this.mousedownTime != null) {
                var now = (new Date()).getTime();
                if (now - this.mousedownTime < this.doubleclickTime) {
                    this.discretZoom(1,this.pageX(evt.touches[0]), this.pageY(evt.touches[0]));
                }
            }

            if (!this.discretZoomBlocked) {
                this.mousedownTime2 = (new Date()).getTime();

                this.startMoveX = this.moveX - (this.pageX(evt.touches[0])) / this.factor / this.sc;
                this.startMoveY = this.moveY - (this.pageY(evt.touches[0])) / this.factor / this.sc;
                this.movestarted = true;

                jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.dragstart);

                this.mousedownTime = (new Date()).getTime();
            }
        }

        if (evt.touches.length == 2 && !this.discretZoomBlocked) {
            this.mousedownTime = null;
            this.movestarted = false;
            var X1 = this.pageX(evt.touches[0]);
            var Y1 = this.pageY(evt.touches[0]);
            var X2 = this.pageX(evt.touches[1]);
            var Y2 = this.pageY(evt.touches[1]);

            this.startDistance = Math.sqrt(Math.pow((X2 - X1), 2) + Math.pow((Y2 - Y1), 2));
            this.startZZ = this.position.zoom;

            var x = (X1 + X2) / 2 / this.factor / this.sc;
            var y = (Y1 + Y2) / 2 / this.factor / this.sc;

            this.startMoveX = this.moveX - x;
            this.startMoveY = this.moveY - y;

            this.prevxy = {x:0,y:0};
        }
    };

    this.moveok = true;
    this.prevxy = {x:0,y:0};

    this.move = function(evt) {
        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            evt.returnValue = false; // The IE way
        }

        var center;

        if (evt.touches.length == 1 && this.movestarted) {
            this.lastMouseX = this.pageX(evt.touches[0]);
            this.lastMouseY = this.pageY(evt.touches[0]);

            jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.drag);

            this.lastMoveX = this.moveX;
            this.lastMoveY = this.moveY;
            this.lastMoveTime = new Date();
            this.moveX = (this.pageX(evt.touches[0])) / this.factor / this.sc + this.startMoveX;
            this.moveY = (this.pageY(evt.touches[0])) / this.factor / this.sc + this.startMoveY;

            center = new jsMaps.geo.Location(this.lat, this.lng);

            this.setCenter2(center, this.position.zoom);
            this.moveAnimationBlocked = false;

            jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.bounds_changed);
            jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.center_changed);
        }

        if (evt.touches.length == 2 && !this.discretZoomBlocked) {
            this.movestarted = false;
            this.mousedownTime = null;

            var X1 = this.pageX(evt.touches[0]);
            var Y1 = this.pageY(evt.touches[0]);
            var X2 = this.pageX(evt.touches[1]);
            var Y2 = this.pageY(evt.touches[1]);
            var Distance = Math.sqrt(Math.pow((X2 - X1), 2)  + Math.pow((Y2 - Y1), 2));

            var zoomDelta = (Distance / this.startDistance);
            var zz = this.startZZ + zoomDelta - 1;

            if (zz > this.tileSource.maxzoom) {
                zz = this.tileSource.maxzoom;
                zoomDelta = this.zoomDeltaOld;
            }
            else
                this.zoomDeltaOld = zoomDelta;

            var x = (X1 + X2) / 2;
            var y = (Y1 + Y2) / 2;

            var diff  = (Distance - this.startDistance) / this.startDistance  * 100;

            if (Math.round(x) != Math.round(this.prevxy.x) && Math.round(y) != Math.round(this.prevxy.y) && Math.round(this.startDistance) != Math.round(Distance) && Math.abs(diff) > 15) {
                this.discretZoom(((zoomDelta < 1)? -1: 1),x, y);
            }

            this.prevxy = {x:x,y:y};
        }
    };

    this.end = function(evt) {
        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            evt.returnValue = false;
        }
        this.prevxy = {x:0,y:0};

        jsMaps.Native.Dom.removeClass(document.body,'jsMaps-Native-no-scroll');

        var steps = 20;
        for (var i = 1; i <= steps; i++) {
            if (typeof this.zoomTimeouts[i] != 'undefined') {
                clearTimeout(this.zoomTimeouts[i]);
            }
        }

        if (this.movestarted) {
            this.lastMouseX = this.pageX(evt.touches[0]);
            this.lastMouseY = this.pageY(evt.touches[0]);

            if (this.moveMarker) {
                this.moveMarker = null;
            }

            // using this normalize some things are working better, others not so good.
            // delete it will solve some problems but bring other problems
            var now = new Date(evt.timeStamp);
            var timeDelta = now - this.lastMoveTime;
            if (this.wheelSpeedConfig["moveAnimateDesktop"] && timeDelta != 0) {
                if (this.movestarted) {
                    if (this.moveAnimationBlocked == false) {
                        var speedX = (this.lastMoveX - this.moveX) / timeDelta;
                        var speedY = (this.lastMoveY - this.moveY) / timeDelta;
                        var maxSpeed = 200;

                        if (speedX > maxSpeed)speedX = maxSpeed;
                        if (speedY > maxSpeed)speedY = maxSpeed;
                        if (speedX < -maxSpeed)speedX = -maxSpeed;
                        if (speedY < -maxSpeed)speedY = -maxSpeed;

                        this.animateMove(speedX, speedY);
                    }
                }
            }
            var that = this;
            var tempFunction = function () {
                if (that.movestarted) {
                    jsMaps.Native.Event.trigger(that.mapParent, jsMaps.api.supported_events.dragend);
                    jsMaps.Native.Event.trigger(that.mapParent, jsMaps.api.supported_events.idle);
                }

                that.movestarted = false;
            };

            setTimeout(tempFunction, 1);
        }

        if (evt.touches.length == 1) {
            this.startMoveX = this.moveX - evt.touches[0].pageX / this.factor / this.sc;
            this.startMoveY = this.moveY - evt.touches[0].pageY / this.factor / this.sc;

            //this.startDistance = 0;
            //this.startZZ = this.position.zoom;
        }
    };

    /**
     * mouse events
     * (distance measure code not in use anymore)
     *
     * @param evt
     * @returns {*}
     */
    this.pageX = function (evt) {
        try {
            var px = (evt.pageX === undefined) ? evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft: evt.pageX;
            return px - this.mapLeft;
        } catch (e) {
            return this.lastMouseX;
        }
    };

    /**
     * mouse events
     * (distance measure code not in use anymore)
     *
     * @param evt
     * @returns {*}
     */
    this.pageY = function (evt) {
        try {
            var py = (evt.pageY === undefined) ? evt.clientY + document.body.scrollTop + document.documentElement.scrollTop: evt.pageY;
            return py - this.mapTop;
        } catch (e) {
            return this.lastMouseY;
        }
    };

    this.doubleclickBlocked = false;

    this.doubleclick = function (evt) {
        this.discretZoom(1, this.pageX(evt), this.pageY(evt));
    };

    this.leftClick = null;

    this.mousedown = function (evt) {
        this.mapParent.focus();
        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            window.returnValue = false; // The IE way
        }

        if (jsMaps.Native.Browser.ie) this.leftClick = true;

        this.lastMouseX = this.pageX(evt);
        this.lastMouseY = this.pageY(evt);
        this.moveAnimationBlocked = true;
        if (this.mousedownTime2 != null) {
            var now = (new Date()).getTime();
            if (now - this.mousedownTime2 < this.doubleclickTime2) {
                this.doubleclick(evt);
                return;
            }
        }
        this.mousedownTime2 = (new Date()).getTime();
        clearTimeout(this.animateMoveTimeout);

        if (evt.shiftKey) {
            this.selectRectLeft = this.pageX(evt);
            this.selectRectTop = this.pageY(evt);

            this.selectRect = document.createElement("div");
            this.selectRect.style.left = this.selectRectLeft + "px";
            this.selectRect.style.top = this.selectRectTop + "px";
            this.selectRect.style.border = "1px solid gray";
            if (!this.internetExplorer) {
                this.selectRect.style.opacity = 0.5;
                this.selectRect.style.backgroundColor = "white";
            }
            this.selectRect.style.position = "absolute";
            this.map.parentNode.appendChild(this.selectRect);
        } else {
            //this.hideOverlays();
            this.startMoveX = this.moveX - (this.pageX(evt)) / this.factor / this.sc;
            this.startMoveY = this.moveY - (this.pageY(evt)) / this.factor / this.sc;
            this.movestarted = true;

            jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.dragstart);

            jsMaps.Native.setCursor(this.clone,"grabbing");
        }
        return false;
    };

    this.mousemove = function (evt) {
        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            window.returnValue = false; // The IE way
        }


        var leftClick = jsMaps.Native.Event.leftClick(evt);

        if (leftClick == false || (this.leftClick !== null && this.leftClick == false)) {
            this.movestarted = false;
            jsMaps.Native.setCursor(this.clone,"grab");
            return;
        }

        if (this.draggable == false) return;

        this.lastMouseX = this.pageX(evt);
        this.lastMouseY = this.pageY(evt);

        if (evt.shiftKey) {
            if (this.selectRect) {
                this.selectRect.style.width = Math.abs(this.pageX(evt) - this.selectRectLeft) + "px";
                this.selectRect.style.height = Math.abs(this.pageY(evt) - this.selectRectTop) + "px";
                if (this.pageX(evt) < this.selectRectLeft) {
                    this.selectRect.style.left = this.pageX(evt);
                }
                if (this.pageY(evt) < this.selectRectTop) {
                    this.selectRect.style.top = this.pageY(evt);
                }

                jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.bounds_changed);
                jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.center_changed);
            }
        } else {
            if (this.movestarted) {
                jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.drag);

                this.lastMoveX = this.moveX;
                this.lastMoveY = this.moveY;
                this.lastMoveTime = new Date();
                this.moveX = (this.pageX(evt)) / this.factor / this.sc + this.startMoveX;
                this.moveY = (this.pageY(evt)) / this.factor / this.sc + this.startMoveY;

                var center = new jsMaps.geo.Location(this.lat, this.lng);

                this.setCenter2(center, this.position.zoom);
                this.moveAnimationBlocked = false;

                jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.bounds_changed);
                jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.center_changed);
            }
        }

        return false;
    };

    this.mouseup = function (evt) {
        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            evt.returnValue = false; // The IE way
        }

        jsMaps.Native.setCursor(this.clone,"grab");

        this.lastMouseX = this.pageX(evt);
        this.lastMouseY = this.pageY(evt);
        if (this.moveMarker) {
            this.moveMarker = null;
        }
        if (this.selectRect) {
            var p1 = this.XYTolatlng(this.selectRect.offsetLeft, this.selectRect.offsetTop + this.selectRect.offsetHeight);
            var p2 = this.XYTolatlng(this.selectRect.offsetLeft + this.selectRect.offsetWidth, this.selectRect.offsetTop);

            var inner_bounds = new jsMaps.Native.InnerBounds(p1, p2);
            this.setBounds(inner_bounds);
            this.selectRect.parentNode.removeChild(this.selectRect);
            this.selectRect = null;
        }

        clearTimeout(this.animateMoveTimeout);

        // using this normalize some things are working better, others not so good.
        // delete it will solve some problems but bring other problems
        var now = new Date(evt.timeStamp);
        var timeDelta = now - this.lastMoveTime;
        if (this.wheelSpeedConfig["moveAnimateDesktop"] && timeDelta != 0) {
            if (this.movestarted) {
                if (this.moveAnimationBlocked == false) {
                    var speedX = (this.lastMoveX - this.moveX) / timeDelta;
                    var speedY = (this.lastMoveY - this.moveY) / timeDelta;
                    var maxSpeed = 200;

                    if (speedX > maxSpeed)speedX = maxSpeed;
                    if (speedY > maxSpeed)speedY = maxSpeed;
                    if (speedX < -maxSpeed)speedX = -maxSpeed;
                    if (speedY < -maxSpeed)speedY = -maxSpeed;

                    this.animateMove(speedX, speedY);
                }
            }
        }
        var that = this;
        var tempFunction = function () {
            if (that.movestarted) {
                jsMaps.Native.Event.trigger(that.mapParent,jsMaps.api.supported_events.dragend);
                jsMaps.Native.Event.trigger(that.mapParent,jsMaps.api.supported_events.idle);
            }

            that.movestarted = false;
        };

        setTimeout(tempFunction, 1);
    };

    this.startZoomTime = null;

    this.wheeling = false;
    this.zoomActive = true;

    /**
     * Mouse wheel
     *
     * @param evt
     */
    this.mousewheel = function (evt) {

        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            evt.returnValue = false; // The IE way
        }

        if (this.mousewheelEnabled == false) return;

        this.mapParent.focus();
        this.zoomActive  = true;

        if (!evt) evt = window.event;

        if (evt.wheelDelta) { /* IE/Opera/Chrom. */
            delta = evt.wheelDelta / 120;
        } else if (evt.detail) {
            /** Mozilla case. */
            delta = -evt.detail / 3;
            if (this.lastWheelDelta * delta < 0) {
                if (!this.wheelSpeedConfig["digizoom"]) {
                    delta = 0;
                }
            }
            this.lastWheelDelta = -evt.detail / 3;
        }


        var direction = (delta < 0) ? -1: 1;
        var that = this;
        this.wheeling = true;

        if (this.wheelSpeedConfig["digizoom"]) {
            this.discretZoom(direction, this.pageX(evt), this.pageY(evt));
            return;
        }

        if (!this.startZoomTime) {
            this.startZoomTime = (new Date());
            this.startZoomTime2 = (new Date());
            this.oldZoom = this.zoom();
            this.speed = 1;
        }
        var delta = (new Date()) - this.startZoomTime;
        var delta2 = (new Date()) - this.startZoomTime2;

        var tempFunc = function () {
            that.startZoomTime = new Date();
        };
        this.startZoomTime = new Date();
        if (delta > 300) {
            this.startZoomTime2 = new Date();
            this.oldZoom = this.zoom();
            this.speed = 1;
            delta2 = 0.1;
        }
        this.speed = this.speed * 2;
        if (this.speed > 5) this.speed = 5;

        var zoom = this.oldZoom + delta2 / 3000 * this.speed * direction;
        if (zoom > this.position.maxZoom) zoom = this.position.maxZoom;
        if (zoom < this.position.minZoom) zoom = this.position.minZoom;

        this.scaleDivExec();
        this.centerAndZoomXY(this.center(), zoom, this.pageX(evt), this.pageY(evt));
    };

    this.zoomTimeouts = [];
    this.discretZoomBlocked = false;

    this.discretZoom = function (direction, x, y) {
        var that = this;
        if (this.discretZoomBlocked) return;

        var func = function () {
            that.discretZoomBlocked = false;
        };

        this.zoomActive  = true;

        setTimeout(func, 400);
        this.discretZoomBlocked = true;

        var steps = 20;
        for (var i = 1; i <= 20; i++) {
            if (this.zoomTimeouts[i]) {
                clearTimeout(this.zoomTimeouts[i]);
            }
        }
        var start = this.zoom();
        var end = (direction == 1) ? Math.ceil(this.zoom() + 0.9): Math.floor(this.zoom() - 0.9);

        if (direction == -1) {
            for (q in this.layers) {
                if (this.layers.hasOwnProperty(q) == false) continue;

                if (q > start &&typeof this.layers[q]!='undefined') {
                    this.map.removeChild(this.layers[q]['layerDiv']);
                    this.layers[q] = false;
                    delete this.layers[q];
                }
            }
        }

        var delta = Math.abs(start - end);
        this.scaleDivExec();

        var lastDZ = 0;
        for (var ii = 1; ii <= steps; ii++) {
            var rad = ii / steps * Math.PI / 2;
            var dz = direction * (Math.sin(rad)) * delta;
            var ddz = dz - lastDZ;
            this.zoomTimeouts[i] = this.discretZoomExec(x, y, ddz, ii, steps);
            lastDZ = dz;
        }

        if (end >= this.tileSource.minzoom && end <= this.tileSource.maxzoom) {
            jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.zoom_changed);
            jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.bounds_changed);
            jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.center_changed);
        }
    };

    this.discretZoomExec = function (x, y, dz, i, steps) {
        var that = this;
        var tempFunc = function () {
            var zoom = that.zoom() + dz;
            if (i == steps) zoom = Math.round(zoom);

            that.centerAndZoomXY(that.center(), zoom, x, y);
        };
        return setTimeout(tempFunc, i*15);
    };

    /**
     * Map continues moving after mouse up
     *
     * @param speedX
     * @param speedY
     * @param faktor
     */
    this.animateMove = function (speedX, speedY, faktor) {
        if (jsMaps.Native.Browser.ie && jsMaps.Native.Utils.TRANSFORM == false) return;

        if (typeof faktor == 'undefined') faktor=Math.pow(2,this.zoom());
        clearTimeout(this.animateMoveTimeout);

        if (Math.abs(speedX) < this.wheelSpeedConfig["animateMinSpeed"]/faktor && Math.abs(speedY) < this.wheelSpeedConfig["animateMinSpeed"]/faktor){
            this.moving=false;
            this.setCenter2(this.position.center, this.position.zoom);
            return;
        }

        var framesPerSecond=50;

        this.moveX += -speedX;
        this.moveY += -speedY;

        that = this;

        var speed=Math.sqrt(Math.pow(speedX,2) + Math.pow(speedY,2));
        var fx=speedX/speed;
        var fy=speedY/speed;

        var tempFunction = function() {
            var newSpeedX=speedX - fx*that.wheelSpeedConfig["moveAnimationSlowdown"]/faktor;
            var newSpeedY=speedY - fy*that.wheelSpeedConfig["moveAnimationSlowdown"]/faktor;

            that.animateMove(newSpeedX,newSpeedY,faktor);
        };

        this.animateMoveTimeout = window.setTimeout(tempFunction, 1/framesPerSecond * 1000);
        this.setCenter2(this.position.center, this.position.zoom);
    };

    //*** zoom  animation ***
    this.autoZoomInTimeout = null;
    this.autoZoomStartTime = null;
    this.autoZoomIn = function (x, y, z) {
        if (this.autoZoomInTimeout) window.clearTimeout(this.autoZoomInTimeout);

        var stepwidth = 0.20;

        if (z < 0) {
            stepwidth = -stepwidth
        }

        var zoomGap = Math.abs(z) <= Math.abs(stepwidth);

        //this.hideOverlays();
        var dzoom = stepwidth;
        var zoom = this.position.zoom + dzoom;
        zoom = Math.round(zoom * 1000) / 1000;
        if (zoomGap) {
            if (z < 0) {
                zoom = Math.floor(zoom);
            } else {
                zoom = Math.ceil(zoom - 0.2);
            }

            dzoom = zoom - this.position.zoom;
        }

        factor = Math.pow(2, zoom);
        var zoomCenterDeltaX = (x - this.mapLeft) - this.width / 2;
        var zoomCenterDeltaY = (y - this.mapTop) - this.height / 2;
        var f = Math.pow(2, dzoom);

        var dx = zoomCenterDeltaX - zoomCenterDeltaX * f;
        var dy = zoomCenterDeltaY - zoomCenterDeltaY * f;

        var that = this;

        var now = new Date().getMilliseconds();
        var timeDelta = (this.autoZoomStartTime) ? now - this.autoZoomStartTime: 0;

        this.autoZoomStartTime = now;
        var tempFunction;

        if (timeDelta < 100 || zoomGap) {
            if (zoom >= this.tileSource.minzoom && zoom <= this.tileSource.maxzoom) {
                this.moveX = this.moveX + dx / factor;
                this.moveY = this.moveY + dy / factor;
            }

            var center = new jsMaps.geo.Location(this.lat, this.lng);
            if (zoom > this.tileSource.maxzoom) zoom = this.tileSource.maxzoom;
            if (zoom < this.tileSource.minzoom) zoom = this.tileSource.minzoom;

            tempFunction = function () { that.setCenter2(center, zoom); };
            setTimeout(tempFunction, 1);
        }

        var newz = z - dzoom;

        if (!zoomGap) {
            tempFunction = function () { that.autoZoomIn(x, y, newz); };
            this.autoZoomInTimeout = window.setTimeout(tempFunction, 40);
        }

    };

    /**
     * same as centerAndZoom but zoom center is not map center
     *
     * @param center
     * @param zoom
     * @param x
     * @param y
     */
    this.centerAndZoomXY = function (center, zoom, x, y) {
        var factor = Math.pow(2, zoom);
        var zoomCenterDeltaX = x - this.mapsize.width / 2;
        var zoomCenterDeltaY = y - this.mapsize.height / 2;
        var dzoom = zoom - this.zoom();
        var f = Math.pow(2, dzoom);

        var dx = zoomCenterDeltaX - zoomCenterDeltaX * f;
        var dy = zoomCenterDeltaY - zoomCenterDeltaY * f;

        if (zoom >= this.tileSource.minzoom && zoom <= this.tileSource.maxzoom) {
            this.moveX = this.moveX + dx / factor;
            this.moveY = this.moveY + dy / factor;
        }

        var  center = new jsMaps.geo.Location(this.lat, this.lng);
        if (zoom > this.tileSource.maxzoom) zoom = this.tileSource.maxzoom;
        if (zoom < this.tileSource.minzoom) zoom = this.tileSource.minzoom;

        this.setCenter2(center, zoom);
    };

    /**
     * Set the map coordinates and zoom
     *
     * @param center
     * @param zoom
     */
    this.centerAndZoom = function (center, zoom) {
        this.moveX = 0;
        this.moveY = 0;

        if (zoom > this.tileSource.maxzoom) zoom = this.tileSource.maxzoom;
        if (zoom < this.tileSource.minzoom) zoom = this.tileSource.minzoom;

        this.record();
        this.setCenterNoLog(center, zoom);

        this.scaleDivExec();
    };

    /**
     * @param center
     * @param zoom
     */
    this.setCenter3 = function (center, zoom) {
        this.moveX = 0;
        this.moveY = 0;
        this.setCenterNoLog(center, zoom);
    };

    /**
     * same as setCenter but moveX,moveY are not reset (for internal use)
     *
     * @param center
     * @param zoom
     */
    this.setCenter2 = function (center, zoom) {
        this.record();
        this.setCenterNoLog(center, zoom);
    };

    /**
     * same as setCenter but no history item is generated (for undo, redo)
     *
     * @param center
     * @param zoom
     */
    this.setCenterNoLog = function (center, zoom) {
        this.position.center = center;
        this.lat = center.lat;
        this.lng = center.lng;

        zoom = parseFloat(zoom);
        if (zoom > this.tileSource.maxzoom) zoom = this.tileSource.maxzoom;
        if (zoom < this.tileSource.minzoom) zoom = this.tileSource.minzoom;

        this.position.zoom = zoom;

        this.layer(this.map, this.lat, this.lng, this.moveX, this.moveY, zoom);
        this.executeCallbackFunctions();
    };

    /**
     * read the map center (no zoom value)
     *
     * @param center
     * @returns {*}
     */
    this.center = function (center) {
        if (center) {
            //this.position.center=center;
            this.centerAndZoom(center, this.getZoom());
        }
        if (this.moveX != 0 || this.moveY != 0) {
            return new jsMaps.geo.Location(this.movedLat, this.movedLng);
        }

        return this.position.center;
    };

    this.zoom = function (zoom) {
        if (zoom) {
            this.centerAndZoom(this.position.center, zoom);
        }
        return this.position.zoom;
    };

    this.moveXY = function (x, y) {
        this.moveX = parseFloat(x) / this.factor / this.sc + this.moveDelayedX;
        this.moveY = parseFloat(y) / this.factor / this.sc + this.moveDelayedY;

        this.setCenter2(this.center(), this.zoom());
    };

    this.tiles = function (tileSource) {
        this.clearMap();
        this.tileSource = tileSource;
    };

    this.tileOverlays = [];

    this.addTilesOverlay = function (t) {
        this.tileOverlays.push(t);
        var ov = this.tileOverlays[this.tileOverlays.length - 1];
        this.clearMap();
        return ov;
    };

    this.removeTilesOverlay = function (ov) {
        //alert(this.tileOverlays.length);
        for (var i = 0; i < this.tileOverlays.length; i++) {
            var overlay = this.tileOverlays[i];
            if (ov == overlay) {
                //ov.clear();
                this.tileOverlays.splice(i, 1);
                break;
            }
        }
        this.clearMap();
    };


    this.getCenter = function () {
        var center;

        if (this.moveX != 0 || this.moveY != 0) {
            center = new jsMaps.geo.Location(this.movedLat, this.movedLng);
        } else {
            if (!this.position.center) {
            } else {
                center = this.position.center;
            }
        }
        return center;
    };


    /**
     * read bounds. The Coordinates at corners of the map div  sw, ne would be better (change it!)
     *
     * @param b
     * @returns {*}
     */
    this.mapBounds = function (b) {
        if (b) {
            this.setBounds(b);
        } else {
            return this.getBounds();
        }
    };

    this.getBounds = function () {
        var sw = this.XYTolatlng(0, this.height);
        var ne = this.XYTolatlng(this.width, 0);

        return new jsMaps.Native.InnerBounds(sw, ne);
    };

    /**
     * like setCenter but with two gps points
     *
     * @param b
     */
    this.setBounds = function (b) {
        //this.normalize();
        //the setbounds should be a mathematical formula and not guessing around.
        //if you know this formula pease add it here.
        //this.getSize();
        var p1 = b.sw();
        var p2 = b.ne();

        var minlat = p1.lat;
        var maxlat = p2.lat;
        var minlng = p1.lng;
        var maxlng = p2.lng;

        var minlat360 = lat2y(minlat);
        var maxlat360 = lat2y(maxlat);
        var centerLng = (minlng + maxlng) / 2;
        var centerLat360 = (minlat360 + maxlat360) / 2;
        var centerLat = y2lat(centerLat360);
        var center = new jsMaps.geo.Location(centerLat, centerLng);
        var extendY = Math.abs(maxlat360 - minlat360);
        var extendX = Math.abs(maxlng - minlng);
        var extend, screensize;

        if (extendX / this.width > extendY / this.height) {
            extend = extendX;
            screensize = this.width;
        } else {
            extend = extendY;
            screensize = this.height;
        }

        var scalarZoom = 360 / extend;
        var screenfactor = 512 / screensize;

        var zoom = (Math.log(scalarZoom / screenfactor)) / (Math.log(2)) + 1;

        if (zoom > this.tileSource.maxzoom) zoom = this.tileSource.maxzoom;
        if (zoom < this.tileSource.minzoom) zoom = this.tileSource.minzoom;

        if (this.position.center) {
            if (this.wheelSpeedConfig["rectShiftAnimate"]) {
                this.animatedGoto(center, zoom, this.wheelSpeedConfig["rectShiftAnimationTime"]);
            } else {
                this.centerAndZoom(center, zoom);
            }
        } else {
            this.centerAndZoom(center, zoom);
        }
    };

    this.animatedGotoStep = null;
    this.animatedGotoTimeout = [];

    this.animatedGoto = function (newCenter, newZoom, time) {
        //this.hideOverlays();
        var zoomSteps = time / 10;
        var oldCenter = this.getCenter();
        var newLat = newCenter.lat;
        var newLng = newCenter.lng;
        var oldLat = oldCenter.lat;
        var oldLng = oldCenter.lng;
        var oldZoom = this.getZoom();
        var dLat = (newLat - oldLat) / zoomSteps;
        var dLng = (newLng - oldLng) / zoomSteps;
        var dZoom = (newZoom - oldZoom) / zoomSteps;
        var dMoveX = this.moveX / zoomSteps;
        var dMoveY = this.moveY / zoomSteps;
        var oldMoveX = this.moveX;
        var oldMoveY = this.moveY;
        this.animatedGotoStep = 0;
        var that = this;

        while (timeout = this.animatedGotoTimeout.pop()) {
            clearTimeout(timeout);
        }

        for (var i = 0; i < zoomSteps; i++) {
            var tempFunction = function () {
                that.animatedGotoExec(oldLat, oldLng, oldZoom, dLat, dLng, dZoom, oldMoveX, oldMoveY, dMoveX, dMoveY)
            };
            this.animatedGotoTimeout[i] = window.setTimeout(tempFunction, 10 * i);
        }
    };

    this.animatedGotoExec = function (oldLat, oldLng, oldZoom, dLat, dLng, dZoom, oldMoveX, oldMoveY, dMoveX, dMoveY) {
        this.moveX = -dMoveX;
        this.moveY = -dMoveY;
        var lat = oldLat + dLat * this.animatedGotoStep;
        var lng = oldLng + dLng * this.animatedGotoStep;
        var zoom = oldZoom + dZoom * this.animatedGotoStep;
        this.animatedGotoStep++;

        this.centerAndZoom(new jsMaps.geo.Location(lat, lng), zoom);
    };

    this.getZoom = function () {
        return this.position.zoom;
    };

    this.getIntZoom = function () {
        return this.intZoom;
    };

    /**
     * WGS84 to x,y at the div calculation
     *
     * @param point
     * @returns {Array}
     */
    this.latlngToXY = function (point) {
        var lat = point.lat;
        var lng = point.lng;

        if(lat >90) lat =lat -180;
        if(lat <-90) lat =lat +180;

        var worldCenter = this.getCenter();

        var intZoom = this.getIntZoom();
        var tileCenter = getTileNumber(worldCenter.lat, worldCenter.lng, intZoom);

        var tileTest = getTileNumber(lat, lng, intZoom);


        var x = (tileCenter[0] - tileTest[0]) * this.tileW * this.sc - this.width / 2;
        var y = (tileCenter[1] - tileTest[1]) * this.tileW * this.sc - this.height / 2;

        point = [];
        point["x"] = -x;
        point["y"] = -y;

        return (point);
    };


    /**
     * screen (map div) coordinates to lat,lng
     *
     * @param x
     * @param y
     * @returns {jsMaps.geo.Location}
     * @constructor
     */
    this.XYTolatlng = function (x, y) {
        var center = this.getCenter();
        if (!center) return;

        var factor = Math.pow(2, this.intZoom);
        var centerLat = center.lat;
        var centerLng = center.lng;

        var xypoint = getTileNumber(centerLat, centerLng, this.intZoom);
        var dx = x - this.width / 2;
        var dy = y - this.height / 2; //das style
        var lng = (xypoint[0] + dx / this.tileW / this.sc) / factor * 360 - 180;
        var lat360 = (xypoint[1] + dy / this.tileH / this.sc) / factor * 360 - 180;

        var lat = -y2lat(lat360);

        if(lat >90) lat =lat -180;
        if(lat <-90) lat =lat +180;

        return new jsMaps.geo.Location(lat, lng);
    };

    this.mouseToLatLng = function (evt) {
        var x = this.pageX(evt);
        var y = this.pageY(evt);

        return this.XYTolatlng(x, y);
    };

    /**
     * for iPhone to make page fullscreen (maybe not working)
     */
    this.reSize = function () {
        var that = this;
        //setTimeout("window.scrollTo(0,1)",500);
        var tempFunction = function () {
            that.getSize(that)
        };
        window.setTimeout(tempFunction, 1050);
    };

    /**
     * read the size of the DIV that will contain the map
     */
    this.getSize = function () {
        this.width = this.map.parentNode.offsetWidth;
        this.height = this.map.parentNode.offsetHeight;
        var obj = this.map;
        var left = 0;
        var top = 0;
        do {
            left += obj.offsetLeft;
            top += obj.offsetTop;
            obj = obj.offsetParent;
        } while (obj.offsetParent);

        this.mapTop = top;
        this.mapLeft = left;
    };

    //for undo,redo
    this.recordArray = [];
    this.record = function () {
        var center = this.getCenter();
        if (center) {
            var lat = center.lat;
            var lng = center.lng;
            var zoom = this.getZoom();
            var item = [lat, lng, zoom];
            this.recordArray.push(item);
        }
    };

    this.play = function (i) {
        if (i < 1) return;
        if (i > (this.recordArray.length - 1)) return;
        var item = this.recordArray[i];
        var center = new jsMaps.geo.Location(item[0], item[1]);
        //undo,redo must not generate history items
        this.moveX = 0;
        this.moveY = 0;
        this.setCenter3(center, item[2]);
    };

    this.myTimer = function(interval) {
        /**
         * reset/stop countdown.
         */
        this.reset = function() {
            this._isRunning = false;
        };

        /**
         * Is countdown running?
         */
        this.isTimeRunning = function() {
            if(false == this._isRunning) return false;

            var now = new Date();

            if(this.time + this.myInterval > now.getTime()) return false;
            this._isRunning = false;

            return true;
        };

        /**
         * Start countdown.
         */
        this.start = function() {
            this._isRunning = true;
            var d = new Date();
            this.time = d.getTime();
        };

        /**
         * Setter/getter
         */
        this.interval = function(arg1) {
            if(typeof(arg1) != "undefined") {
                this.myInterval = parseInt(arg1);
            }
            return this.myInterval;
        };

        // Constructor
        this.reset();
        this.interval(interval);

        return this;
    };

    /*================== LAYERMANAGER (which layer is visible) =====================
     Description: This method desides witch zoom layer is visible at the moment.
     It has the same parameters as the "draw" method, but no "intZoom".

     This Layers are  NOT tile or vector overlays
     ========================================================================= */
    this.layerDrawLastFrame = null;
    this.doTheOverlays = true;
    this.finalDraw = false;
    this.layerOldZoom = 0;
    this.moveDelayedX = 0;
    this.moveDelayedY = 0;
    this.layerTimer = new this.myTimer(400);

    this.layer = function (map, lat, lng, moveX, moveY, zoom) {
        var delta = (new Date()) - this.startZoomTime;
        this.stopRenderOverlays();

        if (!zoom) zoom = this.getZoom();
        var intZoom = (this.wheelSpeedConfig["digizoom"]) ? Math.floor(zoom): Math.round(zoom);

        if (this.layerDrawLastFrame) {
            window.clearTimeout(this.layerDrawLastFrame);
            this.layerDrawLastFrame = null;
        }
        var that = this;
        var tempFunction;

        if (this.layerTimer.isTimeRunning() || this.finalDraw == false ) {
            //the last frames must be drawn to have good result

            tempFunction = function () {
                if(intZoom == that.visibleZoom){
                    that.finalDraw = true;
                }

                that.layer(map, lat, lng, moveX, moveY, zoom);
            };

            this.visibleZoom=parseInt(this.visibleZoom);
            if(!that.finalDraw){
                this.layerDrawLastFrame = window.setTimeout(tempFunction, 250);
            }
            if (this.layerTimer.isTimeRunning()) {
                this.moveDelayedX = moveX; //used in method moveXY
                this.moveDelayedY = moveY;
                return;
            }
        }

        this.layerTimer.start();

        this.moveDelayedX = 0;
        this.moveDelayedY = 0;

        for (var i = 0; i < 22; i++) {
            if (this.layers[i]) this.layers[i]["layerDiv"].style.visibility = "hidden";
        }

        if (this.layerOldZoom > zoom && !this.finalDraw) {
            if (this.layers[intZoom] && !this.layers[intZoom]["loadComplete"]) {
                this.visibleZoom = intZoom + 1;
            }
        }

        this.intZoom = intZoom;

        if (intZoom > this.tileSource.maxzoom) intZoom = this.tileSource.maxzoom;

        if (!this.visibleZoom) {
            this.visibleZoom = intZoom;
            this.oldIntZoom = intZoom;
        }

        this.factor = Math.pow(2, intZoom);
        var zoomDelta = zoom - intZoom;
        this.sc = Math.pow(2, zoomDelta);

        // Calculate the next displayed layer
        this.loadingZoomLevel = intZoom;
        if (this.visibleZoom < intZoom) {
            if (Math.abs(this.visibleZoom - intZoom) < 4) {
                this.loadingZoomLevel = parseInt(this.visibleZoom) + 1;
            }

        }

        // draw the layer with current zoomlevel
        this.draw(this.map, lat, lng, moveX, moveY, this.loadingZoomLevel, zoom, this.tileSource.src);
        this.layers[this.loadingZoomLevel]["layerDiv"].style.visibility = "";

        //if the current zoomlevel is not loaded completly, there must be a second layer displayed
        if (intZoom != this.visibleZoom && typeof this.layers[this.visibleZoom] != 'undefined') {
            if (this.visibleZoom < intZoom + 2) {
                this.draw(this.map, lat, lng, moveX, moveY, this.visibleZoom, zoom, this.tileSource.src,true);
                this.layers[this.visibleZoom]["layerDiv"].style.visibility = "";
            } else {
                this.layers[this.visibleZoom]["layerDiv"].style.visibility = "hidden";
            }

        }

        // pre Load for zoom out
        if (intZoom == this.visibleZoom && typeof this.layers[this.visibleZoom - 1] != 'undefined') {
            this.draw(this.map, lat, lng, moveX, moveY, this.visibleZoom - 1, zoom, this.tileSource.src,true);
            this.layers[this.visibleZoom - 1]["layerDiv"].style.visibility = "hidden";
        }

        if (this.layers[this.loadingZoomLevel]["loadComplete"]) {
            if (this.visibleZoom != intZoom) {
                this.layers[this.loadingZoomLevel]["loadComplete"] = false;
                this.hideLayer(this.visibleZoom);
                this.visibleZoom = this.loadingZoomLevel;
            }
        }

        if (this.quadtreeTimeout) clearTimeout(this.quadtreeTimeout);

        if (this.loadingZoomLevel != intZoom) {
            that = this;
            tempFunction = function () {
                that.layer(map, lat, lng, moveX, moveY);
            };

            this.quadtreeTimeout = window.setTimeout(tempFunction, 100);
        }

        if (this.oldIntZoom != this.intZoom) {
            if (this.oldIntZoom != this.visibleZoom) {
                this.hideLayer(this.oldIntZoom);
            }
        }

        this.oldIntZoom = intZoom;

        if (this.doTheOverlays || this.finalDraw || this.layerOldZoom == this.zoom()) {
            var startTime = new Date();
            this.lastDX = this.moveX;
            this.lastDY = this.moveY;
            this.renderOverlays();
            this.layerOldZoom = this.zoom();
            var duration = (new Date() - startTime);
            this.doTheOverlays = !(duration > 10 && !this.finalDraw);
        } else {
            this.hideOverlays();
        }

        that = this;

        var func = function () { that.blocked = false; that.layerTimer.reset();};
        if (this.layerBlockTimeout) clearTimeout(this.layerBlockTimeout);

        this.layerBlockTimeout = window.setTimeout(func, 20);
        this.finalDraw = false;
    };

    /* ==================== DRAW (speed optimized!!!)===============================
     This function draws one layer. It is highly opimized for iPhone.
     Please DO NOT CHANGE things except you want to increase speed!
     For opimization you need a benchmark test.

     How it works:
     The position of the images is fixed.
     The layer (not the images) is moved because of better performance
     Even zooming does not change position of the images, if 3D CSS is active (webkit).

     this method uses "this.layers" , "this.oldIntZoom", "this.width", "this.height";
     ===================================================================================*/
    this.draw = function (map, lat, lng, moveX, moveY, intZoom, zoom, tileFunc,preLoad) {
        this.framesCounter++;
        var that = this;

        var tempFunction = function () {
            that.framesCounter--
        };

        if (typeof preLoad == 'undefined') preLoad = false;

        window.setTimeout(tempFunction, 1000);
        var factor = Math.pow(2, intZoom);

        var latDelta,lngDelta,layerDiv;

        //create new layer
        if (!this.layers[intZoom]) {
            var tile = getTileNumber(lat, lng, intZoom);

            this.layers[intZoom] = [];
            this.layers[intZoom]["startTileX"] = tile[0];
            this.layers[intZoom]["startTileY"] = tile[1];
            this.layers[intZoom]["startLat"] = lat2y(lat);
            this.layers[intZoom]["startLng"] = lng;
            this.layers[intZoom]["images"] = {};

            layerDiv = document.createElement("div");
            layerDiv.setAttribute("zoomlevel", intZoom);

            jsMaps.Native.Dom.addClass(layerDiv,'layer-div');

            //higher zoomlevels are places in front of lower zoomleves.
            //no z-index in use.  z-index could give unwanted side effects to you application if you use this lib.
            var layers = map.childNodes;
            var appended = false;
            for (var i = layers.length - 1; i >= 0; i--) {
                var l = layers.item(i);
                if (l.getAttribute("zoomlevel") < intZoom) {
                    this.map.insertBefore(layerDiv, l);
                    appended = true;
                    //break;
                }
            }

            if (!appended) this.map.appendChild(layerDiv);

            //for faster access, a referenz to this div is in an array
            this.layers[intZoom]["layerDiv"] = layerDiv;
            latDelta = 0; lngDelta = 0;
        } else {
            //The layer with this zoomlevel already exists. If there are new lat,lng value, the lat,lng Delta is calculated
            layerDiv = this.layers[intZoom]["layerDiv"];
            latDelta = lat2y(lat) - this.layers[intZoom]["startLat"];
            lngDelta = lng - this.layers[intZoom]["startLng"];
        }

        layerDiv.style.visibility = "hidden";
        layerDiv.style.opacity = 1;

        //if the map is moved with drag/drop, the moveX,moveY gives the movement in Pixel (not degree as lat/lng)
        //here the real values of lat, lng are caculated
        //this.movedLng = (this.layers[intZoom]["startTileX"] / factor - moveX / this.tileW) * 360 - 180 + lngDelta;
        var ttt = this.latlngToXY(this.getCenter());

        this.movedLng = (this.layers[intZoom]["startTileX"] / factor - moveX / this.tileW) * 360 - 180 + lngDelta;
        var movedLat360 = (this.layers[intZoom]["startTileY"] / factor - moveY / this.tileH) * 360 - 180 - latDelta;
        this.movedLat = -y2lat(movedLat360); // -latDelta;  //the bug

        // calculate real x,y
        tile = getTileNumber(this.movedLat, this.movedLng, intZoom);

        var x = tile[0];
        var y = tile[1];

        var intX = Math.floor(x);
        var intY = Math.floor(y);

        var startX = this.layers[intZoom]["startTileX"];
        var startY = this.layers[intZoom]["startTileY"];

        var startIntX = Math.floor(startX);
        var startIntY = Math.floor(startY);

        var startDeltaX = -startX + startIntX;
        var startDeltaY = -startY + startIntY;

        var dx = x - startX;
        var dy = y - startY;

        var dxDelta = dx - startDeltaX;
        var dyDelta = dy - startDeltaY;

        //set all images to hidden (only in Array) - the values are used later in this function
        for (var vimg in this.layers[intZoom]["images"]) {
            this.layers[intZoom]["images"][vimg]["visibility"] = false;
        }

        //for debug only
        var width = this.width;
        var height = this.height;

        var zoomDelta = zoom - intZoom;
        sc = Math.pow(2, zoomDelta);

        if (sc < 0.5) sc = 0.5;

        //here the bounds of the map are calculated.
        //there is NO preload of images. Preload makes everything slow
        var minX = Math.floor((-width / 2 / sc) / this.tileW + dxDelta);
        var maxX = Math.ceil((width / 2 / sc) / this.tileW + dxDelta);
        var minY = Math.floor((-height / 2 / sc) / this.tileH + dyDelta);
        var maxY = Math.ceil((height / 2 / sc) / this.tileH + dyDelta);

        var minsc;

        //now the images are placed on to the layer
        for (var i = minX; i < maxX; i++) {
            for (var j = minY; j < maxY; j++) {
                var xxx = Math.floor(startX + i);
                var yyy = Math.floor(startY + j);

                // The world is recursive. West of America is Asia.
                var xx = xxx % factor;

                var yy = yyy;
                if (xx < 0) xx = xx + factor; // modulo function gives negative value for negative numbers
                if (yy < 0) continue;
                if (yy >= factor) continue;

                var src = tileFunc(xx, yy, intZoom);
                var id = src + "-" + xxx + "-" + yyy;

                //if zoom out, without this too much images are loaded
                if (this.wheelSpeedConfig["digizoom"]) {
                    minsc=1;
                }else{
                    minsc=0.5;
                }

                // draw images only if they don't exist on the layer
                if (this.layers[intZoom]["images"][id] == null && sc >=minsc) {
                    var img = document.createElement("img");
                    img.style.visibility = "hidden";

                    if ((this.discretZoomBlocked == true || this.zoomActive == true || this.wheeling == true || this.movestarted == false)) {
                        jsMaps.Native.Dom.addClass(img,'map-image no-anim');
                    } else {
                        jsMaps.Native.Dom.addClass(img,'map-image');

                        if (jsMaps.Native.Browser.any3d && jsMaps.Native.Utils.TRANSITION != false) {
                            var fn = function (evt) {
                                jsMaps.Native.Event.preventDefault(evt);
                                jsMaps.Native.Event.stopPropagation(evt);

                                jsMaps.Native.Dom.addClass(this,'no-anim');
                            };

                            img.addEventListener(jsMaps.Native.Utils.TRANSITION_END, fn, false);
                        }
                    }

                    img.style.left = i * this.tileW + "px";
                    img.style.top = j * this.tileH + "px";
                    img.style.width = this.tileW + "px";
                    img.style.height = this.tileH + "px";

                    // add img before SVG, SVG will be visible
                    if (layerDiv.childNodes.length > 0) {
                        layerDiv.insertBefore(img, layerDiv.childNodes.item(0));
                    } else {
                        layerDiv.appendChild(img);
                    }

                    // To increase performance all references are in an array
                    this.layers[intZoom]["images"][id] = {};
                    this.layers[intZoom]["images"][id]["img"] = img;
                    this.layers[intZoom]["images"][id]["array"] = [];
                    this.layers[intZoom]["images"][id]["array"].push(img);
                    this.layers[intZoom]["loadComplete"] = false;

                    //tileOverlays
                    for (var ov in this.tileOverlays) {
                        if (this.tileOverlays.hasOwnProperty(ov) == false) continue;

                        var ovObj = this.tileOverlays[ov];
                        var ovImg = img.cloneNode(true);
                        var imgSrc = ovObj.src(xx, yy, intZoom);
                        var ovId = id + "_" + ov;
                        jsMaps.Native.Event.attach(ovImg, "load", this.imgLoaded, this, false);

                        if (this.discretZoomBlocked == true) {
                            jsMaps.Native.Dom.addClass(ovImg,'map-image no-anim');
                        } else {
                            jsMaps.Native.Dom.addClass(ovImg,'map-image');
                        }


                        ovImg.setAttribute("src", imgSrc);
                        ovImg.setAttribute("overlay", ov);


                        layerDiv.appendChild(ovImg);
                        this.layers[intZoom]["images"][id]["array"].push(ovImg);
                    }

                    // if the images are loaded, they will get visible in the imgLoad function
                    if (preLoad == false) {
                        jsMaps.Native.Event.attach(img, "load", this.imgLoaded, this, false);
                        jsMaps.Native.Event.attach(img, "error", this.imgError, this, false);
                    }

                    if (preLoad == false) {
                        img.setAttribute("src", src);
                    } else {
                        img.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOwA=");
                        img.setAttribute("data-src", src);
                    }
                } else if (this.layers[intZoom]["images"][id] != null && sc >=minsc) {
                    var Img = this.layers[intZoom]["images"][id]["img"];

                    if (Img.getAttribute('data-src')!=null && Img.getAttribute('data-src') != '' && preLoad == false) {
                        jsMaps.Native.Event.attach(Img, "load", this.imgLoaded, this, false);
                        jsMaps.Native.Event.attach(Img, "error", this.imgError, this, false);

                        Img.setAttribute('src',Img.getAttribute('data-src'));
                        Img.setAttribute('data-src','');
                    }
                }

                // set all images that should be visible at the current view to visible (only in the layer);
                if(this.layers[intZoom]["images"][id]){
                    this.layers[intZoom]["images"][id]["visibility"] = true;
                }
            }
        }

        // remove all images that are not loaded and are not visible in current view.
        // if the images is out of the current view, there is no reason to load it.
        // Think about fast moving maps. Moving is faster than loading.
        // If you started in London and are already in Peking, you don't care
        // about images that show vienna for example
        // this code is useless for webkit browsers (march 2010) because of bug:
        // https://bugs.webkit.org/show_bug.cgi?id=6656
        for (var vImg in this.layers[intZoom]["images"]) {
            if (this.layers[intZoom]["images"].hasOwnProperty(vImg) == false) continue;
            var overlayImages;
            var o;

            if (this.layers[intZoom]["images"][vImg]['img'].getAttribute('data-src')!=null && this.layers[intZoom]["images"][vImg]['img'].getAttribute('data-src') != '' && preLoad == false) {
                jsMaps.Native.Event.attach(this.layers[intZoom]["images"][vImg]['img'], "load", this.imgLoaded, this, false);
                jsMaps.Native.Event.attach(this.layers[intZoom]["images"][vImg]['img'], "error", this.imgError, this, false);

                this.layers[intZoom]["images"][vImg]['img'].setAttribute('src',this.layers[intZoom]["images"][vImg]['img'].getAttribute('data-src'));
                this.layers[intZoom]["images"][vImg]['img'].setAttribute('data-src','');

            }

            if (this.layers[intZoom]["images"][vImg]["visibility"]) {
                if (this.layers[intZoom]["images"][vImg]["array"][0].getAttribute("loaded") == "yes") {
                    overlayImages = this.layers[intZoom]["images"][vImg]["array"];
                    for (o = 0; o < overlayImages.length; o++) {
                        if (overlayImages[o].getAttribute("loaded") == "yes") {
                            overlayImages[o].style.visibility = "";
                        }
                    }
                }
            } else {
                overlayImages = this.layers[intZoom]["images"][vImg]["array"];
                for (o = 0; o < overlayImages.length; o++) {
                    this.layers[intZoom]["images"][vImg]["array"][o].style.visibility = "hidden";

                    // delete img if not loaded and not needed at the moment
                    if (this.layers[intZoom]["images"][vImg]["array"][o].getAttribute("loaded") != "yes") {
                        layerDiv.removeChild(this.layers[intZoom]["images"][vImg]["array"][o]);
                    }
                }

                delete this.layers[intZoom]["images"][vImg]["img"];
                delete this.layers[intZoom]["images"][vImg];
            }
        }

        // Move and zoom the layer
        var sc = Math.pow(2, zoom - intZoom);
        this.scale = sc;

        var dxLeft = -(dxDelta * this.tileW);
        var dxTop = -(dyDelta * this.tileH);

        jsMaps.Native.Utils.setTransform(layerDiv,{x:dxLeft,y:dxTop},sc);
        jsMaps.Native.Utils.setTransformOrigin(layerDiv,{x:(-1 * dxLeft) ,y:(-1 * dxTop)});

        // Set the visibleZoom to visible
        layerDiv.style.visibility = "";

        // Not needed images are removed now. Lets check if all needed images are loaded already
        var notLoaded = 0;
        var total = 0;
        for (var q in this.layers[this.loadingZoomLevel]["images"]) {
            if (this.layers[this.loadingZoomLevel]["images"].hasOwnProperty(q) == false) continue;
            total++;

            var imgCheck = this.layers[this.loadingZoomLevel]["images"][q]["array"][0];
            if (!(imgCheck.getAttribute("loaded") == "yes")) notLoaded++;
        }


        if (notLoaded < 1) this.layers[this.loadingZoomLevel]["loadComplete"] = true;
        if (this.loadingZoomLevel == intZoom) this.imgLoadInfo(total, notLoaded);
    };
    // ====== END OF DRAW ======

    /**
     * fade effect for int zoom change
     * @type {null}
     */
    this.fadeOutTimeout = null;

    this.fadeOut = function (div, alpha) {
        if (jsMaps.Native.Browser.ielt9) return;

        if (alpha > 0 && jsMaps.Native.Browser.any3d && jsMaps.Native.Utils.TRANSITION != false) {
            div.style[jsMaps.Native.Utils.TRANSITION] = 'opacity '+((this.discretZoomBlocked)? '200ms':'500ms')+' ease-out';
            div.style.opacity = 0;

            var fn = function (evt) {
                jsMaps.Native.Event.preventDefault(evt);
                jsMaps.Native.Event.stopPropagation(evt);

                div.style[jsMaps.Native.Utils.TRANSITION] = "";
            };

            div.addEventListener(jsMaps.Native.Utils.TRANSITION_END, fn, false);
            return;
        }

        if (this.fadeOutTimeout) {
            clearTimeout(this.fadeOutTimeout);
        }
        if (alpha > 0) {
            div.style.opacity = alpha;

            var that = this;
            var tempFunction = function () {
                that.fadeOut(div, alpha - 0.2);
            };
            this.fadeOutTimeout = setTimeout(tempFunction, 50);

        } else {
            div.style.visibility = "hidden";
        }
    };

    /**
     * this function trys to remove images if they are not needed at the moment.
     * For webkit it's a bit useless because of bug
     *
     * https://bugs.webkit.org/show_bug.cgi?id=6656
     * For Firefox it really brings speed
     *
     * @param zoomlevel
     */
    this.hideLayer = function (zoomlevel) {
        if (this.intZoom != zoomlevel) {
            if (this.layers[zoomlevel]) {
                this.layers[zoomlevel]["layerDiv"].style.opacity = 1;

                this.fadeOut(this.layers[zoomlevel]["layerDiv"], 1);
            }
        }

        if (!this.layers[zoomlevel]) {
            return;
        }


        for (var vImg in this.layers[zoomlevel]["images"]) {
            if (this.layers[zoomlevel]["images"].hasOwnProperty(vImg) == false) continue;
            if (typeof this.layers[zoomlevel]["images"][vImg] == 'undefined' || this.layers[zoomlevel]["images"][vImg] == false) continue;
            if (typeof this.layers[zoomlevel]["images"][vImg]["img"] == 'undefined' || this.layers[zoomlevel]["images"][vImg]["img"] == false) continue;
            if (this.layers[zoomlevel]["images"][vImg]["img"].getAttribute("loaded") == "yes") continue;

            if (zoomlevel != this.intZoom) {
                var overlayImages = this.layers[zoomlevel]["images"][vImg]["array"];

                for (var o = 0; o < overlayImages.length; o++) {
                    this.layers[zoomlevel]["layerDiv"].removeChild(this.layers[zoomlevel]["images"][vImg]["array"][o]);
                }

                delete this.layers[zoomlevel]["images"][vImg]["img"];
                delete this.layers[zoomlevel]["images"][vImg];
            }
        }
    };

    /**
     * handling images of tile overlays
     *
     * @param evt
     */
    this.ovImgLoaded = function (evt) {
        var img = (evt.target) ? evt.target: evt.srcElement;
        img.style.visibility = "";
    };

    /**
     * method is called if an image has finished loading  (onload event)
     *
     * @param evt
     */
    this.imgLoaded = function (evt) {
        var img = evt.target || evt.srcElement;

        var loadComplete = true;
        img.style.visibility = "";
        img.setAttribute("loaded", "yes");
        if (!img.parentNode) return;
        img.style.opacity = 1;
        var notLoaded = 0;
        var total = 0;
        var zoomLevel = img.parentNode.getAttribute("zoomlevel");
        for (var i = 0; i < img.parentNode.getElementsByTagName("img").length; i++) {
            var theImg = img.parentNode.getElementsByTagName("img").item(i);
            if (theImg.getAttribute("overlay")) continue;

            total++;
            if (theImg.getAttribute("loaded") != "yes") {
                notLoaded++;
                loadComplete = false;
            }
        }

        if (notLoaded < total && jsMaps.Native.Browser.ielt9 && this.layers[this.getIntZoom()]) {
            this.layers[this.getIntZoom()]["layerDiv"].style.display = "";
        }

        var center;

        if (this.loadingZoomLevel == zoomLevel) {
            this.imgLoadInfo(total, notLoaded);

            if (this.wheeling == true) {
                if (zoomLevel >= this.tileSource.minzoom && zoomLevel <= this.tileSource.maxzoom) {
                    jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.zoom_changed);
                    jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.bounds_changed);
                    jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.center_changed);

                    center = this.getCenter();

                    this.moveX = 0;
                    this.moveY = 0;

                    this.position.center = center;
                    this.lat = center.lat;
                    this.lng = center.lng;

                    this.position.zoom = this.getZoom();
                }

                this.wheeling = false;
            }
        }

        if (typeof this.layers[zoomLevel]!='undefined') {
            this.layers[zoomLevel]["loadComplete"] = loadComplete;
        }

        if (loadComplete) {
            if (this.zoomActive == true) {
                jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.idle);

                center = this.getCenter();

                this.moveX = 0;
                this.moveY = 0;

                this.position.center = center;
                this.lat = center.lat;
                this.lng = center.lng;

                this.position.zoom = this.getZoom();
                //this.centerAndZoom(this.getCenter(),this.getZoom());

                this.zoomActive = false;
            }

            if (this.loadingZoomLevel == zoomLevel) {
                this.hideLayer(this.visibleZoom);

                if (jsMaps.Native.Browser.ielt9) {
                    this.hideLayer(this.visibleZoom + 1);  //no idea why
                }

                this.visibleZoom = zoomLevel;
            }
        }
    };

    /**
     * Image load error  (there maybe is an IE bug)
     *
     * @param evt
     */
    this.imgError = function (evt) {
        var img = (evt.target) ? evt.target: evt.srcElement;
        if (!img.parentNode) return;

        img.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEABAMAAACuXLVVAAAAG1BMVEX19fUAAADW1tY9PT23t7eZmZlbW1t6enoeHh7MsBpLAAAD40lEQVR4nO2YsXPaMBSHhTGGEcUBPBqapB1xuV474lxzXXHv0mTESdN2jHtHyIgvbY4/u5aeZMDUQUCTLr9vQTGR9CHpPT1gDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgGdiMJIv1Xe7dH418FXLGrw1nG+JsXjAb+XzSmcXgZCPVKvGW2ZdUr5gtrdAxPuq5XDDAc4Fl558Ge0tkKRN1Wp47S36Vd1Fey+B+P5QtcJH98n/LBf46O8hEHzR3ZLv3o4Cit0E0jM9UnDO/4cA7+lp+RH3X17A4iwdypbtWXz48gK2x+KxbNU7LE8JLyhQc1k0oxEPWUrhdHw95w83smlNGXv9wXtcN1sWmA5XBY5/pA8/DQXqLuseyFa3yYKxaNxTjvstBbh/Iv7w1gyeyAOyB78yE3DarEoZOOqzuC/ndCenveNY7ofFe2n71PqUrq1uuYCd9WB27PlGAo0Oq1MCjG9ZMhNzqsUPmlLgjSsGctQcJgKhnNpO+8yESkucQ0EWDFFz6Z1uSwrQtrDkwFggnS36b6abJWIZ/lk8snB5lmpbPlXzNIqHvlSgrrJJ3SyvijkD0T8LB2mTIwewuHKqFZNUqUBDXWmGWUWseiJ2y2nJ/VhQI4Hx6iSbBUL9KYIxM0Ccu67Y+sqBPJFLAlwK6PiLC8OVCiT6ICVGp1BEXkM4hzO17QWB4ZKpkUCs5w2bzACxTo7omIiGGtS6GMznKQn46h+jwnClAvnKmwmI7CvOHwtG+cGtBVnqm89XBcJCHJYKpFc9otjj74g9FhEoY1GuepZCvBs/34LtBfKC1USA9jgdUTay5XShJ57tLvCgS3aTKp+mzE54vaN1LJVDdxYYG8ybQ4ueXcgyEuSGON7SW0sCWx9CI+jYZTlA5gJ5JHU2qu8YBXkYGkGBl13Ikewm7PVaO6t5oDju5kRkBKWe7EKOb/Us+qNWSEBn4HTrVGwEJd8sBKgyjWcLgYgE1Ae3i1fLxsvIDLXh/JRqc7F8agsslQnViXCKl+vG69gMdQEHE9KOssm7dCNV2ySgKquwWF6UCliGpRChPm4yoPHF/lWpPkm/kkD8S7xh8+Ko5RVRtM0eqA3vqrQpyiiLZ1NaiWuTwAkXBXayVmKWC9SpoLbvTATUJdugHxpoiIg/fgv4WAn4CX9/F/C1tPpEWX7J3en0mhsthIpuRxU+8gTbgazqtYAV6y8JpgL0zcI1/WqyjnUxGeqmOBBnk89bjnB0sXWXMpetYuoZgAAEIAABK/8tHQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4F/wBHuGbzfTjEywAAAAASUVORK5CYII=");
        this.imgLoaded(evt);
    };

    /**
     * next function is from wiki.openstreetmap.org
     *
     * @param lat
     * @param lon
     * @param zoom
     * @returns {*[]}
     */
    var getTileNumber = function (lat, lon, zoom) {
        var xtile = ((lon + 180) / 360 * (1 << zoom));
        var ytile = ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1 << zoom));

        return [xtile, ytile];
    };


    /**
     * map is positioned absolute and is an a clone of the original map div.
     * on window resize it must be positioned again
     *
     * if there are problems with CSS margin, padding, border,.. this is the place to fix it
     *
     * @returns {{top: number, left: number, width: number, height: number, deltaTop: Number, deltaLeft: Number, deltaBottom: Number, deltaRight: Number}}
     */
    this.calculateMapSize = function () {
        //this method is very slow in 2010 browsers
        var el = this.mapParent;

        var bodyRect = document.body.getBoundingClientRect();
        var size1= el.getBoundingClientRect();

        var height = (size1.height) ? size1.height: size1.bottom - size1.top;
        var width = (size1.width) ? size1.width : size1.right - size1.left;

        // Make sure that there is no scroll bar when the map takes 100% of the screen
        if (parseInt(width) === parseInt(document.body.clientWidth) && parseInt(height) === parseInt(document.body.clientHeight)) document.body.style.overflow = "hidden";

        return {
            top : size1.top - bodyRect.top,
            left : size1.left - bodyRect.left,
            width : width,
            height : height,
            deltaTop : size1.top - bodyRect.top,
            deltaLeft : size1.left - bodyRect.left,
            deltaBottom : size1.bottom,
            deltaRight : size1.right
        };
    };

    this.redraw = function () {
        this.setMapPosition();
    };

    this.setMapPosition = function () {
        this.mapsize = this.calculateMapSize();
        this.size = this.calculateMapSize();

        var el = this.mapParent;

        this.mapTop = this.mapsize.top;// + this.mapsize.deltaTop;
        this.mapLeft = this.mapsize.left;// + this.mapsize.deltaLeft;
        this.width = this.mapsize.width;
        this.height = this.mapsize.height;

        this.clone.style.height = this.mapsize.height + "px";

        this.map.style.left = this.mapsize.width / 2 + "px";
        this.map.style.top = this.mapsize.height / 2 + "px";

        var center = this.getCenter();
        if (!center) return;

        var zoom = this.getZoom();
        if (zoom) this.centerAndZoom(this.getCenter(), this.getZoom());
    };

    this.clearMap = function () {
        if (!this.map)return;
        while (this.map.firstChild) {
            this.map.removeChild(this.map.firstChild);
        }
        while (this.layers.length > 0) {
            this.layers.pop();
        }
        this.redraw();
    };

    //functions from wiki gps2xy
    var lat2y = function (a) {
        return 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + a * (Math.PI / 180) / 2));
    };
    var y2lat = function (a) {
        return 180 / Math.PI * (2 * Math.atan(Math.exp(a * Math.PI / 180)) - Math.PI / 2);
    };

    //the image load information in the upper right corner
    this.imgLoadInfo = function (total, missing) {
        if (!this.loadInfoDiv) {
            this.loadInfoDiv = document.createElement("div");
            this.loadInfoDiv.style.position = "absolute";
            this.loadInfoDiv.style.top = "0px";
            this.loadInfoDiv.style.right = "0px";
            this.loadInfoDiv.style.backgroundColor = "white";
            this.loadInfoDiv.style.border = "1px solid gray";
            this.loadInfoDiv.style.fontSize = "10px";
            this.map.parentNode.appendChild(this.loadInfoDiv);
        }

        if (missing == 0) {
            this.loadInfoDiv.style.display = "none";
            jsMaps.Native.Event.trigger(this.mapParent,jsMaps.api.supported_events.tilesloaded);

            if (jsMaps.Native.Browser.ielt9) {
                this.clone.style.visibility = "";
            }
        } else {
            this.loadInfoDiv.style.display = "";
            while (this.loadInfoDiv.firstChild) {
                this.loadInfoDiv.removeChild(this.loadInfoDiv.firstChild);
            }

            this.loadInfoDiv.innerHTML = missing + ' images to load'
        }
    };

    this.mapCopyrightNode = false;

    this.mapCopyright = function () {
        if (typeof this.tileSource.copyright!='undefined') {
            if (!this.mapCopyrightNode) {
                this.mapCopyrightNode = jsMaps.Native.CreateDiv(this.map.parentNode,'map-copyright')
            }

            this.mapCopyrightNode.innerHTML = this.tileSource.copyright;
        }
    };

    this.scaleEnabled = options.scale_control;

    this.scaleDivExec = function () {
        if (this.scaleEnabled) {
            jsMaps.Native.ScaleUI.init(this);
            jsMaps.Native.ScaleUI._update();
        }
    };

    // ************* INIT **********
    this.internetExplorer = navigator.userAgent.indexOf("MSIE") != -1;

    if (navigator.userAgent.indexOf("Android") != -1) {

        var that = this;
        var tempFunction = function () {
            that.blocked = false
        };

        setInterval(tempFunction, 300);
    }

    this.position = {};

    if (typeof tileLayers == 'undefined') throw "No tile servers defined";
    if (tileLayers.Layers.length == 0) throw "Empty tile severs list";

    var counter = 0;
    for (var t in tileLayers.Layers) {
        if (tileLayers.Layers.hasOwnProperty(t) == false) continue;

        if (counter == 0) {

            this.tiles(tileLayers.Layers[t]);
        }

        counter++;
    }

    this.selectedTileLayer = 0;
    this.wheelSpeedConfig = [];
    this.wheelSpeedConfig["acceleration"] = 2;
    this.wheelSpeedConfig["maxSpeed"] = 2;

    this.wheelSpeedConfig["digizoom"] = true;
    this.wheelSpeedConfig["zoomAnimationSlowdown"] = 0.02;
    this.wheelSpeedConfig["animationFPS"] = 100;
    this.wheelSpeedConfig["moveAnimateDesktop"] = true;
    this.wheelSpeedConfig["moveAnimationSlowdown"] = 0.4;
    this.wheelSpeedConfig["rectShiftAnimate"] = false;
    this.wheelSpeedConfig["rectShiftAnimationTime"] = 500;
    this.wheelSpeedConfig["animateMinSpeed"] = 0.4;
    this.wheelSpeedConfig["animateMaxSpeed"] = 200;

    //variables for performance check
    this.wheelEventCounter = 0;
    this.framesCounter = 0;

    this.mapParent = map;
    this.overlays = [];

    // Add the zoom ui
    this.uiContainer = false;

    this.zoomControl = null;
    this.mapType = null;

    if (options.zoom_control) this.zoomControl = this.addOverlay(new jsMaps.Native.ZoomUI(this));
    if (options.map_type) this.mapType = this.addOverlay(new jsMaps.Native.LayersUI(this,tileLayers));

    this.clone = map.cloneNode(true); //clone is the same as the map div, but absolute positioned
    this.clone = document.createElement("div");
    this.clone.removeAttribute("id");

    jsMaps.Native.setCursor(this.clone,"grab");
    jsMaps.Native.Dom.addClass(this.clone,'jsMaps-Native-Box');

    if (map.firstChild) {
        map.insertBefore(this.clone, map.firstChild);
    } else {
        map.appendChild(this.clone);
    }

    this.map = document.createElement("div"); //this is the div that holds the layers, but no marker and svg overlayes
    this.map.style.position = "absolute";
    this.clone.appendChild(this.map);

    this.setMapPosition();

    //div for markers
    this.overlayDiv = document.createElement("div");
    this.overlayDiv.style.position = "absolute";
    this.clone.appendChild(this.overlayDiv);

    //distance tool
    this.distanceMeasuring = "no";
    this.moveMarker = null;
    this.measureLine = null;
    this.moveAnimationMobile = true;
    this.moveAnimationDesktop = false;
    this.moveAnimationBlocked = false;

    this.lastMouseX = this.width / 2;
    this.lastMouseY = this.height / 2;

    this.layers = [];
    this.visibleZoom = null;
    this.oldVisibleZoom = null;
    this.intZoom = null;

    this.moveX = 0;
    this.moveY = 0;

    this.lastMoveX = 0;
    this.lastMoveY = 0;
    this.lastMoveTime = 0;

    this.startMoveX = 0;
    this.startMoveY = 0;
    this.sc = 1;
    this.blocked = false;

    this.tileW = 256;
    this.tileH = 256;
    this.position.zoom = 1;
    this.movestarted = false;

    //touchscreen
    this.mousedownTime = null;
    this.doubleclickTime = 400;
    //mouse
    this.mousedownTime2 = null;
    this.doubleclickTime2 = 500;

    this.zoomOutTime = 1000;
    this.zoomOutSpeed = 0.01;
    this.zoomOutInterval = null;
    this.zoomOutStarted = false;

    this.draggable = true;

    this.mousewheelEnabled = options.mouse_scroll;

    var w;

    if (jsMaps.Native.Browser.ie) {
        w = map;

        jsMaps.Native.Event.attach(document.documentElement, "mouseup", function (e) {
            this.leftClick = false;
        }, this, false);

        jsMaps.Native.Event.attach(document.documentElement, "mousemove", this.mousemove, this, false);

        jsMaps.Native.Event.attach(parent, "mouseup", function (e) {
            this.leftClick = false;
        }, this, false);
    } else {
        w = window;
    }

    jsMaps.Native.Event.attach(window, "resize", this.setMapPosition, this, false);

    if (navigator.userAgent.indexOf("Konqueror") != -1) w = map;

    jsMaps.Native.Event.attach(map, "touchstart", this.start, this, false);
    jsMaps.Native.Event.attach(map, "touchmove", this.move, this, false);
    jsMaps.Native.Event.attach(map, "touchend", this.end, this, false);
    jsMaps.Native.Event.attach(w, "mousemove", this.mousemove, this, false);
    jsMaps.Native.Event.attach(map, "mousedown", this.mousedown, this, false);
    jsMaps.Native.Event.attach(w, "mouseup", this.mouseup, this, false);
    jsMaps.Native.Event.attach(w, "orientationchange", this.redraw, this, false);

    jsMaps.Native.Event.attach(map, "DOMMouseScroll", this.mousewheel, this, false);

    jsMaps.Native.Event.attach(map, "dblclick", this.doubleclick, this, false);

    if (typeof(this.keydown) == "function") {
        jsMaps.Native.Event.attach(w, "keydown", this.keydown, this, false);
        jsMaps.Native.Event.attach(w, "keyup", this.keyup, this, false);
    }

    this.mapCopyright();

    var center=new jsMaps.geo.Location(options.center.latitude,options.center.longitude);
    this.centerAndZoom(center,options.zoom);

    var hooking = function() {};
    hooking.prototype = new jsMaps.MapStructure();
    hooking.prototype.object = this;

    hooking.prototype.getCenter = function () {
        var map = this.object.getCenter();
        return {lat: map.lat, lng: map.lng};
    };

    hooking.prototype.getElement = function () {
        return this.object.clone;
    };
    /**
     *
     * @param {jsMaps.api.options} options
     */
    hooking.prototype.setOptions = function (options) {
        if (typeof options.center != 'undefined' && typeof options.center.latitude != 'undefined' && typeof options.center.longitude != 'undefined') this.setCenter(options.center.latitude, options.center.longitude);
        if (typeof options.zoom != 'undefined') this.setCenter(options.zoom);

        if (typeof options.mouse_scroll != 'undefined') this.object.mousewheelEnabled = options.mouse_scroll;
        if (typeof options.zoom_control != 'undefined') {
            if (options.zoom_control == true && this.object.zoomControl == null){
                this.object.zoomControl = this.object.addOverlay(new jsMaps.Native.ZoomUI(this.object));
            } else if (options.zoom_control == false && this.object.zoomControl != null) {
                this.object.removeOverlay(this.object.zoomControl);
                this.object.zoomControl = null;
            }
        }

        if (typeof options.map_type != 'undefined') {
            if (options.map_type == true && this.object.mapType == null){
                this.object.mapType = this.object.addOverlay(new jsMaps.Native.LayersUI(this.object,tileLayers))
            } else if (options.map_type == false && this.object.mapType != null) {
                this.object.removeOverlay(this.object.mapType);
                this.object.mapType = null;
            }
        }

        if (typeof options.scale_control != 'undefined') {
            if (options.scale_control == true){
                this.object.scaleEnabled  = true;

                jsMaps.Native.ScaleUI.clear();

                jsMaps.Native.ScaleUI.init(this.object);
                jsMaps.Native.ScaleUI._update();
            } else if (options.scale_control == false) {
                this.object.scaleEnabled  = false;

                jsMaps.Native.ScaleUI.clear();
            }
        }
    };

    hooking.prototype.setDraggable = function (flag) {
        this.object.draggable = flag;
    };

    hooking.prototype.latLngToPoint = function (lat, lng) {
        var point = new jsMaps.geo.Location(lat, lng);
        var xy = this.object.latlngToXY(point);

        return {x: xy['x'],y: xy['y']}
    };

    hooking.prototype.pointToLatLng = function (x, y) {
        var pos = this.object.XYTolatlng(x,y);
        return {lat:pos.lat,lng:pos.lng};
    };

    hooking.prototype.moveXY = function (x, y) {
        this.object.moveXY(x,y);
    };

    hooking.prototype.setCenter = function (lat, lng) {
        this.object.centerAndZoom(new jsMaps.geo.Location(lat, lng),this.object.getZoom());
        jsMaps.Native.Event.trigger(this.object.mapParent,jsMaps.api.supported_events.center_changed);
    };

    hooking.prototype.getBounds = function () {
        return jsMaps.Native.prototype.bounds(this.object);
    };

    hooking.prototype.getZoom = function () {
        return this.object.getIntZoom();
    };

    hooking.prototype.setZoom = function (number) {
        this.object.wheeling = true;
        this.object.zoom(number);
    };

    hooking.prototype.fitBounds = function (bounds) {
        this.object.wheeling = true;
        return this.object.setBounds(bounds.bounds);
    };

    return new hooking();
};

/**
 * Bounds object
 *
 * @param themap
 * @returns hooking
 */
jsMaps.Native.prototype.bounds = function (themap) {
    var __bounds;

    if (typeof themap != 'undefined') {
        __bounds = themap.getBounds();
    } else {
        __bounds = new jsMaps.Native.InnerBounds({lat:0,lng:0},{lat:0,lng:0});
    }

    var hooking = function () {};
    hooking.prototype = new jsMaps.BoundsStructure();

    hooking.prototype.bounds = __bounds;

    hooking.prototype.addLatLng = function (lat, lng) {
        this.bounds.extend(new jsMaps.geo.Location(lat, lng));
    };

    hooking.prototype.getCenter = function () {
        var center =  this.bounds.getCenter();
        return {lat: center.lat, lng: center.lng};
    };

    hooking.prototype.getTopLeft = function () {
        var topLeft =  this.bounds.ne();
        return {lat: topLeft.lat, lng: topLeft.lng};
    };

    hooking.prototype.getBottomRight = function () {
        var bottomRight =  this.bounds.sw();
        return {lat: bottomRight.lat, lng: bottomRight.lng};
    };

    return new hooking();
};

/**
 * Attach map events
 *
 * @param content
 * @param event
 * @param fnCore
 * @param once
 * @returns {*}
 */
jsMaps.Native.prototype.attachEvent = function (content,event,fnCore,once) {
    var elem;
    var customEvent = false;

    if (typeof content.object != 'undefined' && typeof content.object.mapParent!='undefined') {
        elem = content.object.mapParent;
    } else if (typeof content.object != 'undefined' && typeof content.object.marker!='undefined') {
        elem = content.object.marker;
        if (event == jsMaps.api.supported_events.click) customEvent = true;
    } else if (typeof content.object != 'undefined' && typeof content.object.infobox!='undefined') {
        elem = content.object.infobox;
    } else if (typeof content.object != 'undefined' && typeof content.object.vectorPath!='undefined') {
        elem = content.object.vectorPath;
        if (event == jsMaps.api.supported_events.click) customEvent = true;
    }

    var eventTranslation = event;
    if (event == jsMaps.api.supported_events.mouseover) eventTranslation = 'mouseenter';
    if (event == jsMaps.api.supported_events.rightclick) eventTranslation = 'contextmenu';
    if (event == jsMaps.api.supported_events.tilt_changed) eventTranslation = 'orientationchange';

    var fn = fnCore;

    // this is stupid, damn you micosoft
    if (typeof jsMaps.Native.Event[eventTranslation] != 'undefined') eventTranslation = jsMaps.Native.Event[eventTranslation];

    var useFn = function (e) {
        if (event == jsMaps.api.supported_events.mouseout) {
            var mouseOut = jsMaps.Native.MakeMouseOutFn(elem,e);
            if (mouseOut == false) return;
        }

        if ((event == jsMaps.api.supported_events.click || event == jsMaps.api.supported_events.dblclick) && typeof content.object.clickable != 'undefined' && content.object.clickable == false) {
            return;
        }

        if (event == jsMaps.api.supported_events.dblclick) {
            e.cancelBubble = true;
        }

        var eventHooking = function() {};
        eventHooking.prototype = new jsMaps.Event(e,event,content);

        eventHooking.prototype.getCursorPosition = function () {
            if (typeof this.container.object.mouseToLatLng!='undefined') {
                return this.container.object.mouseToLatLng(this.eventObject);
            }

            return  {lat: 0, lng: 0};
        };

        if (!jsMaps.Native.Browser.ielt9) {
            eventHooking.prototype.stopPropagation = function () {
                this.eventObject.stopPropagation();
                this.eventObject.stopImmediatePropagation();
                this.eventObject.cancelBubble = true;
            };
        }

        fn(new eventHooking);
    };

    var customFn = null;

    // Create the event.
    if (customEvent == false) {
        if (jsMaps.Native.Browser.ielt9) {
            if (!elem[eventTranslation]) {
                elem[eventTranslation] = 0;
            }

            if (eventTranslation == 'mouseenter'
                || eventTranslation == 'mouseout'
                || eventTranslation == 'mousemove'
                || eventTranslation == 'mouseup'
                || eventTranslation == 'mousedown'
                || eventTranslation == 'click'
            ) {
                var trigger;

                if (eventTranslation == 'mouseenter') trigger = 'onmouseover';
                if (eventTranslation == 'mouseout') trigger = 'onmouseout';
                if (eventTranslation == 'mousemove') trigger = 'onmousemove';
                if (eventTranslation == 'mouseup') trigger = 'onmouseup';
                if (eventTranslation == 'mousedown') trigger = 'onmousedown';
                if (eventTranslation == 'click') trigger = 'onclick';

                customFn = function (e) {
                    useFn(e);
                };

                elem.attachEvent(trigger, customFn);
            } else {
                customFn = function (e) {
                    if (e.propertyName == eventTranslation) {
                        useFn(e);
                    }
                };

                elem.attachEvent("onpropertychange", customFn);
            }
        } else {
            if (jsMaps.Native.Browser.touch) {
                if (eventTranslation == 'click'
                    || eventTranslation == 'mousedown'
                    || eventTranslation == 'mouseenter'
                ) eventTranslation = 'touchstart';

                if (eventTranslation == 'mousemove' || eventTranslation == 'drag') eventTranslation = 'touchmove';

                if (eventTranslation == 'mouseup'
                    || eventTranslation == 'mouseout'
                ) eventTranslation = 'touchend';
            }

            var eventTarget = document.createEvent('Event');
            eventTarget.initEvent(eventTranslation, true, true);
            elem.addEventListener(eventTranslation, useFn, false);
        }
    } else {
        elem = content.object.attachEvent(jsMaps.api.supported_events.click,useFn,false,false);
    }

    return {eventObj: elem, eventName: event, eventHandler: ((customFn == null) ? useFn: customFn)};
};

/**
 *
 * @param element
 * @param eventName
 */
jsMaps.Native.prototype.triggerEvent = function (element,eventName) {
    var elem;

    if (typeof element.object != 'undefined' && typeof element.object.mapParent!='undefined') {
        elem = element.object.mapParent;
    }else if (typeof element.object != 'undefined' && typeof element.object.marker!='undefined') {
        elem = element.object.marker;
    }

    jsMaps.Native.Event.trigger(elem,eventName);
};

/**
 *
 * @param map
 * @param eventObject
 * @returns {*}
 */
jsMaps.Native.prototype.removeEvent = function (map,eventObject) {
    jsMaps.Native.Event.remove(eventObject.eventObj,eventObject.eventName,eventObject.eventHandler);

};


/**
 * Generate markers
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.MarkerOptions} parameters
 */
jsMaps.Native.prototype.marker = function (map,parameters) {
    var options = {
        position: new jsMaps.geo.Location( parameters.position.lat,  parameters.position.lng),
        map: map.object,
        title:parameters.title,
        draggable: parameters.draggable,
        visible: true
    };

    if (parameters.zIndex != null) options.zIndex = parameters.zIndex;

    if (parameters.icon != null) {
        options.icon = new jsMaps.Native.Overlay.MarkerImage(
            parameters.icon
        );
    }else if (parameters.html != null) {
        options.icon = parameters.html;
        options.raiseOnDrag = false;
    }

    var marker = new jsMaps.Native.Overlay.Marker(options);

    var hooking = function () {};
    hooking.prototype = new jsMaps.MarkerStructure();

    hooking.prototype.object = marker;
    hooking.prototype._objectName = 'marker';

    /**
    *
    * @returns {{lat: *, lng: *}}
    */
    hooking.prototype.getPosition = function () {
        var pos = this.object.getPosition();
        return {lat: pos.lat, lng: pos.lng}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        jsMaps.Native.Event.trigger(this.object.marker,jsMaps.api.additional_events.position_changed);

        this.object.setPosition({lat: lat,lng: lng});
    };

    hooking.prototype.getVisible = function () {
        return this.object.getVisible();
    };

    hooking.prototype.setVisible = function (variable) {
        return this.object.setVisible(variable);
    };

    hooking.prototype.getIcon = function () {
        if (typeof this.object.MarkerOptions.icon != 'undefined' && typeof this.object.MarkerOptions.icon.url != 'undefined') {
            return this.object.MarkerOptions.icon.url;
        }

        return null;
    };

    hooking.prototype.setIcon = function (icon) {
        while (this.object.marker.firstChild) {
            this.object.marker.removeChild(this.object.marker.firstChild);
        }

        if (this.object.shadow) {
            while (this.object.shadow.firstChild) {
                this.object.shadow.removeChild(this.object.shadow.firstChild);
            }
        }

        this.object.MarkerOptions.shape = false;
        this.object.MarkerOptions.icon = new jsMaps.Native.Overlay.MarkerImage(icon);

        this.object.populateIcon(this.object.MarkerOptions);
        this.object.init(this.object.MarkerOptions.map);
        this.object.render();

        jsMaps.Native.Event.trigger(this.object.marker,jsMaps.api.additional_events.icon_changed);
    };

    hooking.prototype.getZIndex = function () {
        return this.object.marker.style.zIndex;
    };

    hooking.prototype.setZIndex = function (number) {
        this.object.MarkerOptions.zIndex = number;
        this.object.render();
    };

    hooking.prototype.setDraggable = function (flag) {
        this.object.MarkerOptions.draggable = flag;
        this.object.init(this.object.MarkerOptions.map);
        this.object.render();
    };

    hooking.prototype.remove = function () {
        while (this.object.marker.firstChild) {
            this.object.marker.removeChild(this.object.marker.firstChild);
        }

        if (this.object.shadow) {
            while (this.object.shadow.firstChild) {
                this.object.shadow.removeChild(this.object.shadow.firstChild);
            }
        }

        this.object.clear();
        this.object.destroy();

        this.object = null;
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
jsMaps.Native.prototype.infoWindow = function (parameters) {
    var options = {content: parameters.content};
    if (parameters.position != null) options.position = parameters.position;

    var infoWindow = new jsMaps.Native.Overlay.InfoWindow(options);

    var hooking = function () {};
    hooking.prototype = new jsMaps.InfoWindowStructure();

    /**
     * @type {jsMaps.Native.Overlay.InfoWindow}
     */
    hooking.prototype.object = infoWindow;

    hooking.prototype.getPosition = function () {
        var pos = this.object.getPosition();
        return {lat: pos.lat, lng: pos.lng}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        this.object.setPosition({lat: lat,lng: lng});
    };

    hooking.prototype.close = function () {
        this.object.close();
    };

    /**
     *
     * @param {jsMaps.MapStructure} map
     * @param {jsMaps.MarkerStructure} marker
     */
    hooking.prototype.open = function(map,marker) {
        this.object.open(map.object,((typeof marker == 'undefined' || typeof marker.object == 'undefined') ? undefined: marker.object));
    };

    hooking.prototype.setContent = function (content) {
        this.object.setContent(content);
    };

    return new hooking();
};


/**
 * Create PolyLine
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolyLineOptions} parameters
 * @returns jsMaps.PolyLineStructure
 */
jsMaps.Native.prototype.polyLine = function (map,parameters) {
    var vector = new jsMaps.Native.Overlay.Vector({
        clickable: parameters.clickable,
        stroke: parameters.strokeColor,
        strokeWidth: parameters.strokeWeight,
        strokeOpacity: parameters.strokeOpacity,
        fill: "none",
        draggable: parameters.draggable,
        editable: parameters.editable,
        visible: parameters.visible,
        zIndex:  parameters.zIndex
    }, parameters.path, jsMaps.Native.Vector.elements.polyLine);
    map.object.addOverlay(vector);

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolyLineStructure();

    hooking.prototype.object = vector;

    hooking.prototype.getEditable = function () {
        return this.object._vectorOptions.editable;
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        /**
         *
         * @type {jsMaps.Native.Overlay.Vector._vectorPoints|*|jsMaps.Native.Overlay.Vector.vectorObject._vectorPoints}
         */
        var path = this.object._vectorPoints;

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            var pos = path[i];

            arrayOfPaths.push ({lat: pos.lat, lng: pos.lng});
        }

        return arrayOfPaths;
    };

    hooking.prototype.getVisible = function () {
        return this.object._vectorOptions.visible;
    };

    hooking.prototype.setDraggable = function (draggable) {
        this.object._vectorOptions.draggable = draggable;
    };

    hooking.prototype.setEditable = function (editable) {
        this.object._vectorOptions.editable = editable;
        this.object.render(true);
    };

    hooking.prototype.setPath = function (pathArray) {
        this.object._vectorPoints = pathArray;
        this.object.render(true);
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.object.theMap.removeOverlay(this.object);
        map.object.addOverlay(this.object);
        this.object.theMap = map.object;
        this.object._vectorOptions.map = map.object;

        this.object.render(true);
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setVisible(visible);
    };

    hooking.prototype.removeLine = function () {
        this.object.destroy();
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Native.VectorStyle.bind(object);
    object.getStyle = jsMaps.Native.VectorGetStyle.bind(object);
    return object;
};


/**
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.PolygonOptions} parameters
 * @returns jsMaps.PolygonStructure
 */
jsMaps.Native.prototype.polygon = function (map,parameters) {
    var vector = new jsMaps.Native.Overlay.Vector({
        clickable: parameters.clickable,
        stroke: parameters.strokeColor,
        strokeWidth: parameters.strokeWeight,
        strokeOpacity: parameters.strokeOpacity,
        fill:  parameters.fillColor,
        fillOpacity: parameters.fillOpacity,
        draggable: parameters.draggable,
        editable: parameters.editable,
        visible: parameters.visible,
        zIndex:  parameters.zIndex
    }, parameters.paths, jsMaps.Native.Vector.elements.polygon);
    map.object.addOverlay(vector);

    var hooking = function () {};
    hooking.prototype = new jsMaps.PolygonStructure();

    hooking.prototype.object = vector;

    hooking.prototype.getDraggable = function () {
        return this.object._vectorOptions.draggable;
    };

    hooking.prototype.getEditable = function () {
        return this.object._vectorOptions.editable;
    };

    hooking.prototype.getPath = function () {
        var arrayOfPaths = [];
        /**
         *
         * @type {jsMaps.Native.Overlay.Vector._vectorPoints|*|jsMaps.Native.Overlay.Vector.vectorObject._vectorPoints}
         */
        var path = this.object._vectorPoints;

        for (var i in path) {
            if (path.hasOwnProperty(i) == false) continue;
            var pos = path[i];

            arrayOfPaths.push ({lat: pos.lat, lng: pos.lng});
        }

        return arrayOfPaths;
    };

    hooking.prototype.getVisible = function () {
        return this.object._vectorOptions.visible;
    };

    hooking.prototype.setDraggable = function (draggable) {
        this.object._vectorOptions.draggable = draggable;
    };

    hooking.prototype.setEditable = function (editable) {
        this.object._vectorOptions.editable = editable;
        this.object.render(true);
    };

    hooking.prototype.setPath = function (pathArray) {
        this.object._vectorPoints = pathArray;
        this.object.render(true);
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.object.theMap.removeOverlay(this.object);
        map.object.addOverlay(this.object);
        this.object.theMap = map.object;
        this.object._vectorOptions.map = map.object;

        this.object.render(true);
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setVisible(visible);
    };

    hooking.prototype.removePolyGon = function () {
        this.object.destroy();
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Native.VectorStyle.bind(object);
    object.getStyle = jsMaps.Native.VectorGetStyle.bind(object);
    return object;
};


/**
 * Create PolyLine
 *
 * @param {jsMaps.MapStructure} map
 * @param {jsMaps.CircleOptions} parameters
 * @returns jsMaps.CircleStructure
 */
jsMaps.Native.prototype.circle = function (map,parameters) {
    var vector = new jsMaps.Native.Overlay.Vector({
        clickable: parameters.clickable,
        stroke: parameters.strokeColor,
        strokeWidth: parameters.strokeWeight,
        strokeOpacity: parameters.strokeOpacity,
        fill:  parameters.fillColor,
        fillOpacity: parameters.fillOpacity,
        draggable: parameters.draggable,
        editable: parameters.editable, // currently not supported
        visible: parameters.visible,
        zIndex:  parameters.zIndex,
        center: parameters.center,
        radius: parameters.radius
    }, [], jsMaps.Native.Vector.elements.circle);
    map.object.addOverlay(vector);

    var hooking = function () {
    };
    hooking.prototype = new jsMaps.CircleStructure();

    hooking.prototype.object = vector;

    hooking.prototype.getBounds = function () {
        var bBox = new jsMaps.Native.prototype.bounds();
        bBox.bounds = this.object.pointsBounds();

        return bBox;
    };

    hooking.prototype.getCenter = function () {
        var theCenter = this.getBounds().getCenter();
        return {lat: theCenter.lat, lng: theCenter.lng};
    };

    hooking.prototype.getDraggable = function () {
        return this.object._vectorOptions.draggable;
    };

    hooking.prototype.getEditable = function () {
        return this.object._vectorOptions.editable;
    };

    hooking.prototype.getRadius = function () {
        return this.object._vectorOptions.radius;
    };

    hooking.prototype.getVisible = function () {
        return this.object._vectorOptions.visible;
    };

    hooking.prototype.setCenter = function (lat, lng) {
        this.object._vectorOptions.center = {lat: lat, lng: lng};
        this.object.render(true);
    };

    hooking.prototype.setDraggable = function (draggable) {
        this.object._vectorOptions.draggable = draggable;
    };

    hooking.prototype.setEditable = function (editable) {
        this.object._vectorOptions.editable = editable;
        this.object.render(true);
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        this.object.theMap.removeOverlay(this.object);
        map.object.addOverlay(this.object);
        this.object.theMap = map.object;
        this.object._vectorOptions.map = map.object;

        this.object.render(true);
    };

    hooking.prototype.setVisible = function (visible) {
        this.object.setVisible(visible);
    };

    hooking.prototype.setRadius = function (radius) {
        this.object._vectorOptions.radius = radius;
        this.object.render(true);
    };

    hooking.prototype.removeCircle = function () {
        this.object.destroy();
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Native.VectorStyle.bind(object);
    object.getStyle = jsMaps.Native.VectorGetStyle.bind(object);
    return object;
};