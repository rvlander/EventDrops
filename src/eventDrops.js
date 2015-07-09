(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/* global require, module */

var defaultConfig = {
  xScale: null
};

module.exports = function (d3, document, config) {
  return function (config) {

    config = config || {
      xScale: null,
      eventColor: null
    };
    for (var key in defaultConfig) {
     config[key] = config[key] || defaultConfig[key];
    }

    function canvasHandler(x, y) {
      this.graphWidth = x;
      this.graphHeight = y;
      this.lastX = graphWidth/2;
      this.lastY = graphHeight/2;
      this.mouseDown = 0;
      this.ctx = null;
      this.canvas = null;
    }

    /*var graphHeight, graphWidth;
    var lastX, lastY;
    var ctx;
    var mouseDown = 0;
    var dragStart, dragged;*/

    /*var canvasHandler = function () {
      var graphWidth = config.width - config.margin.right - config.margin.left;
      alert(graphWidth);
      var graphHeight = data.length * 40;
      alert(graphHeight);
      var ctx = (canvas.node()).getContext('2d');
      var mouseDown = 0;
      var lastX = graphWidth/2;
      var lastY = graphHeight/2;
    }*/

      this.init = function (selection, x, y) {
        /*this.graphWidth = x;
        this.graphHeight = y;
        this.mouseDown = 0;
        this.lastX = x/2;
        this.lastY = y/2;*/

        selection.each(function (data) {
          d3.select(this).select('canvas').remove();
          var canvas = d3.select(this)
            .append('canvas')
            .attr('id', "mon_canvas")
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight)
            ;
          this.ctx = canvas.node().getContext('2d');
        });
      }

      this.draw = function(){
        // Clear the entire canvas
        var topX = 0;
        var topY = 0;
        //alert(graphWidth);
        this.ctx.clearRect(topX, topY, topX + graphWidth, topY + graphHeight);

        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Toto",750/2,35);
        ctx.fillText("Toto",750/2,75);
        ctx.fillText("Toto",750/2,115);
        ctx.fillText("Toto",750/2,155);
      }

      this.drawCircle = function (x, y) {
        context.beginPath();
        context.lineWidth="2";
        context.fillStyle="#FF4422";
        context.arc(x, y, 90, 0, 2 * Math.PI);
        context.fill();
      }

      this.mouseDownHandler = function(evt){
        // permits compatibility with every browser
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
        lastX = evt.clientX;
        //lastY = graphHeight/2;
        //alert(lastX);
        var dragStart = {
          x : lastX,
          y : lastY
        };
        var dragged = false;
        mouseDown++;

        //canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);
        //canvas.node().addEventListener('mouseup', c.mouseUpHandler,false);
      }

      this.mouseMoveHandler = function(evt){
        //lastX = evt.offsetX || (evt.pageX - canvas.node().offsetLeft);
        lastX = evt.clientX;
        dragged = true;
        if (dragStart && mouseDown){
          ctx.translate(lastX-dragStart.x, lastY-dragStart.y);
          //ctx.translate([d3.event.translate[0], 0]);
          drawAgain();
        }
      }

      this.mouseUpHandler = function(evt){
        //canvas.node().addEventListener('mousemove', c.mouseMoveHandler,false);
        //canvas.node().addEventListener('mousedown', c.mouseDownHandler,false);

        dragStart = null;
        mouseDown--;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
      }
  }
}

},{}],2:[function(require,module,exports){
"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');

var defaultConfig = {
  xScale: null,
  dateFormat: null
};

module.exports = function (d3) {

  return function (config) {

    config = config || {};
    for (var key in defaultConfig) {
      config[key] = config[key] || defaultConfig[key];
    }

    function delimiter(selection) {
      selection.each(function (data) {
        d3.select(this).selectAll('text').remove();

        var limits = config.xScale.domain();

        d3.select(this).append('text')
          .text(function () {

            return config.dateFormat(limits[0]);
          })
          .classed('start', true)
        ;

        d3.select(this).append('text')
          .text(function () {

            return config.dateFormat(limits[1]);
          })
          .attr('text-anchor', 'end')
          .attr('transform', 'translate(' + config.xScale.range()[1] + ')')
          .classed('end', true)
        ;
      });
    }

    configurable(delimiter, config);

    return delimiter;
  };
};

},{"./util/configurable":7}],3:[function(require,module,exports){
"use strict";
/* global require, module */

var configurable = require('./util/configurable');

module.exports = function (d3, document) {
  var delimiter = require('./delimiter')(d3);
  var canvasHandler = require('./canvasHandler')(d3, document);
  var filterData = require('./filterData');

  var defaultConfig = {
		start: new Date(0),
		end: new Date(),
		minScale: 0,
		maxScale: Infinity,
		width: 1000,
		margin: {
		  top: 60,
		  left: 200,
		  bottom: 40,
		  right: 50
		},
		locale: null,
		axisFormat: null,
		tickFormat: [
			[".%L", function(d) { return d.getMilliseconds(); }],
			[":%S", function(d) { return d.getSeconds(); }],
			["%I:%M", function(d) { return d.getMinutes(); }],
			["%I %p", function(d) { return d.getHours(); }],
			["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
			["%b %d", function(d) { return d.getDate() != 1; }],
			["%B", function(d) { return d.getMonth(); }],
			["%Y", function() { return true; }]
		],
		eventHover: null,
		eventZoom: null,
		eventClick: null,
		hasDelimiter: true,
		hasTopAxis: true,
		hasBottomAxis: function (data) {
		  return data.length >= 10;
		},
		eventLineColor: 'black',
		eventColor: null
  };

  return function eventDrops(config) {
		var xScale = d3.time.scale();
		var yScale = d3.scale.ordinal();
		config = config || {};
		for (var key in defaultConfig) {
		  config[key] = config[key] || defaultConfig[key];
		}

		function eventDropGraph(selection) {
		  selection.each(function (data) {
				var zoom = d3.behavior.zoom().center(null).scaleExtent([config.minScale, config.maxScale]).on("zoom", updateZoom);

				zoom.on("zoomend", zoomEnd);

				var graphWidth = config.width - config.margin.right - config.margin.left;
				var graphHeight = data.length * 40;
				var height = graphHeight + config.margin.top + config.margin.bottom;

				var canvas_width =  graphWidth;
				var canvas_height = graphHeight;

        var lastX = graphWidth/2;
        var lastY = graphHeight/2;
        var dragged, dragStart;
        var mouseDown = 0;

        var topX = 0;
        var topY = 0;

        var base = d3.select(this);

				d3.select(this).select('canvas').remove();
  			var canvas = d3.select(this)
  			  .append('canvas')
  			  .attr('id', "mon_canvas")
  			  .attr('width', canvas_width)
  			  .attr('height', canvas_height);

		    var ctx = (canvas.node()).getContext('2d');

        var eventLine = require('./eventLine')(d3, ctx);

  			d3.select(this).select('svg').remove();

  			var svg = d3.select(this)
  			  .append('svg')
  			  .attr('width', config.width)
  			  .attr('height', height)
  			;

  			var graph = svg.append('g')
  			  .attr('transform', 'translate(0, 25)');

  			var yDomain = [];
  			var yRange = [];

  			data.forEach(function (event, index) {
  			  yDomain.push(event.name);
  			  yRange.push(index * 40);
  			});

  			yScale.domain(yDomain).range(yRange);


  			var yAxisEl = graph.append('g')
  			  .classed('y-axis', true)
  			  .attr('transform', 'translate(0, 60)');

  			var yTick = yAxisEl.append('g').selectAll('g').data(yDomain);

  			yTick.enter()
  			  .append('g')
  			  .attr('transform', function(d) {
  				return 'translate(0, ' + yScale(d) + ')';
  			  })
  			  .append('line')
  			  .classed('y-tick', true)
  			  .attr('x1', config.margin.left)
  			  .attr('x2', config.margin.left + graphWidth);

			  yTick.exit().remove();

  			var curx, cury;
  			var zoomRect = svg
  			  .append('rect')
  			  .call(zoom)
  			  .classed('zoom', true)
  			  .attr('width', graphWidth)
  			  .attr('height', height )
  			  .attr('transform', 'translate(' + config.margin.left + ', 35)')
  			;

  			if (typeof config.eventHover === 'function') {
  			  zoomRect.on('mousemove', function(d, e) {
  				var event = d3.event;
  				if (curx == event.clientX && cury == event.clientY) return;
  				curx = event.clientX;
  				cury = event.clientY;
  				zoomRect.attr('display', 'none');
  				var el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
  				zoomRect.attr('display', 'block');
  				if (el.tagName !== 'circle') return;
  				config.eventHover(el);
  			  });
  			}

  			if (typeof config.eventClick === 'function') {
  			  zoomRect.on('click', function () {
  				zoomRect.attr('display', 'none');
  				var el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
  				zoomRect.attr('display', 'block');
  				if (el.tagName !== 'circle') return;
  				config.eventClick(el);
  			  });
  			}

  			xScale.range([0, graphWidth]).domain([config.start, config.end]);

  			zoom.x(xScale);

			function updateZoom() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object MouseEvent]') {
		      zoom.translate([d3.event.translate[0], 0]);
		    }

		    if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object WheelEvent]') {
		      zoom.scale(d3.event.scale);
		    }
  			redraw();
  		}

  		function redrawDelimiter() {
  			svg.select('.delimiter').remove();
  			var delimiterEl = svg
  		  .append('g')
  			.classed('delimiter', true)
  			.attr('width', graphWidth)
  			.attr('height', 10)
				.attr('transform', 'translate(' + config.margin.left + ', ' + (config.margin.top - 45) + ')')
  			.call(delimiter({
  			  xScale: xScale,
  			  dateFormat: config.locale ? config.locale.timeFormat("%d %B %Y") : d3.time.format("%d %B %Y")
  			}))
			  ;
			}

  			function zoomEnd() {
  			  if (config.eventZoom) {
  				config.eventZoom(xScale);
  			  }
  			  if (config.hasDelimiter) {
  				redrawDelimiter();
  			  }
  			}

  			function drawXAxis(where) {

  			  // copy config.tickFormat because d3 format.multi edit its given tickFormat data
  			  var tickFormatData = [];

  			  config.tickFormat.forEach(function (item) {
  				var tick = item.slice(0);
  				tickFormatData.push(tick);
  			  });

  			  var tickFormat = config.locale ? config.locale.timeFormat.multi(tickFormatData) : d3.time.format.multi(tickFormatData);
  			  var xAxis = d3.svg.axis()
  				.scale(xScale)
  				.orient(where)
  				.tickFormat(tickFormat)
  			  ;

  			  if (typeof config.axisFormat === 'function') {
  				config.axisFormat(xAxis);
  			  }

  			  var y = (where == 'bottom' ? parseInt(graphHeight) : 0) + config.margin.top - 40;

  			  graph.select('.x-axis.' + where).remove();
  			  var xAxisEl = graph
    				.append('g')
    				.classed('x-axis', true)
    				.classed(where, true)
    				.attr('transform', 'translate(' + config.margin.left + ', ' + y + ')')
    				.call(xAxis)
  			  ;
  			}

  			function redraw() {
          // Store the current transformation matrix
          ctx.save();
          // Set back to the original canvas
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          // Clear the canvas
          ctx.clearRect(0, 0, graphWidth, graphHeight);
          // Restore the former coordinates
          ctx.restore();

  			  var hasTopAxis = typeof config.hasTopAxis === 'function' ? config.hasTopAxis(data) : config.hasTopAxis;
  			  if (hasTopAxis) {
  				  drawXAxis('top');
  			  }

  			  var hasBottomAxis = typeof config.hasBottomAxis === 'function' ? config.hasBottomAxis(data) : config.hasBottomAxis;
  			  if (hasBottomAxis) {
  				  drawXAxis('bottom');
  			  }

  			  zoom.size([config.width, height]);

  			  graph.select('.graph-body').remove();
  			  var graphBody = graph
    				.append('g')
    				.classed('graph-body', true)
    				.attr('transform', 'translate(' + config.margin.left + ', ' + (config.margin.top - 15) + ')');

  			  var lines = graphBody.selectAll('g').data(data);

  			  lines.enter()
    				.append('g')
    				.classed('line', true)
    				.attr('transform', function(d) {
    				  return 'translate(0,' + yScale(d.name) + ')';
    				})
    				.style('fill', config.eventLineColor)
    				.call(eventLine({ xScale: xScale, yScale: yScale, eventLineColor: config.eventLineColor, width: graphWidth, height: graphHeight}))
  			  ;

  			  lines.exit().remove();
  			}

  			redraw();
  			if (config.hasDelimiter) {
  			  redrawDelimiter();
  			}
  			if (config.eventZoom) {
  			  config.eventZoom(xScale);
  			}
		  });
		}
		configurable(eventDropGraph, config);

		return eventDropGraph;
  };
};

},{"./canvasHandler":1,"./delimiter":2,"./eventLine":4,"./filterData":5,"./util/configurable":7}],4:[function(require,module,exports){
"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');
var filterData = require('./filterData');

var defaultConfig = {
  xScale: null,
  yScale: null
};

module.exports = function (d3, context) {
  return function (config) {

    config = config || {
      xScale: null,
      yScale: null,
      eventLineColor: 'black',
      width: 0,
      height: 0
    };
    for (var key in defaultConfig) {
      config[key] = config[key] || defaultConfig[key];
    }

    var eventLine = function eventLine(selection) {
      selection.each(function (data) {
        d3.select(this).selectAll('text').remove();

        d3.select(this).append('text')
          .text(function(d) {
            var count = filterData(d.dates, config.xScale).length;
            return d.name + (count > 0 ? ' (' + count + ')' : '');
          })
          .attr('text-anchor', 'end')
          .attr('transform', 'translate(-20)')
          .style('fill', 'black')
        ;

        var dataContainer = d3.select("body").append('custom');

        function drawCustom (data) {
          var dates = filterData(data.dates, config.xScale);
          var y = 0;
          if (typeof config.yScale === 'function') {
            y = config.yScale(data.name) + 25;
          }else{
            y = config.yScale + 25;
          }
          var color = 'black';
          if (config.eventLineColor) {
            if (typeof config.eventLineColor === 'function') {
              color = config.eventLineColor(data, data.name);
            }else{
              color = config.eventLineColor;
            }
          }

          if (context) {
            drawLine(dates, y, color, context);
          }
        }

        function drawLine(dates, y, color, context) {
          dates.forEach(function(date) {
            context.beginPath();
            context.fillStyle = color;
            context.arc(config.xScale(date), y, 10, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
          });
        }

        drawCustom(data);
      });
    };

    configurable(eventLine, config);

    return eventLine;
  };
};

},{"./filterData":5,"./util/configurable":7}],5:[function(require,module,exports){
"use strict";
/* global module */

module.exports = function filterDate(data, scale) {
  data = data || [];
  var boundary = scale.range();
  var min = boundary[0];
  var max = boundary[1];

  return data.filter(function (datum) {
    var value = scale(datum);
    return !(value < min || value > max);
  });
};

},{}],6:[function(require,module,exports){
"use strict";
/* global require, define, module */

var eventDrops = require('./eventDrops');

if (typeof define === "function" && define.amd) {
  define('d3.chart.eventDrops', ["d3"], function (d3) {
    d3.chart = d3.chart || {};
    d3.chart.eventDrops = eventDrops(d3, document);
  });
} else if (window) {
  window.d3.chart = window.d3.chart || {};
  window.d3.chart.eventDrops = eventDrops(window.d3, document);
} else {
  module.exports = eventDrops;
}

},{"./eventDrops":3}],7:[function(require,module,exports){
module.exports = function configurable(targetFunction, config, listeners) {
  listeners = listeners || {};
  for (var item in config) {
    (function(item) {
      targetFunction[item] = function(value) {
        if (!arguments.length) return config[item];
        config[item] = value;
        if (listeners.hasOwnProperty(item)) {
          listeners[item](value);
        }

        return targetFunction;
      };
    })(item); // for doesn't create a closure, forcing it
  }
};

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2NhbnZhc0hhbmRsZXIuanMiLCJsaWIvZGVsaW1pdGVyLmpzIiwibGliL2V2ZW50RHJvcHMuanMiLCJsaWIvZXZlbnRMaW5lLmpzIiwibGliL2ZpbHRlckRhdGEuanMiLCJsaWIvbWFpbi5qcyIsImxpYi91dGlsL2NvbmZpZ3VyYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50LCBjb25maWcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7XG4gICAgICB4U2NhbGU6IG51bGwsXG4gICAgICBldmVudENvbG9yOiBudWxsXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW52YXNIYW5kbGVyKHgsIHkpIHtcbiAgICAgIHRoaXMuZ3JhcGhXaWR0aCA9IHg7XG4gICAgICB0aGlzLmdyYXBoSGVpZ2h0ID0geTtcbiAgICAgIHRoaXMubGFzdFggPSBncmFwaFdpZHRoLzI7XG4gICAgICB0aGlzLmxhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICAgIHRoaXMubW91c2VEb3duID0gMDtcbiAgICAgIHRoaXMuY3R4ID0gbnVsbDtcbiAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKnZhciBncmFwaEhlaWdodCwgZ3JhcGhXaWR0aDtcbiAgICB2YXIgbGFzdFgsIGxhc3RZO1xuICAgIHZhciBjdHg7XG4gICAgdmFyIG1vdXNlRG93biA9IDA7XG4gICAgdmFyIGRyYWdTdGFydCwgZHJhZ2dlZDsqL1xuXG4gICAgLyp2YXIgY2FudmFzSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBncmFwaFdpZHRoID0gY29uZmlnLndpZHRoIC0gY29uZmlnLm1hcmdpbi5yaWdodCAtIGNvbmZpZy5tYXJnaW4ubGVmdDtcbiAgICAgIGFsZXJ0KGdyYXBoV2lkdGgpO1xuICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZGF0YS5sZW5ndGggKiA0MDtcbiAgICAgIGFsZXJ0KGdyYXBoSGVpZ2h0KTtcbiAgICAgIHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIHZhciBtb3VzZURvd24gPSAwO1xuICAgICAgdmFyIGxhc3RYID0gZ3JhcGhXaWR0aC8yO1xuICAgICAgdmFyIGxhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICB9Ki9cblxuICAgICAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKHNlbGVjdGlvbiwgeCwgeSkge1xuICAgICAgICAvKnRoaXMuZ3JhcGhXaWR0aCA9IHg7XG4gICAgICAgIHRoaXMuZ3JhcGhIZWlnaHQgPSB5O1xuICAgICAgICB0aGlzLm1vdXNlRG93biA9IDA7XG4gICAgICAgIHRoaXMubGFzdFggPSB4LzI7XG4gICAgICAgIHRoaXMubGFzdFkgPSB5LzI7Ki9cblxuICAgICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuICAgICAgICAgIHZhciBjYW52YXMgPSBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgIC5hcHBlbmQoJ2NhbnZhcycpXG4gICAgICAgICAgICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMuZ3JhcGhXaWR0aClcbiAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLmdyYXBoSGVpZ2h0KVxuICAgICAgICAgICAgO1xuICAgICAgICAgIHRoaXMuY3R4ID0gY2FudmFzLm5vZGUoKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gQ2xlYXIgdGhlIGVudGlyZSBjYW52YXNcbiAgICAgICAgdmFyIHRvcFggPSAwO1xuICAgICAgICB2YXIgdG9wWSA9IDA7XG4gICAgICAgIC8vYWxlcnQoZ3JhcGhXaWR0aCk7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCh0b3BYLCB0b3BZLCB0b3BYICsgZ3JhcGhXaWR0aCwgdG9wWSArIGdyYXBoSGVpZ2h0KTtcblxuICAgICAgICBjdHguZm9udCA9IFwiMzBweCBBcmlhbFwiO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDM1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDc1KTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiVG90b1wiLDc1MC8yLDExNSk7XG4gICAgICAgIGN0eC5maWxsVGV4dChcIlRvdG9cIiw3NTAvMiwxNTUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXdDaXJjbGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0LmxpbmVXaWR0aD1cIjJcIjtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGU9XCIjRkY0NDIyXCI7XG4gICAgICAgIGNvbnRleHQuYXJjKHgsIHksIDkwLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1vdXNlRG93bkhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvLyBwZXJtaXRzIGNvbXBhdGliaWxpdHkgd2l0aCBldmVyeSBicm93c2VyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubW96VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUud2Via2l0VXNlclNlbGVjdCA9IGRvY3VtZW50LmJvZHkuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcbiAgICAgICAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuICAgICAgICBsYXN0WCA9IGV2dC5jbGllbnRYO1xuICAgICAgICAvL2xhc3RZID0gZ3JhcGhIZWlnaHQvMjtcbiAgICAgICAgLy9hbGVydChsYXN0WCk7XG4gICAgICAgIHZhciBkcmFnU3RhcnQgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYLFxuICAgICAgICAgIHkgOiBsYXN0WVxuICAgICAgICB9O1xuICAgICAgICB2YXIgZHJhZ2dlZCA9IGZhbHNlO1xuICAgICAgICBtb3VzZURvd24rKztcblxuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYy5tb3VzZU1vdmVIYW5kbGVyLGZhbHNlKTtcbiAgICAgICAgLy9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjLm1vdXNlVXBIYW5kbGVyLGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3VzZU1vdmVIYW5kbGVyID0gZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgLy9sYXN0WCA9IGV2dC5vZmZzZXRYIHx8IChldnQucGFnZVggLSBjYW52YXMubm9kZSgpLm9mZnNldExlZnQpO1xuICAgICAgICBsYXN0WCA9IGV2dC5jbGllbnRYO1xuICAgICAgICBkcmFnZ2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGRyYWdTdGFydCAmJiBtb3VzZURvd24pe1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUobGFzdFgtZHJhZ1N0YXJ0LngsIGxhc3RZLWRyYWdTdGFydC55KTtcbiAgICAgICAgICAvL2N0eC50cmFuc2xhdGUoW2QzLmV2ZW50LnRyYW5zbGF0ZVswXSwgMF0pO1xuICAgICAgICAgIGRyYXdBZ2FpbigpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbihldnQpe1xuICAgICAgICAvL2NhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYy5tb3VzZU1vdmVIYW5kbGVyLGZhbHNlKTtcbiAgICAgICAgLy9jYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGMubW91c2VEb3duSGFuZGxlcixmYWxzZSk7XG5cbiAgICAgICAgZHJhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgICAgbW91c2VEb3duLS07XG4gICAgICAgIGlmICghZHJhZ2dlZCkgem9vbShldnQuc2hpZnRLZXkgPyAtMSA6IDEgKTtcbiAgICAgIH1cbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICBkYXRlRm9ybWF0OiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMykge1xuXG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGltaXRlcihzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgbGltaXRzID0gY29uZmlnLnhTY2FsZS5kb21haW4oKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNsYXNzZWQoJ3N0YXJ0JywgdHJ1ZSlcbiAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5kYXRlRm9ybWF0KGxpbWl0c1sxXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLnhTY2FsZS5yYW5nZSgpWzFdICsgJyknKVxuICAgICAgICAgIC5jbGFzc2VkKCdlbmQnLCB0cnVlKVxuICAgICAgICA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25maWd1cmFibGUoZGVsaW1pdGVyLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGRlbGltaXRlcjtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMsIGRvY3VtZW50KSB7XG4gIHZhciBkZWxpbWl0ZXIgPSByZXF1aXJlKCcuL2RlbGltaXRlcicpKGQzKTtcbiAgdmFyIGNhbnZhc0hhbmRsZXIgPSByZXF1aXJlKCcuL2NhbnZhc0hhbmRsZXInKShkMywgZG9jdW1lbnQpO1xuICB2YXIgZmlsdGVyRGF0YSA9IHJlcXVpcmUoJy4vZmlsdGVyRGF0YScpO1xuXG4gIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuXHRcdHN0YXJ0OiBuZXcgRGF0ZSgwKSxcblx0XHRlbmQ6IG5ldyBEYXRlKCksXG5cdFx0bWluU2NhbGU6IDAsXG5cdFx0bWF4U2NhbGU6IEluZmluaXR5LFxuXHRcdHdpZHRoOiAxMDAwLFxuXHRcdG1hcmdpbjoge1xuXHRcdCAgdG9wOiA2MCxcblx0XHQgIGxlZnQ6IDIwMCxcblx0XHQgIGJvdHRvbTogNDAsXG5cdFx0ICByaWdodDogNTBcblx0XHR9LFxuXHRcdGxvY2FsZTogbnVsbCxcblx0XHRheGlzRm9ybWF0OiBudWxsLFxuXHRcdHRpY2tGb3JtYXQ6IFtcblx0XHRcdFtcIi4lTFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbGxpc2Vjb25kcygpOyB9XSxcblx0XHRcdFtcIjolU1wiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldFNlY29uZHMoKTsgfV0sXG5cdFx0XHRbXCIlSTolTVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldE1pbnV0ZXMoKTsgfV0sXG5cdFx0XHRbXCIlSSAlcFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldEhvdXJzKCk7IH1dLFxuXHRcdFx0W1wiJWEgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXkoKSAmJiBkLmdldERhdGUoKSAhPSAxOyB9XSxcblx0XHRcdFtcIiViICVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0RGF0ZSgpICE9IDE7IH1dLFxuXHRcdFx0W1wiJUJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNb250aCgpOyB9XSxcblx0XHRcdFtcIiVZXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfV1cblx0XHRdLFxuXHRcdGV2ZW50SG92ZXI6IG51bGwsXG5cdFx0ZXZlbnRab29tOiBudWxsLFxuXHRcdGV2ZW50Q2xpY2s6IG51bGwsXG5cdFx0aGFzRGVsaW1pdGVyOiB0cnVlLFxuXHRcdGhhc1RvcEF4aXM6IHRydWUsXG5cdFx0aGFzQm90dG9tQXhpczogZnVuY3Rpb24gKGRhdGEpIHtcblx0XHQgIHJldHVybiBkYXRhLmxlbmd0aCA+PSAxMDtcblx0XHR9LFxuXHRcdGV2ZW50TGluZUNvbG9yOiAnYmxhY2snLFxuXHRcdGV2ZW50Q29sb3I6IG51bGxcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24gZXZlbnREcm9wcyhjb25maWcpIHtcblx0XHR2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuXHRcdHZhciB5U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKCk7XG5cdFx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXHRcdGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG5cdFx0ICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBldmVudERyb3BHcmFwaChzZWxlY3Rpb24pIHtcblx0XHQgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdHZhciB6b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpLmNlbnRlcihudWxsKS5zY2FsZUV4dGVudChbY29uZmlnLm1pblNjYWxlLCBjb25maWcubWF4U2NhbGVdKS5vbihcInpvb21cIiwgdXBkYXRlWm9vbSk7XG5cblx0XHRcdFx0em9vbS5vbihcInpvb21lbmRcIiwgem9vbUVuZCk7XG5cblx0XHRcdFx0dmFyIGdyYXBoV2lkdGggPSBjb25maWcud2lkdGggLSBjb25maWcubWFyZ2luLnJpZ2h0IC0gY29uZmlnLm1hcmdpbi5sZWZ0O1xuXHRcdFx0XHR2YXIgZ3JhcGhIZWlnaHQgPSBkYXRhLmxlbmd0aCAqIDQwO1xuXHRcdFx0XHR2YXIgaGVpZ2h0ID0gZ3JhcGhIZWlnaHQgKyBjb25maWcubWFyZ2luLnRvcCArIGNvbmZpZy5tYXJnaW4uYm90dG9tO1xuXG5cdFx0XHRcdHZhciBjYW52YXNfd2lkdGggPSAgZ3JhcGhXaWR0aDtcblx0XHRcdFx0dmFyIGNhbnZhc19oZWlnaHQgPSBncmFwaEhlaWdodDtcblxuICAgICAgICB2YXIgbGFzdFggPSBncmFwaFdpZHRoLzI7XG4gICAgICAgIHZhciBsYXN0WSA9IGdyYXBoSGVpZ2h0LzI7XG4gICAgICAgIHZhciBkcmFnZ2VkLCBkcmFnU3RhcnQ7XG4gICAgICAgIHZhciBtb3VzZURvd24gPSAwO1xuXG4gICAgICAgIHZhciB0b3BYID0gMDtcbiAgICAgICAgdmFyIHRvcFkgPSAwO1xuXG4gICAgICAgIHZhciBiYXNlID0gZDMuc2VsZWN0KHRoaXMpO1xuXG5cdFx0XHRcdGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ2NhbnZhcycpLnJlbW92ZSgpO1xuICBcdFx0XHR2YXIgY2FudmFzID0gZDMuc2VsZWN0KHRoaXMpXG4gIFx0XHRcdCAgLmFwcGVuZCgnY2FudmFzJylcbiAgXHRcdFx0ICAuYXR0cignaWQnLCBcIm1vbl9jYW52YXNcIilcbiAgXHRcdFx0ICAuYXR0cignd2lkdGgnLCBjYW52YXNfd2lkdGgpXG4gIFx0XHRcdCAgLmF0dHIoJ2hlaWdodCcsIGNhbnZhc19oZWlnaHQpO1xuXG5cdFx0ICAgIHZhciBjdHggPSAoY2FudmFzLm5vZGUoKSkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB2YXIgZXZlbnRMaW5lID0gcmVxdWlyZSgnLi9ldmVudExpbmUnKShkMywgY3R4KTtcblxuICBcdFx0XHRkMy5zZWxlY3QodGhpcykuc2VsZWN0KCdzdmcnKS5yZW1vdmUoKTtcblxuICBcdFx0XHR2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMpXG4gIFx0XHRcdCAgLmFwcGVuZCgnc3ZnJylcbiAgXHRcdFx0ICAuYXR0cignd2lkdGgnLCBjb25maWcud2lkdGgpXG4gIFx0XHRcdCAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbiAgXHRcdFx0O1xuXG4gIFx0XHRcdHZhciBncmFwaCA9IHN2Zy5hcHBlbmQoJ2cnKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsIDI1KScpO1xuXG4gIFx0XHRcdHZhciB5RG9tYWluID0gW107XG4gIFx0XHRcdHZhciB5UmFuZ2UgPSBbXTtcblxuICBcdFx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50LCBpbmRleCkge1xuICBcdFx0XHQgIHlEb21haW4ucHVzaChldmVudC5uYW1lKTtcbiAgXHRcdFx0ICB5UmFuZ2UucHVzaChpbmRleCAqIDQwKTtcbiAgXHRcdFx0fSk7XG5cbiAgXHRcdFx0eVNjYWxlLmRvbWFpbih5RG9tYWluKS5yYW5nZSh5UmFuZ2UpO1xuXG5cbiAgXHRcdFx0dmFyIHlBeGlzRWwgPSBncmFwaC5hcHBlbmQoJ2cnKVxuICBcdFx0XHQgIC5jbGFzc2VkKCd5LWF4aXMnLCB0cnVlKVxuICBcdFx0XHQgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsIDYwKScpO1xuXG4gIFx0XHRcdHZhciB5VGljayA9IHlBeGlzRWwuYXBwZW5kKCdnJykuc2VsZWN0QWxsKCdnJykuZGF0YSh5RG9tYWluKTtcblxuICBcdFx0XHR5VGljay5lbnRlcigpXG4gIFx0XHRcdCAgLmFwcGVuZCgnZycpXG4gIFx0XHRcdCAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgXHRcdFx0XHRyZXR1cm4gJ3RyYW5zbGF0ZSgwLCAnICsgeVNjYWxlKGQpICsgJyknO1xuICBcdFx0XHQgIH0pXG4gIFx0XHRcdCAgLmFwcGVuZCgnbGluZScpXG4gIFx0XHRcdCAgLmNsYXNzZWQoJ3ktdGljaycsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3gxJywgY29uZmlnLm1hcmdpbi5sZWZ0KVxuICBcdFx0XHQgIC5hdHRyKCd4MicsIGNvbmZpZy5tYXJnaW4ubGVmdCArIGdyYXBoV2lkdGgpO1xuXG5cdFx0XHQgIHlUaWNrLmV4aXQoKS5yZW1vdmUoKTtcblxuICBcdFx0XHR2YXIgY3VyeCwgY3VyeTtcbiAgXHRcdFx0dmFyIHpvb21SZWN0ID0gc3ZnXG4gIFx0XHRcdCAgLmFwcGVuZCgncmVjdCcpXG4gIFx0XHRcdCAgLmNhbGwoem9vbSlcbiAgXHRcdFx0ICAuY2xhc3NlZCgnem9vbScsIHRydWUpXG4gIFx0XHRcdCAgLmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcbiAgXHRcdFx0ICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0IClcbiAgXHRcdFx0ICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgMzUpJylcbiAgXHRcdFx0O1xuXG4gIFx0XHRcdGlmICh0eXBlb2YgY29uZmlnLmV2ZW50SG92ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgXHRcdFx0ICB6b29tUmVjdC5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZCwgZSkge1xuICBcdFx0XHRcdHZhciBldmVudCA9IGQzLmV2ZW50O1xuICBcdFx0XHRcdGlmIChjdXJ4ID09IGV2ZW50LmNsaWVudFggJiYgY3VyeSA9PSBldmVudC5jbGllbnRZKSByZXR1cm47XG4gIFx0XHRcdFx0Y3VyeCA9IGV2ZW50LmNsaWVudFg7XG4gIFx0XHRcdFx0Y3VyeSA9IGV2ZW50LmNsaWVudFk7XG4gIFx0XHRcdFx0em9vbVJlY3QuYXR0cignZGlzcGxheScsICdub25lJyk7XG4gIFx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChkMy5ldmVudC5jbGllbnRYLCBkMy5ldmVudC5jbGllbnRZKTtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gIFx0XHRcdFx0aWYgKGVsLnRhZ05hbWUgIT09ICdjaXJjbGUnKSByZXR1cm47XG4gIFx0XHRcdFx0Y29uZmlnLmV2ZW50SG92ZXIoZWwpO1xuICBcdFx0XHQgIH0pO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0aWYgKHR5cGVvZiBjb25maWcuZXZlbnRDbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICBcdFx0XHQgIHpvb21SZWN0Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgXHRcdFx0XHR6b29tUmVjdC5hdHRyKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuICBcdFx0XHRcdHpvb21SZWN0LmF0dHIoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgXHRcdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ2NpcmNsZScpIHJldHVybjtcbiAgXHRcdFx0XHRjb25maWcuZXZlbnRDbGljayhlbCk7XG4gIFx0XHRcdCAgfSk7XG4gIFx0XHRcdH1cblxuICBcdFx0XHR4U2NhbGUucmFuZ2UoWzAsIGdyYXBoV2lkdGhdKS5kb21haW4oW2NvbmZpZy5zdGFydCwgY29uZmlnLmVuZF0pO1xuXG4gIFx0XHRcdHpvb20ueCh4U2NhbGUpO1xuXG5cdFx0XHRmdW5jdGlvbiB1cGRhdGVab29tKCkge1xuICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgTW91c2VFdmVudF0nKSB7XG5cdFx0ICAgICAgem9vbS50cmFuc2xhdGUoW2QzLmV2ZW50LnRyYW5zbGF0ZVswXSwgMF0pO1xuXHRcdCAgICB9XG5cblx0XHQgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IFdoZWVsRXZlbnRdJykge1xuXHRcdCAgICAgIHpvb20uc2NhbGUoZDMuZXZlbnQuc2NhbGUpO1xuXHRcdCAgICB9XG4gIFx0XHRcdHJlZHJhdygpO1xuICBcdFx0fVxuXG4gIFx0XHRmdW5jdGlvbiByZWRyYXdEZWxpbWl0ZXIoKSB7XG4gIFx0XHRcdHN2Zy5zZWxlY3QoJy5kZWxpbWl0ZXInKS5yZW1vdmUoKTtcbiAgXHRcdFx0dmFyIGRlbGltaXRlckVsID0gc3ZnXG4gIFx0XHQgIC5hcHBlbmQoJ2cnKVxuICBcdFx0XHQuY2xhc3NlZCgnZGVsaW1pdGVyJywgdHJ1ZSlcbiAgXHRcdFx0LmF0dHIoJ3dpZHRoJywgZ3JhcGhXaWR0aClcbiAgXHRcdFx0LmF0dHIoJ2hlaWdodCcsIDEwKVxuXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIChjb25maWcubWFyZ2luLnRvcCAtIDQ1KSArICcpJylcbiAgXHRcdFx0LmNhbGwoZGVsaW1pdGVyKHtcbiAgXHRcdFx0ICB4U2NhbGU6IHhTY2FsZSxcbiAgXHRcdFx0ICBkYXRlRm9ybWF0OiBjb25maWcubG9jYWxlID8gY29uZmlnLmxvY2FsZS50aW1lRm9ybWF0KFwiJWQgJUIgJVlcIikgOiBkMy50aW1lLmZvcm1hdChcIiVkICVCICVZXCIpXG4gIFx0XHRcdH0pKVxuXHRcdFx0ICA7XG5cdFx0XHR9XG5cbiAgXHRcdFx0ZnVuY3Rpb24gem9vbUVuZCgpIHtcbiAgXHRcdFx0ICBpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuICBcdFx0XHRcdGNvbmZpZy5ldmVudFpvb20oeFNjYWxlKTtcbiAgXHRcdFx0ICB9XG4gIFx0XHRcdCAgaWYgKGNvbmZpZy5oYXNEZWxpbWl0ZXIpIHtcbiAgXHRcdFx0XHRyZWRyYXdEZWxpbWl0ZXIoKTtcbiAgXHRcdFx0ICB9XG4gIFx0XHRcdH1cblxuICBcdFx0XHRmdW5jdGlvbiBkcmF3WEF4aXMod2hlcmUpIHtcblxuICBcdFx0XHQgIC8vIGNvcHkgY29uZmlnLnRpY2tGb3JtYXQgYmVjYXVzZSBkMyBmb3JtYXQubXVsdGkgZWRpdCBpdHMgZ2l2ZW4gdGlja0Zvcm1hdCBkYXRhXG4gIFx0XHRcdCAgdmFyIHRpY2tGb3JtYXREYXRhID0gW107XG5cbiAgXHRcdFx0ICBjb25maWcudGlja0Zvcm1hdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gIFx0XHRcdFx0dmFyIHRpY2sgPSBpdGVtLnNsaWNlKDApO1xuICBcdFx0XHRcdHRpY2tGb3JtYXREYXRhLnB1c2godGljayk7XG4gIFx0XHRcdCAgfSk7XG5cbiAgXHRcdFx0ICB2YXIgdGlja0Zvcm1hdCA9IGNvbmZpZy5sb2NhbGUgPyBjb25maWcubG9jYWxlLnRpbWVGb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpIDogZDMudGltZS5mb3JtYXQubXVsdGkodGlja0Zvcm1hdERhdGEpO1xuICBcdFx0XHQgIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgXHRcdFx0XHQuc2NhbGUoeFNjYWxlKVxuICBcdFx0XHRcdC5vcmllbnQod2hlcmUpXG4gIFx0XHRcdFx0LnRpY2tGb3JtYXQodGlja0Zvcm1hdClcbiAgXHRcdFx0ICA7XG5cbiAgXHRcdFx0ICBpZiAodHlwZW9mIGNvbmZpZy5heGlzRm9ybWF0ID09PSAnZnVuY3Rpb24nKSB7XG4gIFx0XHRcdFx0Y29uZmlnLmF4aXNGb3JtYXQoeEF4aXMpO1xuICBcdFx0XHQgIH1cblxuICBcdFx0XHQgIHZhciB5ID0gKHdoZXJlID09ICdib3R0b20nID8gcGFyc2VJbnQoZ3JhcGhIZWlnaHQpIDogMCkgKyBjb25maWcubWFyZ2luLnRvcCAtIDQwO1xuXG4gIFx0XHRcdCAgZ3JhcGguc2VsZWN0KCcueC1heGlzLicgKyB3aGVyZSkucmVtb3ZlKCk7XG4gIFx0XHRcdCAgdmFyIHhBeGlzRWwgPSBncmFwaFxuICAgIFx0XHRcdFx0LmFwcGVuZCgnZycpXG4gICAgXHRcdFx0XHQuY2xhc3NlZCgneC1heGlzJywgdHJ1ZSlcbiAgICBcdFx0XHRcdC5jbGFzc2VkKHdoZXJlLCB0cnVlKVxuICAgIFx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyB5ICsgJyknKVxuICAgIFx0XHRcdFx0LmNhbGwoeEF4aXMpXG4gIFx0XHRcdCAgO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0ZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgICAgICAgIC8vIFN0b3JlIHRoZSBjdXJyZW50IHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgLy8gU2V0IGJhY2sgdG8gdGhlIG9yaWdpbmFsIGNhbnZhc1xuICAgICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG4gICAgICAgICAgLy8gQ2xlYXIgdGhlIGNhbnZhc1xuICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgZ3JhcGhXaWR0aCwgZ3JhcGhIZWlnaHQpO1xuICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIGZvcm1lciBjb29yZGluYXRlc1xuICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgXHRcdFx0ICB2YXIgaGFzVG9wQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzVG9wQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNUb3BBeGlzKGRhdGEpIDogY29uZmlnLmhhc1RvcEF4aXM7XG4gIFx0XHRcdCAgaWYgKGhhc1RvcEF4aXMpIHtcbiAgXHRcdFx0XHQgIGRyYXdYQXhpcygndG9wJyk7XG4gIFx0XHRcdCAgfVxuXG4gIFx0XHRcdCAgdmFyIGhhc0JvdHRvbUF4aXMgPSB0eXBlb2YgY29uZmlnLmhhc0JvdHRvbUF4aXMgPT09ICdmdW5jdGlvbicgPyBjb25maWcuaGFzQm90dG9tQXhpcyhkYXRhKSA6IGNvbmZpZy5oYXNCb3R0b21BeGlzO1xuICBcdFx0XHQgIGlmIChoYXNCb3R0b21BeGlzKSB7XG4gIFx0XHRcdFx0ICBkcmF3WEF4aXMoJ2JvdHRvbScpO1xuICBcdFx0XHQgIH1cblxuICBcdFx0XHQgIHpvb20uc2l6ZShbY29uZmlnLndpZHRoLCBoZWlnaHRdKTtcblxuICBcdFx0XHQgIGdyYXBoLnNlbGVjdCgnLmdyYXBoLWJvZHknKS5yZW1vdmUoKTtcbiAgXHRcdFx0ICB2YXIgZ3JhcGhCb2R5ID0gZ3JhcGhcbiAgICBcdFx0XHRcdC5hcHBlbmQoJ2cnKVxuICAgIFx0XHRcdFx0LmNsYXNzZWQoJ2dyYXBoLWJvZHknLCB0cnVlKVxuICAgIFx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSAxNSkgKyAnKScpO1xuXG4gIFx0XHRcdCAgdmFyIGxpbmVzID0gZ3JhcGhCb2R5LnNlbGVjdEFsbCgnZycpLmRhdGEoZGF0YSk7XG5cbiAgXHRcdFx0ICBsaW5lcy5lbnRlcigpXG4gICAgXHRcdFx0XHQuYXBwZW5kKCdnJylcbiAgICBcdFx0XHRcdC5jbGFzc2VkKCdsaW5lJywgdHJ1ZSlcbiAgICBcdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG4gICAgXHRcdFx0XHQgIHJldHVybiAndHJhbnNsYXRlKDAsJyArIHlTY2FsZShkLm5hbWUpICsgJyknO1xuICAgIFx0XHRcdFx0fSlcbiAgICBcdFx0XHRcdC5zdHlsZSgnZmlsbCcsIGNvbmZpZy5ldmVudExpbmVDb2xvcilcbiAgICBcdFx0XHRcdC5jYWxsKGV2ZW50TGluZSh7IHhTY2FsZTogeFNjYWxlLCB5U2NhbGU6IHlTY2FsZSwgZXZlbnRMaW5lQ29sb3I6IGNvbmZpZy5ldmVudExpbmVDb2xvciwgd2lkdGg6IGdyYXBoV2lkdGgsIGhlaWdodDogZ3JhcGhIZWlnaHR9KSlcbiAgXHRcdFx0ICA7XG5cbiAgXHRcdFx0ICBsaW5lcy5leGl0KCkucmVtb3ZlKCk7XG4gIFx0XHRcdH1cblxuICBcdFx0XHRyZWRyYXcoKTtcbiAgXHRcdFx0aWYgKGNvbmZpZy5oYXNEZWxpbWl0ZXIpIHtcbiAgXHRcdFx0ICByZWRyYXdEZWxpbWl0ZXIoKTtcbiAgXHRcdFx0fVxuICBcdFx0XHRpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuICBcdFx0XHQgIGNvbmZpZy5ldmVudFpvb20oeFNjYWxlKTtcbiAgXHRcdFx0fVxuXHRcdCAgfSk7XG5cdFx0fVxuXHRcdGNvbmZpZ3VyYWJsZShldmVudERyb3BHcmFwaCwgY29uZmlnKTtcblxuXHRcdHJldHVybiBldmVudERyb3BHcmFwaDtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGQzICovXG5cbnZhciBjb25maWd1cmFibGUgPSByZXF1aXJlKCcuL3V0aWwvY29uZmlndXJhYmxlJyk7XG52YXIgZmlsdGVyRGF0YSA9IHJlcXVpcmUoJy4vZmlsdGVyRGF0YScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICB5U2NhbGU6IG51bGxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGQzLCBjb250ZXh0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge1xuICAgICAgeFNjYWxlOiBudWxsLFxuICAgICAgeVNjYWxlOiBudWxsLFxuICAgICAgZXZlbnRMaW5lQ29sb3I6ICdibGFjaycsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH07XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIHZhciBldmVudExpbmUgPSBmdW5jdGlvbiBldmVudExpbmUoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0ZXh0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgdmFyIGNvdW50ID0gZmlsdGVyRGF0YShkLmRhdGVzLCBjb25maWcueFNjYWxlKS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZC5uYW1lICsgKGNvdW50ID4gMCA/ICcgKCcgKyBjb3VudCArICcpJyA6ICcnKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKC0yMCknKVxuICAgICAgICAgIC5zdHlsZSgnZmlsbCcsICdibGFjaycpXG4gICAgICAgIDtcblxuICAgICAgICB2YXIgZGF0YUNvbnRhaW5lciA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKCdjdXN0b20nKTtcblxuICAgICAgICBmdW5jdGlvbiBkcmF3Q3VzdG9tIChkYXRhKSB7XG4gICAgICAgICAgdmFyIGRhdGVzID0gZmlsdGVyRGF0YShkYXRhLmRhdGVzLCBjb25maWcueFNjYWxlKTtcbiAgICAgICAgICB2YXIgeSA9IDA7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb25maWcueVNjYWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB5ID0gY29uZmlnLnlTY2FsZShkYXRhLm5hbWUpICsgMjU7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB5ID0gY29uZmlnLnlTY2FsZSArIDI1O1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgY29sb3IgPSAnYmxhY2snO1xuICAgICAgICAgIGlmIChjb25maWcuZXZlbnRMaW5lQ29sb3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnLmV2ZW50TGluZUNvbG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIGNvbG9yID0gY29uZmlnLmV2ZW50TGluZUNvbG9yKGRhdGEsIGRhdGEubmFtZSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgY29sb3IgPSBjb25maWcuZXZlbnRMaW5lQ29sb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIGRyYXdMaW5lKGRhdGVzLCB5LCBjb2xvciwgY29udGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhd0xpbmUoZGF0ZXMsIHksIGNvbG9yLCBjb250ZXh0KSB7XG4gICAgICAgICAgZGF0ZXMuZm9yRWFjaChmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgICAgIGNvbnRleHQuYXJjKGNvbmZpZy54U2NhbGUoZGF0ZSksIHksIDEwLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBkcmF3Q3VzdG9tKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbmZpZ3VyYWJsZShldmVudExpbmUsIGNvbmZpZyk7XG5cbiAgICByZXR1cm4gZXZlbnRMaW5lO1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogZ2xvYmFsIG1vZHVsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbHRlckRhdGUoZGF0YSwgc2NhbGUpIHtcbiAgZGF0YSA9IGRhdGEgfHwgW107XG4gIHZhciBib3VuZGFyeSA9IHNjYWxlLnJhbmdlKCk7XG4gIHZhciBtaW4gPSBib3VuZGFyeVswXTtcbiAgdmFyIG1heCA9IGJvdW5kYXJ5WzFdO1xuXG4gIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbiAoZGF0dW0pIHtcbiAgICB2YXIgdmFsdWUgPSBzY2FsZShkYXR1bSk7XG4gICAgcmV0dXJuICEodmFsdWUgPCBtaW4gfHwgdmFsdWUgPiBtYXgpO1xuICB9KTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBkZWZpbmUsIG1vZHVsZSAqL1xuXG52YXIgZXZlbnREcm9wcyA9IHJlcXVpcmUoJy4vZXZlbnREcm9wcycpO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKCdkMy5jaGFydC5ldmVudERyb3BzJywgW1wiZDNcIl0sIGZ1bmN0aW9uIChkMykge1xuICAgIGQzLmNoYXJ0ID0gZDMuY2hhcnQgfHwge307XG4gICAgZDMuY2hhcnQuZXZlbnREcm9wcyA9IGV2ZW50RHJvcHMoZDMsIGRvY3VtZW50KTtcbiAgfSk7XG59IGVsc2UgaWYgKHdpbmRvdykge1xuICB3aW5kb3cuZDMuY2hhcnQgPSB3aW5kb3cuZDMuY2hhcnQgfHwge307XG4gIHdpbmRvdy5kMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyh3aW5kb3cuZDMsIGRvY3VtZW50KTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZXZlbnREcm9wcztcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlndXJhYmxlKHRhcmdldEZ1bmN0aW9uLCBjb25maWcsIGxpc3RlbmVycykge1xuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMgfHwge307XG4gIGZvciAodmFyIGl0ZW0gaW4gY29uZmlnKSB7XG4gICAgKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHRhcmdldEZ1bmN0aW9uW2l0ZW1dID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29uZmlnW2l0ZW1dO1xuICAgICAgICBjb25maWdbaXRlbV0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgIGxpc3RlbmVyc1tpdGVtXSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0RnVuY3Rpb247XG4gICAgICB9O1xuICAgIH0pKGl0ZW0pOyAvLyBmb3IgZG9lc24ndCBjcmVhdGUgYSBjbG9zdXJlLCBmb3JjaW5nIGl0XG4gIH1cbn07XG4iXX0=
