jsMaps.Yandex = function(mapDomDocument) {};
jsMaps.Yandex.prototype = new jsMaps.Abstract();
jsMaps.Yandex.MapCenter = {lat: 0,lng: 0};
jsMaps.Yandex.MapZoom = 0;

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
    ymaps.ready(function () {
        var mapControls = [];
        if (options.zoom_control == true) mapControls.push('zoomControl');
        if (options.map_type == true) mapControls.push('typeSelector');
        if (options.scale_control == true) mapControls.push('rulerControl');

        var behaviors = ["drag", "dblClickZoom","multiTouch","ruler"];
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

    hooking.prototype.setCenter = function (lat, lng) {
        ymaps.ready(function () {
            this.object.setCenter([lat,lng]);
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