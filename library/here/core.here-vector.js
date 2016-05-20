/**
 *
 * @param {jsMaps.VectorStyle} options
 * @constructor
 */
jsMaps.Here.VectorStyle =  function (options) {
    var opts = {};
    var currentColor = this.object.getStyle().strokeColor;

    if (options.strokeColor != '' || options.strokeOpacity != false) {

        currentColor = currentColor.replace('rgba','');
        currentColor = currentColor.replace('(','');
        currentColor = currentColor.replace(')','');
        currentColor = currentColor.split(',');

        var _currentColor = jsMaps.convertRgb(parseInt(currentColor[0]),parseInt(currentColor[1]),parseInt(currentColor[2]));

        var color,tempColor;

        if (options.strokeColor!='' && options.strokeOpacity != '') {
            color = jsMaps.convertHex(options.strokeColor,options.strokeOpacity*100);
        } else if (options.strokeColor!='' && options.strokeOpacity == '') {
            color = jsMaps.convertHex(options.strokeColor,parseFloat(currentColor[3])*100);
        } else if (options.strokeColor=='' && options.strokeOpacity != '') {
            color = jsMaps.convertHex(_currentColor,parseInt(options.strokeOpacity)*100);
        }

        opts.strokeColor = color;
    } else {
        opts.strokeColor = currentColor;
    }

    if (options.fillColor != '' || options.fillOpacity != false) {
        currentColor = this.object.getStyle().fillColor;

        currentColor = currentColor.replace('rgba','');
        currentColor = currentColor.replace('(','');
        currentColor = currentColor.replace(')','');
        currentColor = currentColor.split(',');

        _currentColor = jsMaps.convertRgb(parseInt(currentColor[0]),parseInt(currentColor[1]),parseInt(currentColor[2]));

        if (options.fillColor!='' && options.fillOpacity != '') {
            color = jsMaps.convertHex(options.fillColor,options.fillOpacity*100);
        } else if (options.fillColor!='' && options.fillOpacity == '') {
            color = jsMaps.convertHex(options.fillColor,parseFloat(currentColor[3])*100);
        } else if (options.fillColor=='' && options.fillOpacity != '') {
            color = jsMaps.convertHex(_currentColor,parseInt(options.fillOpacity)*100);
        }

        opts.fillColor = color;
    } else {
        opts.fillColor = this.object.getStyle().fillColor;
    }

    if (options.strokeWeight != '') {
        opts.lineWidth = options.strokeWeight;
    } else {
        opts.lineWidth = this.object.getStyle().lineWidth;
    }

    if (options.zIndex != '') this.object.setZIndex(options.zIndex);

    if (typeof opts.lineWidth != 'undefined' || typeof opts.strokeColor != 'undefined') {
        this.object.setStyle(opts);
    }
};


