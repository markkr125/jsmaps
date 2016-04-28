
/**
 * Taken From leaflet js
 *
 * http://leafletjs.com/
 *
 * @type {{scaleDiv: null, mapObject: null, init: Function, _update: Function, _updateScale: Function, _getRoundNum: Function, _updateScales: Function, _updateMetric: Function, _updateImperial: Function}}
 */
jsMaps.Native.ScaleUI = {
    /**
     * @type  {HTMLElement|boolean}
     */
    scaleMetricDiv: false,

    /**
     * @type  {HTMLElement|boolean}
     */
    scaleImperialDiv: false,
    mapObject: null,
    options: {
        metric: true,
        imperial: true,
        maxWidth: 100
    },
    init: function (mapObject) {
        if (!this.scaleMetricDiv) {
            this.mapObject = mapObject;


            if (this.options.metric) this.scaleMetricDiv = jsMaps.Native.CreateDiv(this.mapObject.map.parentNode,'metric-scale');
            if (this.options.imperial) this.scaleImperialDiv = jsMaps.Native.CreateDiv(this.mapObject.map.parentNode,'metric-scale imperial-scale');
        }
    },

    clear: function () {
        if (this.scaleMetricDiv !== false) {
            this.mapObject.map.parentNode.removeChild(this.scaleMetricDiv);
            this.scaleMetricDiv = false;
        }

        if (this.scaleImperialDiv !== false) {
            this.mapObject.map.parentNode.removeChild(this.scaleImperialDiv);
            this.scaleImperialDiv = false;
        }
    },

    _update: function () {
        var y = this.mapObject.map.parentNode.offsetHeight / 2;

        var maxMeters = jsMaps.CRSEarth.distance(
            this.mapObject.XYTolatlng(0, y),
            this.mapObject.XYTolatlng(100, y));

        this._updateScales(maxMeters);
    },

    _updateScale: function (scaleDiv, text, ratio) {
        scaleDiv.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
        scaleDiv.innerHTML = text;
    },

    _getRoundNum: function (num) {
        var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
            d = num / pow10;

        d = d >= 10 ? 10 :
            d >= 5 ? 5 :
                d >= 3 ? 3 :
                    d >= 2 ? 2 : 1;

        return pow10 * d;
    },

    _updateScales: function (maxMeters) {
        if (this.options.metric && maxMeters) {
            this._updateMetric(maxMeters);
        }

        if (this.options.imperial && maxMeters) {
            this._updateImperial(maxMeters);
        }
    },

    _updateMetric: function (maxMeters) {
        var meters = this._getRoundNum(maxMeters),
            label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

        this._updateScale(this.scaleMetricDiv, label, meters / maxMeters);
    },

    _updateImperial: function (maxMeters) {
        var maxFeet = maxMeters * 3.2808399,
            maxMiles, miles, feet;

        if (maxFeet > 5280) {
            maxMiles = maxFeet / 5280;
            miles = this._getRoundNum(maxMiles);
            this._updateScale(this.scaleImperialDiv, miles + ' mi', miles / maxMiles);

        } else {
            feet = this._getRoundNum(maxFeet);
            this._updateScale(this.scaleImperialDiv, feet + ' ft', feet / maxFeet);
        }
    }
};

/**
 *
 * @param {jsMaps.Native} themap
 * @param {jsMaps.Native.Tiles} tilesLayer
 * @constructor
 */
