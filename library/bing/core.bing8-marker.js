if (typeof jsMaps.Bing == 'undefined') {
    jsMaps.Bing = function(mapDomDocument) {};
    jsMaps.Bing.prototype = new jsMaps.Abstract();
}

jsMaps.Bing.ready(function () {
    /**
     * A simple class that defines a HTML pushpin.
     *
     * @param loc
     * @param html
     * @param anchor
     * @constructor
     * @param map
     * @param metadata
     */
    jsMaps.Bing.prototype.HtmlPushpin = function (loc, html, anchor, map, metadata) {
        this.location = loc;
        this.anchor = anchor;
        this.moveHandler = null;

        //A property for storing data relative to the pushpin.
        this.metadata = metadata;

        //Create the pushpins DOM element.
        this._element = document.createElement('div');
        this._element.innerHTML = html;
        this._element.style.position = 'absolute';
        this._element.style.cursor = 'pointer';
        this._element.style.display = 'inline-block';
        this._element.moving = false;

        this._element.style['-webkit-touch-callout'] = 'none';
        this._element.style['-webkit-user-select']   = 'none';
        this._element.style['-khtml-user-select']    = 'none';
        this._element.style['-moz-user-select']      = 'none';
        this._element.style['-ms-user-select']       = 'none';
        this._element.style['user-select']           = 'none';

        map.getRootElement().style['-webkit-touch-callout'] = 'none';
        map.getRootElement().style['-webkit-user-select']   = 'none';
        map.getRootElement().style['-khtml-user-select']    = 'none';
        map.getRootElement().style['-moz-user-select']      = 'none';
        map.getRootElement().style['-ms-user-select']       = 'none';
        map.getRootElement().style['user-select']           = 'none';

        if (this.metadata.title != null) this._element.setAttribute('title',this.metadata.title);
        if (this.metadata.zIndex != null) this._element.style.zIndex = this.metadata.zIndex;

        var that = this;

        this.dispatchEvent = function (eventName) {
            var eventObj = new CustomEvent(eventName, {detail: {}});
            this._element.dispatchEvent(eventObj);
        };

        if (this._element.eventAttached != true) {
            this._element.eventAttached = true;

            Microsoft.Maps.Events.addHandler(map,
                'mouseout',
                function () {
                    Microsoft.Maps.Events.invoke(map,'mouseup');
                }
            );

            this._element.addEventListener("mousedown", function (e) {
                if (that.metadata.draggable == false) return;
                this.style.cursor = 'move';
                map.setOptions({disablePanning: true});
                that.origin = e;
                this.moving = true;

                that.dispatchEvent(jsMaps.api.supported_events.dragstart);

                that.moveHandler = Microsoft.Maps.Events.addHandler(map,
                    'mousemove',
                    function (ep) {
                        if (that.metadata.draggable == false) return;
                        if (that._element.moving != true) return;
                        ep.clientX = ep.pageX;
                        ep.clientY = ep.pageY;

                        that.dispatchEvent(jsMaps.api.supported_events.drag);

                        var origin = that.origin,
                            left = origin.clientX - ep.clientX,
                            top = origin.clientY - ep.clientY,
                            pos = map.tryLocationToPixel(new Microsoft.Maps.Location(that.location.latitude, that.location.longitude), Microsoft.Maps.PixelReference.control);

                        if (pos) {
                            var newX = pos.x - left;
                            var newY = pos.y - top;

                            //Offset position to account for anchor.
                            newX -= that.anchor.x;
                            newY -= that.anchor.y;

                            var latLng = map.tryPixelToLocation(new Microsoft.Maps.Point(newX, newY), Microsoft.Maps.PixelReference.control);
                            that.location = latLng;

                            that.origin = ep;
                            that.position = latLng;

                            //Update the position of the pushpin element.
                            that._element.style.left = newX + 'px';
                            that._element.style.top = newY + 'px';
                        }
                    }
                );
            },false);

            this._element.addEventListener("mouseup", function (e) {
                Microsoft.Maps.Events.invoke(map,'mouseup');
            },false);

            Microsoft.Maps.Events.addHandler (map,'mouseup',function () {
                map.setOptions({disablePanning: false});
                that._element.style.cursor = 'pointer';
                that._element.moving = false;

                that.dispatchEvent(jsMaps.api.supported_events.dragend);
                that.dispatchEvent(jsMaps.api.additional_events.position_changed);

                Microsoft.Maps.Events.removeHandler(that.moveHandler);
            });
        }

        this.remove = function() {
            if (this._element) {
                this._element.parentNode.removeChild(this._element);
                this._element = null;
            }
        };

        this.getLocation = function() {
            return this.location;
        };

        this.setLocation = function(latlng) {
            var topLeft = map.tryLocationToPixel(latlng, Microsoft.Maps.PixelReference.control);

            this.location = latlng;

            //Offset position to account for anchor.
            topLeft.x -= this.anchor.x;
            topLeft.y -= this.anchor.y;

            //Update the position of the pushpin element.
            this._element.style.left = topLeft.x + 'px';
            this._element.style.top = topLeft.y + 'px';

            this.dispatchEvent(jsMaps.api.additional_events.position_changed);
        };

        this.setOptions = function(variable) {
            if (typeof variable.visible != 'undefined') {
                this._element.style.display = ((variable.visible) ? 'inline-block': 'none');
            }

            if (typeof variable.draggable != 'undefined') {
                this.metadata.draggable = variable.draggable;
            }

            if (typeof variable.zIndex != 'undefined') {
                this.metadata.zIndex = variable.zIndex;
                this._element.style.zIndex = variable.zIndex;
            }
        };

        this.getVisible = function() {
            return ((this._element.style.display == 'inline-block'));
        };

        this.getIcon = function () {
            return '';
        };

        this.setIcon = function (icon) {
        };

        this.getZIndex = function () {
            return this._element.style.zIndex;
        };
    };

    /**
     * A reusable class for overlaying HTML elements as pushpins on the map.
     *
     * Based on: https://msdn.microsoft.com/en-us/library/mt762877.aspx
     * @constructor
     */
    jsMaps.Bing.prototype.HtmlPushpinLayer = function () {
        //Store the pushpins.
        this._pushpins = null;

        //A variable to store the viewchange event handler id.
        this.viewChangeEventHandler = null;

        //A variable to store a reference to the container for the HTML pushpins.
        this.container = null;

        //Method to define the pushpins to display in the layer.
        this.setPushpins = function (pushpins) {
            //Store the pushpin data.
            this._pushpins = pushpins;

            //Clear the container.
            if (this.container) {
                this.container.innerHTML = '';

                if (pushpins) {
                    //Add the pushpins to the container.
                    for (var i = 0, len = pushpins.length; i < len; i++) {
                        this.container.appendChild(pushpins[i]._element);
                    }
                }
            }

            this.updatePositions();
        };

        //A function that updates the position of a HTML pushpin element on the map.
        this._updatePushpinPosition = function (pin) {
            if (this.getMap()) {
                //Calculate the pixel location of the pushpin.
                var topLeft = this.getMap().tryLocationToPixel(pin.location, Microsoft.Maps.PixelReference.control);

                //Offset position to account for anchor.
                topLeft.x -= pin.anchor.x;
                topLeft.y -= pin.anchor.y;

                //Update the position of the pushpin element.
                pin._element.style.left = topLeft.x + 'px';
                pin._element.style.top = topLeft.y + 'px';
            }
        };

        //A function that updates the positions of all HTML pushpins in the layer.
        this.updatePositions = function () {
            if (this._pushpins) {
                for (var i = 0, len = this._pushpins.length; i < len; i++) {
                    this._updatePushpinPosition(this._pushpins[i]);
                }
            }
        };
    };

    //Define a custom overlay class that inherts from the CustomOverlay class.
    jsMaps.Bing.prototype.HtmlPushpinLayer.prototype = new Microsoft.Maps.CustomOverlay({beneathLabels: false});

    //Implement the onAdd method to set up DOM elements, and use setHtmlElement to bind it with the overlay.
    jsMaps.Bing.prototype.HtmlPushpinLayer.prototype.onAdd = function () {
        //Create a div that will hold the pushpins.
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.left = '0px';
        this.container.style.top = '0px';

        this.setHtmlElement(this.container);
    };

    //Implement the onLoad method to perform custom operations after adding the overlay to the map.
    jsMaps.Bing.prototype.HtmlPushpinLayer.prototype.onLoad = function () {
        var self = this;

        //Reset pushpins as overlay is now loaded.
        self.setPushpins(self._pushpins);

        //Update the position of the pushpin when the view changes.
        this.viewChangeEventHandler = Microsoft.Maps.Events.addHandler(self.getMap(), 'viewchange', function () {
            self.updatePositions();
        });
    };

    jsMaps.Bing.prototype.HtmlPushpinLayer.prototype.onRemove = function () {
        //Remove the event handler that is attached to the map.
        Microsoft.Maps.Events.removeHandler(this.viewChangeEventHandler);
    };
});