jsMaps.Here.VectorGetStyle =  function () {
    var return_values = new jsMaps.VectorStyle();

    var currentStyle = this.object.getStyle();

    if (typeof this.vector_type != 'line') {
        var fillColor = currentStyle.fillColor;

        fillColor = fillColor.replace('rgba','');
        fillColor = fillColor.replace('(','');
        fillColor = fillColor.replace(')','');
        fillColor = fillColor.split(',');

        return_values.fillColor     = jsMaps.convertRgb(parseInt(fillColor[0]),parseInt(fillColor[1]),parseInt(fillColor[2]));
        return_values.fillOpacity   = parseFloat(fillColor[3]);
    }

    var strokeColor = currentStyle.strokeColor;

    strokeColor = strokeColor.replace('rgba','');
    strokeColor = strokeColor.replace('(','');
    strokeColor = strokeColor.replace(')','');
    strokeColor = strokeColor.split(',');

    return_values.strokeColor   = jsMaps.convertRgb(parseInt(strokeColor[0]),parseInt(strokeColor[1]),parseInt(strokeColor[2]));
    return_values.strokeOpacity = parseFloat(strokeColor[3]);
    return_values.strokeWeight  = currentStyle.lineWidth;
    return_values.zIndex        = this.object.getZIndex();

    return return_values;
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


    var hooking = function () {};
    hooking.prototype = new jsMaps.PolyLineStructure();
    hooking.prototype.markers = markers;
    hooking.prototype.object = PolyLine;
    hooking.prototype.map = map;
    hooking.prototype.vector_type = 'polyLine';
    hooking.prototype.draggable = parameters.draggable;
    hooking.prototype.editable = parameters.editable;

    hooking.prototype.getEditable = function () {
        return this.editable;
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
        this.draggable = draggable;
    };

    hooking.prototype.setEditable = function (editable) {
        this.editable = editable;

        if (editable == false) {
            jsMaps.removeVectorMarker(this);
        } else {
            parameters.paths = this.getPath();
            new jsMaps.editableVector(this,map,parameters,'polyline');
        }
    };

    hooking.prototype.setPath = function (pathArray,isReset) {
        this.object.setStrip(jsMaps.Here.ReturnStrip(pathArray));

        if (typeof isReset == 'undefined') {
            parameters.paths = this.getPath();
            jsMaps.removeVectorMarker(this);

            new jsMaps.editableVector(this,map,parameters,'polyline');
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

        this.map = map;

        originMap.removeObject(this.object);
        map.object.map.addObject(this.object);

        parameters.paths = this.getPath();
        new jsMaps.editableVector(this,map,parameters,'polyline');
    };

    hooking.prototype.setVisible = function (visible) {
        if (visible) {
            parameters.paths = this.getPath();
            new jsMaps.editableVector(this,map,parameters,'polyline');
        } else {
            jsMaps.removeVectorMarker(this);
        }

        this.object.setVisibility(visible);
    };

    hooking.prototype.removeLine = function () {
        var mapObjectTmp = this.object.getRootGroup();

        jsMaps.removeVectorMarker(this);

        mapObjectTmp.removeObject(this.object);
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Here.VectorStyle.bind(object);
    object.getStyle = jsMaps.Here.VectorGetStyle.bind(object);

    parameters.paths = parameters.path;
    new jsMaps.editableVector(object,map,parameters,'polyline');
    new jsMaps.draggableVector(object,map,parameters,'polyline');

    return object;
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
    hooking.prototype.object = Polygon;
    hooking.prototype.map = map;
    hooking.prototype.draggable = parameters.draggable;
    hooking.prototype.editable = parameters.editable;
    hooking.prototype.vector_type = 'polygon';

    hooking.prototype.getEditable = function () {
        return this.editable;
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
        this.draggable = draggable;
    };

    hooking.prototype.setEditable = function (editable) {
        this.editable = editable;

        if (editable == false) {
            jsMaps.removeVectorMarker(this);
        } else {
            parameters.paths = this.getPath();
            new jsMaps.editableVector(this,map,parameters,'polygon');
        }
    };

    hooking.prototype.setPath = function (pathArray,isReset) {
        this.object.setStrip(jsMaps.Here.ReturnStrip(pathArray));

        if (typeof isReset == 'undefined') {
            parameters.paths = this.getPath();
            jsMaps.removeVectorMarker(this);

            new jsMaps.editableVector(this,map,parameters,'polygon');
        }
    };

    /**
     * @param {jsMaps.MapStructure} map
     * @returns {{lat: *, lng: *}}
     */
    hooking.prototype.setMap = function (map) {
        var originMap =this.object.getRootGroup();

        this.map = map;

        originMap.removeObject(this.object);
        map.object.map.addObject(this.object);

        parameters.paths = this.getPath();
        new jsMaps.editableVector(this,map,parameters,'polygon');
    };

    hooking.prototype.setVisible = function (visible) {
        if (visible) {
            parameters.paths = this.getPath();
            new jsMaps.editableVector(this,map,parameters,'polygon');
        } else {
            jsMaps.removeVectorMarker(this);
        }

        this.object.setVisibility(visible);
    };

    hooking.prototype.removePolyGon = function () {
        var mapObjectTmp = this.object.getRootGroup();

        jsMaps.removeVectorMarker(this);

        mapObjectTmp.removeObject(this.object);
    };

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Here.VectorStyle.bind(object);
    object.getStyle = jsMaps.Here.VectorGetStyle.bind(object);

    new jsMaps.editableVector(object,map,parameters,'polygon');
    new jsMaps.draggableVector(object,map,parameters,'polygon');


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
    hooking.prototype.map = map;
    hooking.prototype.draggable = parameters.draggable;
    hooking.prototype.editable = parameters.editable;
    hooking.prototype.vector_type = 'circle';

    hooking.prototype.getBounds = function () {
        return jsMaps.Here.prototype.bounds(this.object);
    };

    hooking.prototype.getCenter = function () {
        var center = this.object.getCenter();
        return {lat: center.lat,lng: center.lng};
    };

    hooking.prototype.getDraggable = function () {
        return this.draggable;
    };

    hooking.prototype.getEditable = function () {
        return this.editable;
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
        this.draggable = draggable;
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

    var object = new hooking();

    /**
     * @param {jsMaps.VectorStyle} options
     */
    object._setStyle = jsMaps.Here.VectorStyle.bind(object);
    object.getStyle = jsMaps.Here.VectorGetStyle.bind(object);

    new jsMaps.draggableVector(object,map,parameters,'circle');
    new jsMaps.editableVector(object,map,parameters,'circle');

    return object;
};