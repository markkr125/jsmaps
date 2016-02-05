// Forked version of khtml javascript library infoWindow.
//
// --------------------------------------------------------------------------------------------
// khtml javascript library license
// --------------------------------------------------------------------------------------------
// (C) Copyright 2010-2011 by Bernhard Zwischenbrugger, Florian Hengartner, Stefan Kemper, Ewald Wieser
//
// Project Info:  http://www.khtml.org
//				  http://www.khtml.org/iphonemap/help.php
//
// This library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public License
// along with this library.  If not, see <http://www.gnu.org/licenses/>.
// --------------------------------------------------------------------------------------------

/**
 * generates a InfoWindowOptions-object<br/>
 * options for a infowindow
 * @param {string} [content] Content to show in infowindow. Any string, may also contain HTML-tags.
 * @param {bool} [disableAutoPan]  not used yet, only for compatibility to Google Markers
 * @param {number} [maxWidth] not used yet, only for compatibility to Google Markers
 * @param [pixelOffset]  not used yet, only for compatibility to Google Markers
 * @param {jsMaps.geo.Location} [position] LatLng where to place InfoWindow when it's not attached to an anchor
 * @param {number} [zIndex]  not used yet, only for compatibility to Google Markers
 * @class
 */
jsMaps.Native.Overlay.InfoWindowOptions = function (content, disableAutoPan, maxWidth, pixelOffset, position, zIndex) {
    if (content) this.content = content;
    if (position) this.position = position;
};

/**
 * Generates an InfoWindow-object with the specified InfoWindowOptions.<br/>
 * Can be opened on any anchorObject, that exposes position and pixelOffset function.
 *
 @example Minimum code to open an infowindow on a marker:
 <pre><code>
 var infowindow = new mr.overlay.InfoWindow({
  	content: 'Text in the InfoWindow'
  });

 marker.attachEvent( 'click', function() {
  	// Opening the InfoWindow
  	infowindow.open(map, this);
  });
 </code></pre>
 * @see Example (click on the marker): <a href="../../../examples/infowindow/infowindow.html">Infowindow</a>}
 * @class
 * @param {jsMaps.Native.Overlay.InfoWindowOptions} InfoWindowOptions Options for InfoWindow
 */
