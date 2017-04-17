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

    return new hooking();
};