jsMaps.Native.LayersUI = function (themap,tilesLayer) {
    this.tilesUi = jsMaps.Native.CreateDiv(themap.mapParent,'tiles-ui');
    this.tilesLayer = tilesLayer;
    this.theMap = themap;

    this.init = function (themap) {
        var LayerImage = jsMaps.Native.CreateDiv(this.tilesUi,'tiles-ui-img');
        LayerImage.innerHTML = '<img border="0" src="data:image/png;base64,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" />';

        for (var i in tilesLayer.Layers) {
            if (tilesLayer.Layers.hasOwnProperty(i) == false) continue;

            var layer = tilesLayer.Layers[i];

            var iDiv = jsMaps.Native.CreateDiv(this.tilesUi,'tiles-ui-item');
            iDiv.innerHTML = '<label><input type="radio"'+((themap.selectedTileLayer == i) ? ' checked="checked" ': ' ')+'name="layer-'+themap.MapNumber+'" value="'+i+'" /><span>'+layer.layerName+'</span></label>';

            jsMaps.Native.Event.attach(iDiv, "mousedown", this._down, this, false);
            jsMaps.Native.Event.attach(iDiv, "touchstart", this._down, this, false);
        }

        jsMaps.Native.Event.attach(LayerImage, "touchstart", function () {
            var element = this.tilesUi;

            if (element.className.indexOf('tiles-ui-hover') == -1) {
                element.className = element.className.replace(" tiles-ui-hover","");
                element.className = element.className + " tiles-ui-hover";
            } else {
                element.className = element.className.replace(" tiles-ui-hover","");
            }

        }, this, false);

    };

    this.clear = function () {
        this.tilesUi.parentNode.removeChild(this.tilesUi);
    };

    this._down = function(evt) {
        this._cancelEvent(evt);
        this._stopEventPropagation(evt);

        // There must be a better way to do this...
        var target = (evt.target) ? evt.target: evt.srcElement;
        var parent = target.parentNode;


        var radio = parent.querySelector('input[type="radio"]');
        radio.checked = true;

        var mapValue = radio.value;


        this.theMap.tiles(this.tilesLayer.Layers[mapValue]);

        this.theMap.centerAndZoom(this.theMap.getCenter(),this.theMap.zoom());
        this.theMap.mapCopyright();

        if (this.theMap.uiContainer != false) {
            this.theMap.mapParent.removeChild(this.theMap.uiContainer);
            this.theMap.addOverlay(new jsMaps.Native.ZoomUI(this.theMap));
        }

        jsMaps.Native.Event.trigger(this.theMap.mapParent,jsMaps.api.supported_events.maptypeid_changed);
    };

    this._cancelEvent = function(evt) {
        evt.cancelBubble = true;
        if (evt.stopPropagation)
            evt.stopPropagation();
    };

    /**
     * Prevents further propagation of the current jsMaps.Native.Event.
     */
    this._stopEventPropagation = function(evt) {
        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            evt.returnValue = false; // The IE way
        }
    };

    //called by maplib on every map change
    this.render = function () {
    };
};

/**
 * @param {jsMaps.Native} themap
 * @constructor
 */
