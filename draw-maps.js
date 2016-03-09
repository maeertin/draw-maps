;(function(window, document, factory) {
	if (typeof define === 'function' && define.amd) {

		// AMD. Register as an anonymous module.
		define([], factory);

	} else if (typeof exports === 'object') {

		// Node/CommonJS
		module.exports = factory();

	} else {

		// Browser globals
		window.drawMaps = factory();
	}

})(window, document, function() {

 	/**
	 * @class The Draw Maps.
	 *
	 * @param {Selector} - The element selector
	 * @param {Object} [options] - The options
	 */
	function drawMaps(element, options) {
		this.options = this.extend({}, this.defaults, options);

		this.element = element;
		this.xmlns   = 'http://www.w3.org/2000/svg';

		this.svg       = null;
		this.polygon   = null;
		this.isDrawing = false;
		this.coords    = [];

		this.initialize();
	}

	/**
	 * Default options
	 */
	drawMaps.prototype.defaults = {
		wrapImages  : true,
		svgClass    : 'drawMaps-map',
		regretKey   : 'metaKey',
		closeKey    : 'shiftKey',
		resetKey    : 'altKey',
		fillColor   : 'rgba(255, 0, 0, 0.3)',
		strokeColor : 'rgba(255, 0, 0, 0.5)',
		strokeWidth : 1
	};

	/**
	 * Allows deep extending of objects
	 */
	drawMaps.prototype.extend = function(out) {
		out = out || {};

		for (var i = 1; i < arguments.length; i++) {
			var obj = arguments[i];

			if (!obj) continue;

			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (typeof obj[key] === 'object')
						out[key] = deepExtend(out[key], obj[key]);
					else
						out[key] = obj[key];
				}
			}
		}

		return out;
	};

	/**
	 * Get the current coordinates of the element relative to the
	 * document
	 */
	drawMaps.prototype.getElementOffset = function(element) {
		var rect       = element.getBoundingClientRect();
		var docElement = document.documentElement;

		return {
			top  : rect.top + window.pageYOffset - docElement.clientTop,
			left : rect.left + window.pageXOffset - docElement.clientLeft
		}
	};

	/**
	 * Get the current position of the cursor relative to the element
	 */
	drawMaps.prototype.getMousePosition = function(event) {
		var offset = this.getElementOffset(this.element);

		return {
			x : Math.round(event.pageX - offset.left),
			y : Math.round(event.pageY - offset.top)
		}
	};

	/**
	 * Wraps the target element with a relative parent
	 */
	drawMaps.prototype.injectWrapper = function() {
		var el      = this.element;
		var wrapper = document.createElement('div');

		wrapper.style.display  = 'inline-block';
		wrapper.style.position = 'relative';

		el.parentNode.insertBefore(wrapper, el);
		el.parentNode.removeChild(el);
		wrapper.appendChild(el);
	};

	/**
	 * Injects a svg element to hold it's child polygons
	 */
	drawMaps.prototype.injectSvg = function() {
		var el  = this.element;
		var svg = document.createElementNS(this.xmlns, 'svg');

		svg.classList.add(this.options.svgClass)

		svg.style.webkitUserSelect = 'none';
		svg.style.userSelect       = 'none';
		svg.style.position         = 'absolute';
		svg.style.zIndex           = 999;
		svg.style.left             = 0;
		svg.style.top              = 0;

		el.parentNode.appendChild(svg);

		this.svg = svg;
	};

	/**
	 * Sets the svg viewbox based on the target selector dimensions
	 */
	drawMaps.prototype.setSvgViewbox = function() {
		this.svg.setAttribute('viewBox', [0, 0,
			this.element.clientWidth || ~~this.element.getAttribute('width'),
			this.element.clientHeight || ~~this.element.getAttribute('height')
		].join(' '));
	};

	/**
	 * Append a polygon to the svg element for where to store the
	 * current map
	 */
	drawMaps.prototype.injectPolygon = function() {
		var polygon = document.createElementNS(this.xmlns, 'polygon');

		polygon.style.fill        = this.options.fillColor;
		polygon.style.stroke      = this.options.strokeColor;
		polygon.style.strokeWidth = this.options.strokeWidth;

		this.svg.appendChild(polygon);

		this.polygon = polygon;
	};

	/**
	 * Renders a new point to the map together with the already stored
	 * coordinates
	 */
	drawMaps.prototype.renderNewPoint = function(x, y) {
		this.polygon.setAttribute('points', [
			this.coords,
			x, y
		].join(','));
	};

	/**
	 * Regrets the most recent point added to the map
	 */
	drawMaps.prototype.regretPoint = function() {
		if (this.coords.length > 0)
			this.coords.pop();
	};

	/**
	 * Closes the currently active map
	 */
	drawMaps.prototype.closeMap = function() {
		this.isDrawing = false;
		this.polygon   = null;
		this.coords    = [];
	};

	/**
	 * Resets all maps
	 */
	drawMaps.prototype.resetMaps = function() {
		this.isDrawing     = false;
		this.svg.innerHTML = '';
		this.polygon       = null;
		this.coords        = [];
	};

	/**
	 * Click event handler
	 */
	drawMaps.prototype.onClick = function(event) {
		event.preventDefault();

		if (!this.polygon) {
			this.injectPolygon();
		}

		if (event[this.options.regretKey]) {
			console.log('Point has been removed')
			return this.regretPoint();
		}

		if (event[this.options.closeKey]) {
			console.log('Coordinates:', this.polygon.getAttribute('points'))
			return this.closeMap();
		}

		if (event[this.options.resetKey]) {
			console.log('Maps have been reset')
			return this.resetMaps();
		}

		var position = this.getMousePosition(event);
		this.coords.push([position.x, position.y]);

		this.isDrawing = true;
	};

	/**
	 * Mouse move event handler
	 */
	drawMaps.prototype.onMove = function(event) {
		event.preventDefault();

		if (
			!this.isDrawing ||
			this.coords.length === 0
		) return;

		var position = this.getMousePosition(event);
		this.renderNewPoint(position.x, position.y);
	};

	/**
	 * Window Resize event handler
	 */
	drawMaps.prototype.onResize = function(event) {
		console.log('Svg viewboxes have been updated, you might need to reload browser')
		this.setSvgViewbox();
	};

	/**
	 * Target selector ready event handler
	 */
	drawMaps.prototype.onReady = function(event) {
		this.injectSvg();
		this.setSvgViewbox();

		this.element.parentNode.addEventListener('click', this.onClick.bind(this));
		this.element.parentNode.addEventListener('mousemove', this.onMove.bind(this));

		window.addEventListener('resize', this.onResize.bind(this));
	};

	/**
	 * Log the available controls
	 */
	drawMaps.prototype.logControls = function() {
		if (window.drawMapsLog) return;

		console.log('Available actions:' +
			'\n\t Start to draw [click]' +
			'\n\t Regret last move [click + ' + this.options.regretKey + ']' +
			'\n\t Close current map [click + ' + this.options.closeKey + ']' +
			'\n\t Clear all maps [click + ' + this.options.resetKey + ']'
		);

		window.drawMapsLog = true;
	};

	/**
	 * Initializes the drawing of maps
	 */
	drawMaps.prototype.initialize = function() {
		this.logControls();

		if (this.options.wrapImages)
			this.injectWrapper();

		this.element.addEventListener('load', this.onReady.bind(this))
	};

	/**
	 * The exposed function
	 */
	return (function(selector, options) {
		var elements = document.querySelectorAll(selector);

		console.log('%cDraw Maps has been initialized!',
			'font-family:Arial; font-size:1.1em; font-weight:bold'
		);
		console.log('Selector gave ' + elements.length + ' matches')

		for (var i = elements.length - 1; i >= 0; i--) {
			new drawMaps(elements[i], options);
		}
	});

});