/**
 * Generate markers
 *
 * @param {jsMaps.MapStructure} mapObj
 * @param {jsMaps.MarkerOptions} parameters
 */
jsMaps.Bing.prototype.marker = function (mapObj,parameters) {
    var options = {width: 'auto'};

    if (parameters.title != null) options.title = parameters.title;
    if (parameters.zIndex != null) options.zIndex = parameters.zIndex;
    if (parameters.icon != null) options.icon = parameters.icon;
    if (parameters.draggable != null) options.draggable = parameters.draggable;

    var html;

    var hooking = function () {};
    hooking.prototype = new jsMaps.MarkerStructure();
    hooking.prototype.__className = 'marker';
    hooking.prototype.defaultOptions = parameters;

    if (parameters.html != null && typeof parameters.html == 'object'
        || parameters.html != null && typeof parameters.html == 'string') {
        hooking.prototype.__markerType = 'domMarker';
    } else {
        hooking.prototype.__markerType = 'marker';
    }

    jsMaps.Bing.ready(function () {
        var map = mapObj.object;
        var marker;
        var layer;

        if (parameters.html != null && typeof parameters.html == 'object') {
            marker = new jsMaps.Bing.prototype.HtmlPushpin(
                new Microsoft.Maps.Location(parameters.position.lat, parameters.position.lng),
                '<div>' + parameters.html.innerHTML + '</div>',
                new Microsoft.Maps.Point(0, 0),
                map,
                parameters
            );

            layer = new jsMaps.Bing.prototype.HtmlPushpinLayer();
            layer.setPushpins([marker]);
            map.layers.insert(layer);
        } else if (parameters.html != null && typeof parameters.html == 'string') {
            marker = new jsMaps.Bing.prototype.HtmlPushpin(
                new Microsoft.Maps.Location(parameters.position.lat, parameters.position.lng),
                '<div>' + parameters.html + '</div>',
                new Microsoft.Maps.Point(0, 0),
                map,
                parameters
            );

            layer = new jsMaps.Bing.prototype.HtmlPushpinLayer();
            layer.setPushpins([marker]);
            map.layers.insert(layer);
        } else {
            marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(parameters.position.lat, parameters.position.lng), options);
            map.entities.push(marker);
        }

        hooking.prototype.object = marker;
        hooking.prototype.map = map;
    }, this);

    /**
     *
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.getPosition = function () {
        if (this.object == null) {
            return {lat: this.defaultLocation.position.lat, lng: this.defaultLocation.position.lng};
        }

        var pos = this.object.getLocation();
        return {lat: pos.latitude, lng: pos.longitude}
    };

    hooking.prototype.setPosition = function (lat, lng) {
        jsMaps.Bing.ready(function () {
            this.object.setLocation(new Microsoft.Maps.Location(lat, lng));
        }, this);
    };

    hooking.prototype.getVisible = function () {
        if (this.object == null) {
            return true;
        }

        return this.object.getVisible();
    };

    hooking.prototype.setVisible = function (variable) {
        jsMaps.Bing.ready(function () {
            this.object.setOptions({visible: variable});
        }, this);
    };

    hooking.prototype.getIcon = function () {
        if (this.object == null) {
            return this.defaultOptions.icon;
        }

        return this.object.getIcon();
    };

    hooking.prototype.setIcon = function (icon) {
        jsMaps.Bing.ready(function () {
            this.object.setOptions({icon: icon});
        }, this);
    };

    hooking.prototype.getZIndex = function () {
        if (this.object == null) {
            return this.defaultOptions.zIndex;
        }

        return this.object.getZIndex();
    };

    hooking.prototype.setZIndex = function (number) {
        jsMaps.Bing.ready(function () {
            this.object.setOptions({zIndex: number});
        }, this);
    };

    hooking.prototype.setDraggable = function (flag) {
        jsMaps.Bing.ready(function () {
            this.object.setOptions({draggable: flag});
        }, this);
    };

    hooking.prototype.remove = function () {
        jsMaps.Bing.ready(function () {
            if (this.__markerType == 'domMarker') {
                this.object.remove();
            } else {
                this.map.entities.remove(this.object);
            }
        }, this);
    };

    return new hooking();
};