jsMaps.Native.ZoomUI = function (themap) {
    themap.uiContainer = jsMaps.Native.CreateDiv(themap.mapParent,'zoom-ui');
    this.uiContainer = themap.uiContainer;
    this.zoomBar = jsMaps.Native.CreateDiv(this.uiContainer,'zoom-ui-bar');
    this.scrollHandle = jsMaps.Native.CreateDiv(this.zoomBar,'zoom-ui-handle');

    this.addZoom = jsMaps.Native.CreateDiv(this.uiContainer,'zoom-ui-handle zoom-add');
    this.addZoom.innerHTML = "+";

    this.minusZoom = jsMaps.Native.CreateDiv(this.uiContainer,'zoom-ui-handle zoom-minus');
    this.minusZoom.innerHTML = "-";

    this.map = themap;
    this.maxzoom = this.map.tileSource.maxzoom;
    this.steps = this.zoomBar.offsetHeight/this.maxzoom;

    this.scrollHandle.style.height = this.steps+'px';

    /**
     * Cancels the event if it is cancelable,
     * without stopping further propagation of the jsMaps.Native.Event.
     */
    this.moving=false;

    this.clear = function () {
        this.uiContainer.parentNode.removeChild(this.uiContainer);
    };

    this._zoomLevels = function () {
        var zoomLevels = this.map.tileSource.maxzoom - this.map.tileSource.minzoom + 1;
        return zoomLevels < Infinity ? zoomLevels : 0;
    };

    var height = parseFloat(this.steps*this._zoomLevels());
    this.zoomBar.style.height = (height)+"px";

    var totalValue = parseInt((height / this.uiContainer.offsetHeight) * 100);

    if (totalValue.toFixed(0) > 80) {
        this.zoomBar.style.height = "2px";
        this.scrollHandle.style.display = "none";
    } else {
        this.scrollHandle.style.display = "";
    }

    this._cancelEvent = function(evt) {
        evt.cancelBubble = true;
        if (evt.stopPropagation)
            evt.stopPropagation();
    };

    /**
     * Prevents further propagation of the current jsMaps.Native.Event.
     */
    this._stopEventPropagation = function(evt) {
        if (evt.preventDefault) {
            evt.preventDefault(); // The W3C DOM way
        } else {
            evt.returnValue = false; // The IE way
        }
    };

    /**
     * Calculate Z if Y is given. (also use in testcase)
     */
    this._calcZFromY = function(y) {
        return this.maxzoom - y / this.steps;
    };
    /**
     * Zoom
     */
    this._zoom = function(evt) {
        var y = ((evt.type == "touchstart") || (evt.type == "touchmove")) ? this.map.pageY(evt.touches[0]) + this.dy: this.map.pageY(evt) + this.dy;
        this.map.zoomActive  = true;

        var zoom = (jsMaps.Native.Browser.ielt9) ? Math.round(this._calcZFromY(y)) : this._calcZFromY(y);

        this.map.centerAndZoom(this.map.center(),zoom);
    };

    /**
     * Mousedown or Touchstart
     */
    this.dy=0;
    this._down = function(evt) {
        var target= (evt.target) ? evt.target: evt.srcElement;

        this._cancelEvent(evt);
        this._touchActive(evt);

        this.moving = true;
        if(target==this.scrollHandle){
            var PageY = (typeof evt.touches!= 'undefined' && evt.touches.length == 1) ?  evt.touches[0].pageY : this.map.pageY(evt);
            this.dy=this.scrollHandle.offsetTop  - PageY +this.steps;
       }else{
            this.dy=0;
        }
        this.map.wheeling = true;
        this._zoom(evt);
        this._stopEventPropagation(evt);
    };
    /**
     * Called while scrolling and Touchmove
     */
    this._move = function(evt) {
        this._cancelEvent(evt);

        if (this.moving) {
            this._zoom(evt);
            this.render();
            this._stopEventPropagation(evt);
        }
    };
    /**
     * Mouseup or Touchend
     */
    this._up = function(evt) {
        this._cancelEvent(evt);
        this._touchDisable(evt);

        this.moving = false;

        this._stopEventPropagation(evt);
    };

    /**
     * @returns {{x: *, y: string[]}}
     * @private
     */
    this._center = function () {
        var center =  this.map.latlngToXY(this.map.getCenter());
        return {x :center['x'], y: center['y']}
    };

    this._touchActive = function (evt) {
        if (typeof evt.touches!= 'undefined' && evt.touches.length == 1) {
            var element = (evt.target) ? evt.target: evt.srcElement;

            element.className = element.className.replace(" zoom-hover zoom-active","");
            element.className = element.className + " zoom-hover zoom-active";
        }
    };

    this._touchDisable = function (evt) {
        this._cancelEvent(evt);

        var element = (evt.target) ? evt.target: evt.srcElement;

        if (typeof evt.touches!= 'undefined') {
            if (typeof element.className != 'undefined') {
                var classList = element.className;
                element.className = classList.replace(" zoom-hover zoom-active","");
            }
        }
    };

    this._clickAdd = function(evt) {
        this._cancelEvent(evt);
        this._touchActive(evt);

        var center = this._center();
        this.map.discretZoom(1, center.x, center.y);

        this._stopEventPropagation(evt);
    };

    this._clickMinus = function(evt) {
        this._cancelEvent(evt);
        this._touchActive(evt);

        var center = this._center();
        this.map.discretZoom(-1, center.x, center.y);

        this._stopEventPropagation(evt);
    };

    this.init = function (themap) {
        this.themap = themap;
        var w = (navigator.userAgent.indexOf("MSIE") != -1) ? themap.mapParent: window;

        jsMaps.Native.Event.attach(this.uiContainer, "mousedown", this._down, this, false);
        jsMaps.Native.Event.attach(w, "mousemove", this._move, this, false);
        jsMaps.Native.Event.attach(w, "mouseup", this._up, this, false);

        jsMaps.Native.Event.attach(this.addZoom, "mousedown", this._clickAdd, this, false);
        jsMaps.Native.Event.attach(this.minusZoom, "mousedown", this._clickMinus, this, false);

        jsMaps.Native.Event.attach(this.addZoom, "touchstart", this._clickAdd, this, false);
        jsMaps.Native.Event.attach(this.minusZoom, "touchstart", this._clickMinus, this, false);
        jsMaps.Native.Event.attach(this.addZoom, "touchend", this._touchDisable, this, false);
        jsMaps.Native.Event.attach(this.minusZoom, "touchend", this._touchDisable, this, false);

        jsMaps.Native.Event.attach(this.zoomBar, "touchstart", this._down, this, false);
        jsMaps.Native.Event.attach(this.zoomBar, "touchmove", this._move, this, false);
        jsMaps.Native.Event.attach(this.zoomBar, "touchend", this._up, this, false);
    };

    //called by maplib on every map change
    this.render = function () {
        if (this.themap.zoom() == undefined) return;

        var top = parseFloat((parseFloat(this.maxzoom) - parseFloat(this.themap.zoom())) * parseFloat(this.steps));
        this.scrollHandle.style.top = parseFloat(top) + "px";
    };
};