jsMaps.Yandex = function(mapDomDocument) {};
jsMaps.Yandex.prototype = new jsMaps.Abstract();
jsMaps.Yandex.MapCenter = {lat: 0,lng: 0};
jsMaps.Yandex.MapZoom = 0;

/**
 * create the mal
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

    return new hooking;

};