jsMaps.Native.Overlay.InfoWindow = function (InfoWindowOptions) {
    this.InfoWindowOptions = InfoWindowOptions;


    // ---------------------
    // Constructor
    // ---------------------
    // create the infowindow

    this.infobox = document.createElement("div");
    this.infobox.style.position = "absolute";
    this.infobox.style.left = "-1000px";

    this.infobox.style.padding = "0";
    this.infobox.style.whiteSpace = "nowrap";

    jsMaps.Native.setCursor(this.infobox, "default");

    // content-div
    this.infobox.content = document.createElement("div");
    this.infobox.content.style.position = "absolute";
    this.infobox.content.className = "infoWindow";
    this.infobox.content.style.backgroundColor = "white";
    this.infobox.content.widthUpdated = false;
    if (this.InfoWindowOptions.content) {
        this.infobox.content.innerHTML = this.InfoWindowOptions.content;

        var that = this;

        var fn = function () {
            jsMaps.Native.Event.trigger(that.infobox,jsMaps.api.supported_events.domready);
        };

        setTimeout(fn,100);
    }

    this.infobox.appendChild(this.infobox.content);

    this.infobox.pointer = document.createElement('div');
    this.infobox.pointer.className = "infoWindow-pointer";

    this.infobox.appendChild(this.infobox.pointer);

    // cross in the upper right corner of the infowindow to close it
    // must be the last elemen in infobox that click eventhandler works
    this.closebutton = document.createElement("div");
    this.closebutton.style.position = "absolute";

    this.closebutton.style.height = "28px";
    this.closebutton.style.width = "28px";
    this.closebutton.style.top = "1.6em";
    this.closebutton.style.right = "4px";

    this.closebutton.style.padding = "0";
    this.closebutton.style.zIndex = "10000";

    if ((navigator.userAgent.indexOf("MSIE") != -1)	// IE 6-7 do not support transparent PNGs
        && (parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE") + 5)) <= 7)) {
        el = document.createElement('div');
        el.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + close_image + "')";
        el.style.width = "100%";
        el.style.height = "100%";
    }
    else {
        el = document.createElement('img');
        el.setAttribute('src', close_image);				// embedded image for close button
    }

    el.style.opacity = 0.6;
    el.style.cursor = 'pointer';
    el.style.position = 'absolute';

    el.style.width = '20px';
    el.style.height = '20px';
    el.style.top = '4px';
    el.style.right = '4px';

    jsMaps.Native.imageNotSelectable(el);
    el.setAttribute('onmouseover', "javascript:this.style.opacity=\'1\'");
    el.setAttribute('onmouseout', "javascript:this.style.opacity=\'0.6\'");		// mousecursor -> pointer, hover function
    this.closebutton.appendChild(el);
    this.infobox.appendChild(this.closebutton);

    // attach eventhandler for close function
    jsMaps.Native.Event.attach(this.closebutton, "click", function () {
        this.close();
    }, this, false);

    // attach eventhandler for close function
    jsMaps.Native.Event.attach(this.closebutton, "touchend", function () {
        this.close();
    }, this, false);

    this.getPosition = function () {
        if (typeof this.mapObj == 'undefined') return new jsMaps.geo.Location(0,0);
        return this.mapObj.XYTolatlng(this.infobox.offsetLeft,this.infobox.offsetTop);
    };

    /**
     *
     * @param  {jsMaps.geo.Location} latLng
     */
    this.setPosition = function (latLng) {
        this.InfoWindowOptions.position = latLng;

        if (typeof(this.anchorObject) == "object") this.anchorObject.setPosition(latLng);
        if (typeof this.mapObj != 'undefined') this.render();

        jsMaps.Native.Event.trigger(this.infobox,jsMaps.api.additional_events.position_changed);
    };

    /**
     * Render infowindow, pointer and shadow. Automatically called by the map.
     */
    this.render = function () {
        if (typeof(this.anchorObject) != "object") {
            var div = document.createElement("div");

            div.style.height = "20px";
            div.style.width = "20px";

            var pos;

            if (this.InfoWindowOptions.position)
                pos = this.InfoWindowOptions.position;		// point to position
            else {
                pos = this.mapObj.getCenter();	// point to center of map
            }

            /**
             *
             * @type {jsMaps.Native.Overlay.MarkerOptions}
             */
            var options = {
                position: new jsMaps.geo.Location(pos.lat, pos.lng),
                icon: div,
                raiseOnDrag: false,
                title: "DOM-element",
                zIndex: 0
            };

            this.anchorObject = new jsMaps.Native.Overlay.Marker(options);
            this.anchorObject.elementType = 'div';
            this.mapObj.addOverlay(this.anchorObject);
        }

        // adjust infobox-width according to content
        // adjust infobox-width according to content
        if ( this.infobox.style.width.length == 0){
            if (parseInt(this.infobox.content.offsetWidth) > (270 - 20)) {	// larger than minWidth
                this.infobox.style.width = parseInt(this.infobox.content.offsetWidth) + 20 + "px";
            }
            else
                this.infobox.style.width = "270px";

            if (parseInt(this.infobox.content.offsetWidth) > (parseInt(this.mapObj.size.width) - 40)) {	// larger than map
                this.infobox.style.width = parseInt(this.mapObj.size.width) - 20 + "px";	// fixed distance of 10px left an right to mapedge
                this.infobox.style.whiteSpace = "normal";
            }
            if (parseInt(this.infobox.content.offsetWidth) > 640) {	// maximum width of 640px
                this.infobox.style.width = 640 + 20 + "px";
                this.infobox.style.whiteSpace = "normal";
            }
        }



        // attach infobox to anchorObject
        // must provide position property (lat/lng)
        // can provide pixelOffset from position (x,y)
        if (typeof(this.anchorObject) == "object") {
            this.xy = this.mapObj.latlngToXY(this.anchorObject.getPosition());		// position of the AnchorObject
            if (this.anchorObject.pixelOffset)
                this.offset = this.anchorObject.pixelOffset();						// pixelOffset from the position to the pointer of the infobox
            else
                this.offset = {x: 0, y: 0};
        }
        // no anchorObject
        else {
            if (typeof this.infobox.pointer != 'undefined') this.infobox.pointer.style.display = "none";
            if (this.InfoWindowOptions) {
                // position provided
                if (this.InfoWindowOptions.position)
                    this.xy = this.mapObj.latlngToXY(this.InfoWindowOptions.position);		// point to position
                // no position
                else {
                    this.xy = this.mapObj.latlngToXY(this.mapObj.getCenter());	// point to center of map
                }

                var current =  {x: parseInt(this.infobox.style.width), y: parseInt(this.infobox.style.height)};

                // pixelOffset provided
                if (this.InfoWindowOptions.pixelOffset) {
                    if (this.InfoWindowOptions.pixelOffset.x)
                        this.offset["x"] = this.InfoWindowOptions.pixelOffset.x;		// x-Offset
                    else
                        this.offset["x"] = 0;
                    if (this.InfoWindowOptions.pixelOffset.y)
                        this.offset["y"] = this.InfoWindowOptions.pixelOffset.y;		// y-Offset
                    else
                        this.offset["y"] = 0;
                }
                // no pixelOffset
                else
                    this.offset = {x: 0, y:  0};	// offset = 0
            }
            // no InfoWindowOptions provided
            else
                this.xy = {x: 0, y: 0};	// point to center of map
        }

        this.infobox.style.left = (this.xy["x"] + this.offset["x"] - ((parseInt(this.infobox.style.width) ) / 2) - this.infobox.pointer.offsetWidth) + "px";
        this.infobox.style.bottom = (-this.xy["y"] + this.offset["y"] + this.infobox.pointer.offsetHeight - 1) + "px";
        this.infobox.style.zIndex = parseInt(this.xy["y"]) + this.mapObj.size.height;

        // move map when opening infobox thats outside
        if (this.opened) {
            this._moveMap();
        }
    };

    /**
     * Open the infowindow on the map at an anchorObject. The infowindow is moved with the anchorObject.
     The anchorObject is not necessarily needed. The infowindow can also be positioned via the position property in the InfoWindowOptions.
     * @param {jsMaps.Native} mapObj The map to open the infowindow in.
     * @param {Object} [anchorObject] A object of the map that provides a getPosition()-method.
     */
    this.open = function (mapObj, anchorObject) {
        this.mapObj = mapObj;
        this.anchorObject = anchorObject;

        // create seperate div for infoboxes, if not existing
        if (!this.mapObj.overlayDiv.infoboxDiv) {
            this.mapObj.overlayDiv.infoboxDiv = document.createElement("div");
            this.mapObj.overlayDiv.appendChild(this.mapObj.overlayDiv.infoboxDiv);
            this.mapObj.overlayDiv.infoboxDiv.setAttribute("id", "infoboxDiv");
        }

        // remove infobox if already appended
        if (this.infobox.parentNode) {
            this.infobox.parentNode.removeChild(this.infobox);
        }

        // append infobox
        this.mapObj.overlayDiv.infoboxDiv.appendChild(this.infobox);
        this.opened = true;
        this.mapObj.addOverlay(this);


        if (parseInt(this.infobox.content.offsetWidth) > (270 - 20)) {	// larger than minWidth
            if (this.infobox.content.widthUpdated == false) {
                this.infobox.style.width = parseInt(this.infobox.content.offsetWidth) + 20 + "px";
                this.infobox.content.widthUpdated = true;
            }
        }
        else  {
            this.infobox.style.width = "270px";
        }

        if (parseInt(this.infobox.content.offsetWidth) > (parseInt(this.mapObj.size.width) - 40)) {	// larger than map
            this.infobox.style.width = parseInt(this.mapObj.size.width) - 20 + "px";	// fixed distance of 10px left an right to mapedge
            this.infobox.style.whiteSpace = "normal";
        }
        if (parseInt(this.infobox.content.offsetWidth) > 640) {	// maximum width of 640px
            this.infobox.style.width = 640 + 20 + "px";
            this.infobox.style.whiteSpace = "normal";
        }

        this.infobox.content.style.left = "10px";
        this.infobox.content.style.width = parseInt(this.infobox.style.width) - 20 + "px";

        // adjust infobox-height according to content
        if (parseInt(this.infobox.content.offsetHeight) > (80 - 20)) {	// larger than minHeight
            this.infobox.style.height = parseInt(this.infobox.content.offsetHeight) + 20 + "px";
        }
        else
            this.infobox.style.height = "80px";
        if (parseInt(this.infobox.content.offsetHeight) > (parseInt(this.mapObj.size.height) - 40 - this.infobox.pointer.offsetHeight - this.offset["y"])) {	// larger than map
            this.infobox.style.height = this.mapObj.size.height - this.infobox.pointer.offsetHeight - this.offset["y"] - 20 + "px";	// fixed distance of 10px top and bottom to mapedge
            this.infobox.content.style.overflowY = "scroll";
            // allow scrolling in infowindow-content in ios5
            this.infobox.content.style.overflow = "auto";
            this.infobox.content.style.WebkitOverflowScrolling = "touch";
        }
        if (typeof(this.anchorObject.elementType) == "undefined") {
            this.infobox.pointer.style.display = "";
        } else {
            this.infobox.pointer.style.display = "none";
        }

        this.infobox.content.style.height = "auto";
        this.infobox.pointer.style.left = ((parseInt(this.infobox.style.width)) / 2) + "px";
        this.infobox.pointer.style.bottom = -this.infobox.pointer.offsetHeight+2 + "px";
        this.infobox.content.style.top = ((parseInt(this.infobox.style.height) +parseInt(this.infobox.pointer.offsetHeight) )-parseInt(this.infobox.content.offsetHeight) )-parseInt(this.infobox.pointer.offsetHeight) +"px";

        //suppress zooming map when scrolling with mousewheel in content-area
        jsMaps.Native.Event.attach(this.infobox, "DOMMouseScroll", jsMaps.Native.Event.cancel, this, false);
        //suppress doubleclick zoom in on infobox
        jsMaps.Native.Event.attach(this.infobox, "dblclick", jsMaps.Native.Event.cancel, this, false);
        //suppress moving map when clicking and dragging in content-area
        jsMaps.Native.Event.attach(this.infobox.content, "mousedown", jsMaps.Native.Event.cancel, this, false);
        //suppress moving map when clicking and dragging in content-area to allow touch-scrolling
        jsMaps.Native.Event.attach(this.infobox.content, "touchstart", jsMaps.Native.Event.cancel, this, false);
        jsMaps.Native.Event.attach(this.infobox.content, "touchmove", jsMaps.Native.Event.cancel, this, false);

        //suppress moving map and dragging images when clicking and dragging on the rest of the infobox
        jsMaps.Native.Event.attach(this.infobox, "mousedown", function (evt) {
            jsMaps.Native.Event.stopEventPropagation(evt);
            jsMaps.Native.Event.cancel(evt);
        }, this, false);
        //suppress propagation to allow rightclick in contentarea
        jsMaps.Native.Event.attach(this.infobox.content, "contextmenu", jsMaps.Native.Event.cancel, this, false);

        // todo:scrolling in content on touch-device, suppress moving map on infobox


        // add callback to anchorpoint to move infowindow when moving anchorpoint
        if (this.anchorObject) {
            var that = this;
            this.anchorObject.addCallbackFunction(function () {
                that.render();
            });
        }
    };


    /**
     * Remove the infowindow from the map. Infowindow still exists, will still be rendered.
     */
    this.clear = function () {
        if (this.infobox) {
            if (this.infobox.parentNode) {
                try {
                    this.infobox.parentNode.removeChild(this.infobox);
                } catch (e) {
                }
            }
        }
        if (this.shadow) {
            if (this.shadow.parentNode) {
                try {
                    this.shadow.parentNode.removeChild(this.shadow);
                } catch (e) {
                }
            }
        }
        this.opened = false;
    };


    /**
     * Closes the infowindow. Will not be rendered any more.
     */
    this.close = function () {
        this.mapObj.removeOverlay(this);
    };


    /**
     * Set the content for the infowindow.
     * @param {String} content Any string, may also contain HTML-tags.
     */
    this.setContent = function (content) {
        this.infobox.content.innerHTML = content;
        this.infobox.content.widthUpdated = false;
        jsMaps.Native.Event.trigger(this.infobox,jsMaps.api.supported_events.domready);
    };


    var mapMoveSpeedX = 1;
    var mapMoveSpeedY = 1;
    var mapMoveMaxSpeed = 20;
    /**
     * move map when opening infobox thats outside
     */
    this._moveMap = function () {
        var that = this;

        var offset = this.infobox.getBoundingClientRect();

        // move left
        if ((this.infobox.offsetLeft + parseInt(this.infobox.style.width)) > (this.mapObj.size.width - 10)) {
            if ((this.infobox.offsetLeft + parseInt(this.infobox.style.width)) < this.mapObj.size.width) mapMoveSpeedX = 10 - (this.mapObj.size.width - (this.infobox.offsetLeft + parseInt(this.infobox.style.width)));
            else if (mapMoveSpeedX < mapMoveMaxSpeed) mapMoveSpeedX++;
            // move left down
            if (this.infobox.offsetTop < 10) {
                if (this.infobox.offsetTop > 0) mapMoveSpeedY = 10 - this.infobox.offsetTop;
                else if (mapMoveSpeedY < mapMoveMaxSpeed) mapMoveSpeedY++;
                window.clearTimeout(this.mapmoveInterval);
                this.mapmoveInterval = window.setTimeout(function () {
                    that.mapObj.moveXY(-mapMoveSpeedX, mapMoveSpeedY);
                }, 10);
            }
            // move left up
            else if (this.xy["y"] > (this.mapObj.size.height - 10)) {
                if (this.xy["y"] < this.mapObj.size.height) mapMoveSpeedY = 10 - (this.mapObj.size.height - this.xy["y"]);
                else if (mapMoveSpeedY < mapMoveMaxSpeed) mapMoveSpeedY++;
                window.clearTimeout(this.mapmoveInterval);
                this.mapmoveInterval = window.setTimeout(function () {
                    that.mapObj.moveXY(-mapMoveSpeedX, -mapMoveSpeedY);
                }, 10);
            }
            // move left
            else {
                window.clearTimeout(this.mapmoveInterval);
                this.mapmoveInterval = window.setTimeout(function () {
                    that.mapObj.moveXY(-mapMoveSpeedX, 0);
                }, 10);
            }
        }
        // move right
        else if (this.infobox.offsetLeft < 10) {
            if (this.infobox.offsetLeft > 0) mapMoveSpeedX = 10 - this.infobox.offsetLeft;
            else if (mapMoveSpeedX < mapMoveMaxSpeed) mapMoveSpeedX++;
            // move right down
            if (this.infobox.offsetTop < 10) {
                if (this.infobox.offsetTop > 0) mapMoveSpeedY = 10 - this.infobox.offsetTop;
                else if (mapMoveSpeedY < mapMoveMaxSpeed) mapMoveSpeedY++;
                window.clearTimeout(this.mapmoveInterval);
                this.mapmoveInterval = window.setTimeout(function () {
                    that.mapObj.moveXY(mapMoveSpeedX, mapMoveSpeedY);
                }, 10);
            }
            // move right up
            else if (this.xy["y"] > (this.mapObj.size.height - 10)) {
                if (this.xy["y"] < this.mapObj.size.height) mapMoveSpeedY = 10 - (this.mapObj.size.height - this.xy["y"]);
                else if (mapMoveSpeedY < mapMoveMaxSpeed) mapMoveSpeedY++;
                window.clearTimeout(this.mapmoveInterval);
                this.mapmoveInterval = window.setTimeout(function () {
                    that.mapObj.moveXY(mapMoveSpeedX, -mapMoveSpeedY);
                }, 10);
            }
            // move right
            else {
                window.clearTimeout(this.mapmoveInterval);
                this.mapmoveInterval = window.setTimeout(function () {
                    that.mapObj.moveXY(mapMoveSpeedX, 0);
                }, 10);
            }
        }
        else {
            // move down
            if (offset.top < 10) {
                if (offset.top > 0) mapMoveSpeedY = 10 - offset.top;
                else if (mapMoveSpeedY < mapMoveMaxSpeed) mapMoveSpeedY++;
                window.clearTimeout(this.mapmoveInterval);
                this.mapmoveInterval = window.setTimeout(function () {
                    that.mapObj.moveXY(0, mapMoveSpeedY);
                }, 10);
            }
            // move up
            else if (this.xy["y"] > (this.mapObj.size.height - 10)) {
                if (this.xy["y"] < this.mapObj.size.height) mapMoveSpeedY = 10 - (this.mapObj.size.height - this.xy["y"]);
                else if (mapMoveSpeedY < mapMoveMaxSpeed) mapMoveSpeedY++;
                window.clearTimeout(this.mapmoveInterval);
                this.mapmoveInterval = window.setTimeout(function () {
                    that.mapObj.moveXY(0, -mapMoveSpeedY);
                }, 10);
            }
            // stop moving
            else {
                window.clearTimeout(this.mapmoveInterval);
                mapMoveSpeed = 1;
                this.opened = false;
            }
        }
    };

    /**
     * workaround for detecting a click on touch devices
     * original click event is suppressed by touchmove-handler of the map
     */
    this._clickdetectstart = function (evt) {
        if (evt.touches.length == 1) {
            this.clickDetectX = -1;
            this.clickDetectY = -1;
        }
    };
    this._clickdetectmove = function (evt) {
        if (evt.touches.length == 1) {
            this.clickDetectX = evt.touches[0].pageX;
            this.clickDetectY = evt.touches[0].pageY;
        }
    };
    this._clickdetectstop = function (evt) {
        if (evt.touches.length == 0) {
            if ((this.clickDetectX == -1) && (this.clickDetectY == -1)) {
                this.close();
            }
        }
    };

    // workaround for detecting a click on touch devices
    // original click event is suppressed by touchmove-handler of the map
    jsMaps.Native.Event.attach(this.closebutton, "touchstart", this._clickdetectstart, this, false);
    jsMaps.Native.Event.attach(this.closebutton, "touchmove", this._clickdetectmove, this, false);
    jsMaps.Native.Event.attach(this.closebutton, "touchend", this._clickdetectstop, this, false);
};

// embedded image for the close button
var close_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowOTgwMTE3NDA3MjA2ODExOERCQkRDOEYwREVGMEUzQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNzQ4NEUyM0MwQkMxMUUwOEM3M0MzRjlBNDlCNDU5OCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNzQ4NEUyMkMwQkMxMUUwOEM3M0MzRjlBNDlCNDU5OCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjA5ODAxMTc0MDcyMDY4MTE4REJCREM4RjBERUYwRTNBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjA5ODAxMTc0MDcyMDY4MTE4REJCREM4RjBERUYwRTNBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jr2YPQAAAUVJREFUeNpitLe3Z6AmYMIhzk+EXiFiDewF4pNALIHHMDkgPgPE0wgZ2AXERUCsDsQHcBgKMuwwECsCcSYQT8ZlYDsQlyLxYYZKI4kpQg2TQxLLAeIJ6AbCbEMHIEP3Qg1VwWIYDMRCzYAbeB+I3YD4Iw5Dj0ENk8Yi/xqInaFmoHj5FFTiI45wk8BhmAMQX8AVKWehhr4jItm8gBp2jVCyOYvHpXgNw5ewCYH/QPyd2IRtDI1ZfLlFEikt4jXQEmqYEBGulIOmU0VcBoIM247DZU+gMYov16AYCHLRLhyG3QFiC2gkvMAiLw01VAjZQFAyKcCi+CbUoKfQGMVl6CxYUkP28lwgTkHiX0MyDJsFMNAExWDAgmYTyFBmIM6HpsUXOFztDI08kPp6ZElGHCU2GxD/IqKAfUdswv5FRLLBmj0BAgwAom1FkjBGocAAAAAASUVORK5CYII=';
