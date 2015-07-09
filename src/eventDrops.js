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
  //var eventLine = require('./eventLine')(d3);
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

		  	//window.requestAnimFrame = (function(){
		    //  return  window.requestAnimationFrame       ||
		    //          window.webkitRequestAnimationFrame ||
		    //          window.mozRequestAnimationFrame    ||
		    //          window.oRequestAnimationFrame      ||
		    //          window.msRequestAnimationFrame     ||
		    //          function(/* function */ callback, /* DOMElement */ element) {
		    //            window.setTimeout(callback, 1000 / 60);
		    //          };
	    	//})();


				var zoom = d3.behavior.zoom().center(null).scaleExtent([config.minScale, config.maxScale]).on("zoom", updateZoom);

				zoom.on("zoomend", zoomEnd);
        zoom.on("zoomstart", zoomStart);

				var graphWidth = config.width - config.margin.right - config.margin.left;
				var graphHeight = data.length * 40;
				var height = graphHeight + config.margin.top + config.margin.bottom;

				var canvas_width =  graphWidth;
				var canvas_height = graphHeight;

        var lastX = graphWidth/2;
        var lastY = graphHeight/2;
        var dragged, dragStart;
        var mouseDown = 0;

        var base = d3.select(this);

				d3.select(this).select('canvas').remove();
  			var canvas = d3.select(this)
  			  .append('canvas')
  			  .attr('id', "mon_canvas")
  			  .attr('width', canvas_width)
  			  .attr('height', canvas_height);

		    var ctx = (canvas.node()).getContext('2d');

        var eventLine = require('./eventLine')(d3, ctx);

  			function drawAgain(){
  			  // Clear the entire canvas
  			  var topX = 0;
  			  var topY = 0;
  			  ctx.clearRect(topX, topY, topX + canvas.node().width, topY + canvas.node().height);

  			}
			// draw the canvas for the first time
  			drawAgain();

        canvas.node().addEventListener('mousedown', function (evt) {
          // permits compatibility with every browser
          document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
          lastX = evt.clientX;
          dragStart = {
            x : lastX,
            y : lastY
          };
          dragged = false;
          mouseDown++;
        },false);

        canvas.node().addEventListener('mousemove', function (evt) {
          lastX = evt.clientX;
          dragged = true;
          if (dragStart && mouseDown){
            ctx.translate(lastX-dragStart.x, lastY-dragStart.y);
            drawAgain();
            redraw();
          }
        },false);

        canvas.node().addEventListener('mouseup', function (evt) {
          dragStart = null;
          mouseDown--;
          if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
        },false);


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

        var coorX_start;

        var coorX_end;

        var count = 0;

        function translateCanvas(x, y) {
          ctx.translate(y - x, 0);
          return y;
        }

        function zoomStart() {
          if (d3.event.sourceEvent.toString() === '[object MouseEvent]') {
            //console.log(d3.mouse(this)[0]);
            coorX_start = d3.mouse(this)[0];
          }
        }

			function updateZoom() {
          		if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object MouseEvent]') {
		            zoom.translate([d3.event.translate[0], 0]);
		            coorX_start = translateCanvas(coorX_start, d3.mouse(this)[0]);
          			coorX_start = d3.mouse(this)[0];
		          }

		          if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object WheelEvent]') {
		            zoom.scale(d3.event.scale);
		          }
          //drawAgain();
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
          if (d3.event.sourceEvent.toString() === '[object MouseEvent]') {
            coorX_end = d3.mouse(this)[0];
            ctx.translate(coorX_end - coorX_start, 0);
            //drawAgain();
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

          // Clear the entire canvas
          var topX = 0;
          var topY = 0;
          ctx.clearRect(topX, topY, topX + canvas.node().width, topY + canvas.node().height);

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
    				.call(eventLine({ xScale: xScale, yScale: yScale, eventLineColor: config.eventLineColor}))
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
      eventLineColor: 'black'
    };
    for (var key in defaultConfig) {
      config[key] = config[key] || defaultConfig[key];
    }

    var eventLine = function eventLine(selection) {
      selection.each(function (data) {
        var nameLine = data.name;
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


        /*d3.select(this).selectAll('circle').remove();

        var circle = d3.select(this).selectAll('circle')
          .data(function(d) {
            // filter value outside of range
            return filterData(d.dates, config.xScale);
          });

        circle.enter()
          .append('circle')
          .attr('cx', function(d) {
            return config.xScale(d);
          })
          .style('fill', config.eventColor)
          .attr('cy', -5)
          .attr('r', 10)
        ;

        circle.exit().remove();*/

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

},{}]},{},[6]);
