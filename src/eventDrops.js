(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./util/configurable":6}],2:[function(require,module,exports){
"use strict";
/* global require, module */

var configurable = require('./util/configurable');

module.exports = function (d3) {
  var eventLine = require('./eventLine')(d3);
  var delimiter = require('./delimiter')(d3);

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
        var graphHeight = data.length * 20;
        var height = graphHeight + config.margin.top + config.margin.bottom;

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
          yRange.push(index * 20);
        });

        yScale.domain(yDomain).range(yRange);

        var yAxisEl = graph.append('g')
          .classed('y-axis', true)
          .attr('transform', 'translate(0, 50)');

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

          var y = (where == 'bottom' ? parseInt(graphHeight) : 0) + config.margin.top - 30;

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
            .call(eventLine({ xScale: xScale, eventColor: config.eventColor }))
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

},{"./delimiter":1,"./eventLine":3,"./util/configurable":6}],3:[function(require,module,exports){
"use strict";
/* global require, module, d3 */

var configurable = require('./util/configurable');
var filterData = require('./filterData');

var defaultConfig = {
  xScale: null
};

module.exports = function (d3) {
  return function (config) {

    config = config || {
      xScale: null,
      eventColor: null
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

        d3.select(this).selectAll('rect').remove();

        var circle = d3.select(this).selectAll('rect')
          .data(function(d) {
            // filter value outside of range
            return filterData(d.dates, config.xScale);
          });

        circle.enter()
          .append('rect')
          .attr('x', function(d) {
            return config.xScale(d.start);
          })
          .attr('width', function(d) {
            return config.xScale(d.end) - config.xScale(d.start);
          })
          .style('fill', config.eventColor)
          .attr('y', -10)
          .attr('height', 10)
        ;

        circle.exit().remove();

      });
    };

    configurable(eventLine, config);

    return eventLine;
  };
};

},{"./filterData":4,"./util/configurable":6}],4:[function(require,module,exports){
"use strict";
/* global module */

module.exports = function filterDate(data, scale) {
  data = data || [];
  var filteredData = [];
  var boundary = scale.range();
  var min = boundary[0];
  var max = boundary[1];
  data.forEach(function (datum) {
    var valueS = scale(datum.start);
    var valueE = scale(datum.end);
    if (valueE < min || valueE > max || valueS < min || valueS > max) {
      return;
    }
    filteredData.push(datum);
  });

  return filteredData;
};

},{}],5:[function(require,module,exports){
"use strict";
/* global require, define, module */

var eventDrops = require('./eventDrops');

if (typeof define === "function" && define.amd) {
  define('d3.chart.eventDrops', ["d3"], function (d3) {
    d3.chart = d3.chart || {};
    d3.chart.eventDrops = eventDrops(d3);
  });
} else if (window) {
  window.d3.chart = window.d3.chart || {};
  window.d3.chart.eventDrops = eventDrops(window.d3);
} else {
  module.exports = eventDrops;
}

},{"./eventDrops":2}],6:[function(require,module,exports){
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

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2RlbGltaXRlci5qcyIsImxpYi9ldmVudERyb3BzLmpzIiwibGliL2V2ZW50TGluZS5qcyIsImxpYi9maWx0ZXJEYXRhLmpzIiwibGliL21haW4uanMiLCJsaWIvdXRpbC9jb25maWd1cmFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgeFNjYWxlOiBudWxsLFxuICBkYXRlRm9ybWF0OiBudWxsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkMykge1xuXG4gIHJldHVybiBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRDb25maWcpIHtcbiAgICAgIGNvbmZpZ1trZXldID0gY29uZmlnW2tleV0gfHwgZGVmYXVsdENvbmZpZ1trZXldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGltaXRlcihzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgbGltaXRzID0gY29uZmlnLnhTY2FsZS5kb21haW4oKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0ZUZvcm1hdChsaW1pdHNbMF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNsYXNzZWQoJ3N0YXJ0JywgdHJ1ZSlcbiAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5kYXRlRm9ybWF0KGxpbWl0c1sxXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLnhTY2FsZS5yYW5nZSgpWzFdICsgJyknKVxuICAgICAgICAgIC5jbGFzc2VkKCdlbmQnLCB0cnVlKVxuICAgICAgICA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25maWd1cmFibGUoZGVsaW1pdGVyLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGRlbGltaXRlcjtcbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUgKi9cblxudmFyIGNvbmZpZ3VyYWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9jb25maWd1cmFibGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMpIHtcbiAgdmFyIGV2ZW50TGluZSA9IHJlcXVpcmUoJy4vZXZlbnRMaW5lJykoZDMpO1xuICB2YXIgZGVsaW1pdGVyID0gcmVxdWlyZSgnLi9kZWxpbWl0ZXInKShkMyk7XG5cbiAgdmFyIGRlZmF1bHRDb25maWcgPSB7XG4gICAgc3RhcnQ6IG5ldyBEYXRlKDApLFxuICAgIGVuZDogbmV3IERhdGUoKSxcbiAgICBtaW5TY2FsZTogMCxcbiAgICBtYXhTY2FsZTogSW5maW5pdHksXG4gICAgd2lkdGg6IDEwMDAsXG4gICAgbWFyZ2luOiB7XG4gICAgICB0b3A6IDYwLFxuICAgICAgbGVmdDogMjAwLFxuICAgICAgYm90dG9tOiA0MCxcbiAgICAgIHJpZ2h0OiA1MFxuICAgIH0sXG4gICAgbG9jYWxlOiBudWxsLFxuICAgIGF4aXNGb3JtYXQ6IG51bGwsXG4gICAgdGlja0Zvcm1hdDogW1xuICAgICAgICBbXCIuJUxcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRNaWxsaXNlY29uZHMoKTsgfV0sXG4gICAgICAgIFtcIjolU1wiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmdldFNlY29uZHMoKTsgfV0sXG4gICAgICAgIFtcIiVJOiVNXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TWludXRlcygpOyB9XSxcbiAgICAgICAgW1wiJUkgJXBcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXRIb3VycygpOyB9XSxcbiAgICAgICAgW1wiJWEgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXkoKSAmJiBkLmdldERhdGUoKSAhPSAxOyB9XSxcbiAgICAgICAgW1wiJWIgJWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5nZXREYXRlKCkgIT0gMTsgfV0sXG4gICAgICAgIFtcIiVCXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZ2V0TW9udGgoKTsgfV0sXG4gICAgICAgIFtcIiVZXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfV1cbiAgICBdLFxuICAgIGV2ZW50SG92ZXI6IG51bGwsXG4gICAgZXZlbnRab29tOiBudWxsLFxuICAgIGV2ZW50Q2xpY2s6IG51bGwsXG4gICAgaGFzRGVsaW1pdGVyOiB0cnVlLFxuICAgIGhhc1RvcEF4aXM6IHRydWUsXG4gICAgaGFzQm90dG9tQXhpczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHJldHVybiBkYXRhLmxlbmd0aCA+PSAxMDtcbiAgICB9LFxuICAgIGV2ZW50TGluZUNvbG9yOiAnYmxhY2snLFxuICAgIGV2ZW50Q29sb3I6IG51bGxcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24gZXZlbnREcm9wcyhjb25maWcpIHtcbiAgICB2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuICAgIHZhciB5U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKCk7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0Q29uZmlnKSB7XG4gICAgICBjb25maWdba2V5XSA9IGNvbmZpZ1trZXldIHx8IGRlZmF1bHRDb25maWdba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBldmVudERyb3BHcmFwaChzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciB6b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpLmNlbnRlcihudWxsKS5zY2FsZUV4dGVudChbY29uZmlnLm1pblNjYWxlLCBjb25maWcubWF4U2NhbGVdKS5vbihcInpvb21cIiwgdXBkYXRlWm9vbSk7XG5cbiAgICAgICAgem9vbS5vbihcInpvb21lbmRcIiwgem9vbUVuZCk7XG5cbiAgICAgICAgdmFyIGdyYXBoV2lkdGggPSBjb25maWcud2lkdGggLSBjb25maWcubWFyZ2luLnJpZ2h0IC0gY29uZmlnLm1hcmdpbi5sZWZ0O1xuICAgICAgICB2YXIgZ3JhcGhIZWlnaHQgPSBkYXRhLmxlbmd0aCAqIDIwO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gZ3JhcGhIZWlnaHQgKyBjb25maWcubWFyZ2luLnRvcCArIGNvbmZpZy5tYXJnaW4uYm90dG9tO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoJ3N2ZycpLnJlbW92ZSgpO1xuXG4gICAgICAgIHZhciBzdmcgPSBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAuYXBwZW5kKCdzdmcnKVxuICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIGNvbmZpZy53aWR0aClcbiAgICAgICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxuICAgICAgICA7XG5cbiAgICAgICAgdmFyIGdyYXBoID0gc3ZnLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgMjUpJyk7XG5cbiAgICAgICAgdmFyIHlEb21haW4gPSBbXTtcbiAgICAgICAgdmFyIHlSYW5nZSA9IFtdO1xuXG4gICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQsIGluZGV4KSB7XG4gICAgICAgICAgeURvbWFpbi5wdXNoKGV2ZW50Lm5hbWUpO1xuICAgICAgICAgIHlSYW5nZS5wdXNoKGluZGV4ICogMjApO1xuICAgICAgICB9KTtcblxuICAgICAgICB5U2NhbGUuZG9tYWluKHlEb21haW4pLnJhbmdlKHlSYW5nZSk7XG5cbiAgICAgICAgdmFyIHlBeGlzRWwgPSBncmFwaC5hcHBlbmQoJ2cnKVxuICAgICAgICAgIC5jbGFzc2VkKCd5LWF4aXMnLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsIDUwKScpO1xuXG4gICAgICAgIHZhciB5VGljayA9IHlBeGlzRWwuYXBwZW5kKCdnJykuc2VsZWN0QWxsKCdnJykuZGF0YSh5RG9tYWluKTtcblxuICAgICAgICB5VGljay5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKDAsICcgKyB5U2NhbGUoZCkgKyAnKSc7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgICAuY2xhc3NlZCgneS10aWNrJywgdHJ1ZSlcbiAgICAgICAgICAuYXR0cigneDEnLCBjb25maWcubWFyZ2luLmxlZnQpXG4gICAgICAgICAgLmF0dHIoJ3gyJywgY29uZmlnLm1hcmdpbi5sZWZ0ICsgZ3JhcGhXaWR0aCk7XG5cbiAgICAgICAgeVRpY2suZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgICAgIHZhciBjdXJ4LCBjdXJ5O1xuICAgICAgICB2YXIgem9vbVJlY3QgPSBzdmdcbiAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgICAuY2FsbCh6b29tKVxuICAgICAgICAgIC5jbGFzc2VkKCd6b29tJywgdHJ1ZSlcbiAgICAgICAgICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAzNSknKVxuICAgICAgICA7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcuZXZlbnRIb3ZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHpvb21SZWN0Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihkLCBlKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBkMy5ldmVudDtcbiAgICAgICAgICAgIGlmIChjdXJ4ID09IGV2ZW50LmNsaWVudFggJiYgY3VyeSA9PSBldmVudC5jbGllbnRZKSByZXR1cm47XG4gICAgICAgICAgICBjdXJ4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgICAgIGN1cnkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICAgICAgem9vbVJlY3QuYXR0cignZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuICAgICAgICAgICAgem9vbVJlY3QuYXR0cignZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICAgICAgaWYgKGVsLnRhZ05hbWUgIT09ICdjaXJjbGUnKSByZXR1cm47XG4gICAgICAgICAgICBjb25maWcuZXZlbnRIb3ZlcihlbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy5ldmVudENsaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgem9vbVJlY3Qub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgem9vbVJlY3QuYXR0cignZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGQzLmV2ZW50LmNsaWVudFgsIGQzLmV2ZW50LmNsaWVudFkpO1xuICAgICAgICAgICAgem9vbVJlY3QuYXR0cignZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICAgICAgaWYgKGVsLnRhZ05hbWUgIT09ICdjaXJjbGUnKSByZXR1cm47XG4gICAgICAgICAgICBjb25maWcuZXZlbnRDbGljayhlbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB4U2NhbGUucmFuZ2UoWzAsIGdyYXBoV2lkdGhdKS5kb21haW4oW2NvbmZpZy5zdGFydCwgY29uZmlnLmVuZF0pO1xuXG4gICAgICAgIHpvb20ueCh4U2NhbGUpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVpvb20oKSB7XG4gICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IE1vdXNlRXZlbnRdJykge1xuICAgICAgICAgICAgem9vbS50cmFuc2xhdGUoW2QzLmV2ZW50LnRyYW5zbGF0ZVswXSwgMF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b1N0cmluZygpID09PSAnW29iamVjdCBXaGVlbEV2ZW50XScpIHtcbiAgICAgICAgICAgIHpvb20uc2NhbGUoZDMuZXZlbnQuc2NhbGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVkcmF3RGVsaW1pdGVyKCkge1xuICAgICAgICAgIHN2Zy5zZWxlY3QoJy5kZWxpbWl0ZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICB2YXIgZGVsaW1pdGVyRWwgPSBzdmdcbiAgICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ2RlbGltaXRlcicsIHRydWUpXG4gICAgICAgICAgICAuYXR0cignd2lkdGgnLCBncmFwaFdpZHRoKVxuICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIDEwKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbmZpZy5tYXJnaW4ubGVmdCArICcsICcgKyAoY29uZmlnLm1hcmdpbi50b3AgLSA0NSkgKyAnKScpXG4gICAgICAgICAgICAuY2FsbChkZWxpbWl0ZXIoe1xuICAgICAgICAgICAgICB4U2NhbGU6IHhTY2FsZSxcbiAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdChcIiVkICVCICVZXCIpIDogZDMudGltZS5mb3JtYXQoXCIlZCAlQiAlWVwiKVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gem9vbUVuZCgpIHtcbiAgICAgICAgICBpZiAoY29uZmlnLmV2ZW50Wm9vbSkge1xuICAgICAgICAgICAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY29uZmlnLmhhc0RlbGltaXRlcikge1xuICAgICAgICAgICAgcmVkcmF3RGVsaW1pdGVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhd1hBeGlzKHdoZXJlKSB7XG5cbiAgICAgICAgICAvLyBjb3B5IGNvbmZpZy50aWNrRm9ybWF0IGJlY2F1c2UgZDMgZm9ybWF0Lm11bHRpIGVkaXQgaXRzIGdpdmVuIHRpY2tGb3JtYXQgZGF0YVxuICAgICAgICAgIHZhciB0aWNrRm9ybWF0RGF0YSA9IFtdO1xuXG4gICAgICAgICAgY29uZmlnLnRpY2tGb3JtYXQuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgdmFyIHRpY2sgPSBpdGVtLnNsaWNlKDApO1xuICAgICAgICAgICAgdGlja0Zvcm1hdERhdGEucHVzaCh0aWNrKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZhciB0aWNrRm9ybWF0ID0gY29uZmlnLmxvY2FsZSA/IGNvbmZpZy5sb2NhbGUudGltZUZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSkgOiBkMy50aW1lLmZvcm1hdC5tdWx0aSh0aWNrRm9ybWF0RGF0YSk7XG4gICAgICAgICAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAgICAgLnNjYWxlKHhTY2FsZSlcbiAgICAgICAgICAgIC5vcmllbnQod2hlcmUpXG4gICAgICAgICAgICAudGlja0Zvcm1hdCh0aWNrRm9ybWF0KVxuICAgICAgICAgIDtcblxuICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnLmF4aXNGb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNvbmZpZy5heGlzRm9ybWF0KHhBeGlzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgeSA9ICh3aGVyZSA9PSAnYm90dG9tJyA/IHBhcnNlSW50KGdyYXBoSGVpZ2h0KSA6IDApICsgY29uZmlnLm1hcmdpbi50b3AgLSAzMDtcblxuICAgICAgICAgIGdyYXBoLnNlbGVjdCgnLngtYXhpcy4nICsgd2hlcmUpLnJlbW92ZSgpO1xuICAgICAgICAgIHZhciB4QXhpc0VsID0gZ3JhcGhcbiAgICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ3gtYXhpcycsIHRydWUpXG4gICAgICAgICAgICAuY2xhc3NlZCh3aGVyZSwgdHJ1ZSlcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb25maWcubWFyZ2luLmxlZnQgKyAnLCAnICsgeSArICcpJylcbiAgICAgICAgICAgIC5jYWxsKHhBeGlzKVxuICAgICAgICAgIDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlZHJhdygpIHtcblxuICAgICAgICAgIHZhciBoYXNUb3BBeGlzID0gdHlwZW9mIGNvbmZpZy5oYXNUb3BBeGlzID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmhhc1RvcEF4aXMoZGF0YSkgOiBjb25maWcuaGFzVG9wQXhpcztcbiAgICAgICAgICBpZiAoaGFzVG9wQXhpcykge1xuICAgICAgICAgICAgZHJhd1hBeGlzKCd0b3AnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgaGFzQm90dG9tQXhpcyA9IHR5cGVvZiBjb25maWcuaGFzQm90dG9tQXhpcyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5oYXNCb3R0b21BeGlzKGRhdGEpIDogY29uZmlnLmhhc0JvdHRvbUF4aXM7XG4gICAgICAgICAgaWYgKGhhc0JvdHRvbUF4aXMpIHtcbiAgICAgICAgICAgIGRyYXdYQXhpcygnYm90dG9tJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgem9vbS5zaXplKFtjb25maWcud2lkdGgsIGhlaWdodF0pO1xuXG4gICAgICAgICAgZ3JhcGguc2VsZWN0KCcuZ3JhcGgtYm9keScpLnJlbW92ZSgpO1xuICAgICAgICAgIHZhciBncmFwaEJvZHkgPSBncmFwaFxuICAgICAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgICAgICAuY2xhc3NlZCgnZ3JhcGgtYm9keScsIHRydWUpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29uZmlnLm1hcmdpbi5sZWZ0ICsgJywgJyArIChjb25maWcubWFyZ2luLnRvcCAtIDE1KSArICcpJyk7XG5cbiAgICAgICAgICB2YXIgbGluZXMgPSBncmFwaEJvZHkuc2VsZWN0QWxsKCdnJykuZGF0YShkYXRhKTtcblxuICAgICAgICAgIGxpbmVzLmVudGVyKClcbiAgICAgICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ2xpbmUnLCB0cnVlKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoMCwnICsgeVNjYWxlKGQubmFtZSkgKyAnKSc7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgY29uZmlnLmV2ZW50TGluZUNvbG9yKVxuICAgICAgICAgICAgLmNhbGwoZXZlbnRMaW5lKHsgeFNjYWxlOiB4U2NhbGUsIGV2ZW50Q29sb3I6IGNvbmZpZy5ldmVudENvbG9yIH0pKVxuICAgICAgICAgIDtcblxuICAgICAgICAgIGxpbmVzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlZHJhdygpO1xuICAgICAgICBpZiAoY29uZmlnLmhhc0RlbGltaXRlcikge1xuICAgICAgICAgIHJlZHJhd0RlbGltaXRlcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcuZXZlbnRab29tKSB7XG4gICAgICAgICAgY29uZmlnLmV2ZW50Wm9vbSh4U2NhbGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25maWd1cmFibGUoZXZlbnREcm9wR3JhcGgsIGNvbmZpZyk7XG5cbiAgICByZXR1cm4gZXZlbnREcm9wR3JhcGg7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgbW9kdWxlLCBkMyAqL1xuXG52YXIgY29uZmlndXJhYmxlID0gcmVxdWlyZSgnLi91dGlsL2NvbmZpZ3VyYWJsZScpO1xudmFyIGZpbHRlckRhdGEgPSByZXF1aXJlKCcuL2ZpbHRlckRhdGEnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gIHhTY2FsZTogbnVsbFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZDMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7XG4gICAgICB4U2NhbGU6IG51bGwsXG4gICAgICBldmVudENvbG9yOiBudWxsXG4gICAgfTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xuICAgICAgY29uZmlnW2tleV0gPSBjb25maWdba2V5XSB8fCBkZWZhdWx0Q29uZmlnW2tleV07XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50TGluZSA9IGZ1bmN0aW9uIGV2ZW50TGluZShzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RleHQnKS5yZW1vdmUoKTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICB2YXIgY291bnQgPSBmaWx0ZXJEYXRhKGQuZGF0ZXMsIGNvbmZpZy54U2NhbGUpLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBkLm5hbWUgKyAoY291bnQgPiAwID8gJyAoJyArIGNvdW50ICsgJyknIDogJycpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoLTIwKScpXG4gICAgICAgICAgLnN0eWxlKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3JlY3QnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgY2lyY2xlID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgncmVjdCcpXG4gICAgICAgICAgLmRhdGEoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgLy8gZmlsdGVyIHZhbHVlIG91dHNpZGUgb2YgcmFuZ2VcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJEYXRhKGQuZGF0ZXMsIGNvbmZpZy54U2NhbGUpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNpcmNsZS5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgLmF0dHIoJ3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLnhTY2FsZShkLnN0YXJ0KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25maWcueFNjYWxlKGQuZW5kKSAtIGNvbmZpZy54U2NhbGUoZC5zdGFydCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuc3R5bGUoJ2ZpbGwnLCBjb25maWcuZXZlbnRDb2xvcilcbiAgICAgICAgICAuYXR0cigneScsIC0xMClcbiAgICAgICAgICAuYXR0cignaGVpZ2h0JywgMTApXG4gICAgICAgIDtcblxuICAgICAgICBjaXJjbGUuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uZmlndXJhYmxlKGV2ZW50TGluZSwgY29uZmlnKTtcblxuICAgIHJldHVybiBldmVudExpbmU7XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgbW9kdWxlICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmlsdGVyRGF0ZShkYXRhLCBzY2FsZSkge1xuICBkYXRhID0gZGF0YSB8fCBbXTtcbiAgdmFyIGZpbHRlcmVkRGF0YSA9IFtdO1xuICB2YXIgYm91bmRhcnkgPSBzY2FsZS5yYW5nZSgpO1xuICB2YXIgbWluID0gYm91bmRhcnlbMF07XG4gIHZhciBtYXggPSBib3VuZGFyeVsxXTtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkYXR1bSkge1xuICAgIHZhciB2YWx1ZVMgPSBzY2FsZShkYXR1bS5zdGFydCk7XG4gICAgdmFyIHZhbHVlRSA9IHNjYWxlKGRhdHVtLmVuZCk7XG4gICAgaWYgKHZhbHVlRSA8IG1pbiB8fCB2YWx1ZUUgPiBtYXggfHwgdmFsdWVTIDwgbWluIHx8IHZhbHVlUyA+IG1heCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmaWx0ZXJlZERhdGEucHVzaChkYXR1bSk7XG4gIH0pO1xuXG4gIHJldHVybiBmaWx0ZXJlZERhdGE7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiBnbG9iYWwgcmVxdWlyZSwgZGVmaW5lLCBtb2R1bGUgKi9cblxudmFyIGV2ZW50RHJvcHMgPSByZXF1aXJlKCcuL2V2ZW50RHJvcHMnKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZSgnZDMuY2hhcnQuZXZlbnREcm9wcycsIFtcImQzXCJdLCBmdW5jdGlvbiAoZDMpIHtcbiAgICBkMy5jaGFydCA9IGQzLmNoYXJ0IHx8IHt9O1xuICAgIGQzLmNoYXJ0LmV2ZW50RHJvcHMgPSBldmVudERyb3BzKGQzKTtcbiAgfSk7XG59IGVsc2UgaWYgKHdpbmRvdykge1xuICB3aW5kb3cuZDMuY2hhcnQgPSB3aW5kb3cuZDMuY2hhcnQgfHwge307XG4gIHdpbmRvdy5kMy5jaGFydC5ldmVudERyb3BzID0gZXZlbnREcm9wcyh3aW5kb3cuZDMpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBldmVudERyb3BzO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb25maWd1cmFibGUodGFyZ2V0RnVuY3Rpb24sIGNvbmZpZywgbGlzdGVuZXJzKSB7XG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycyB8fCB7fTtcbiAgZm9yICh2YXIgaXRlbSBpbiBjb25maWcpIHtcbiAgICAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdGFyZ2V0RnVuY3Rpb25baXRlbV0gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjb25maWdbaXRlbV07XG4gICAgICAgIGNvbmZpZ1tpdGVtXSA9IHZhbHVlO1xuICAgICAgICBpZiAobGlzdGVuZXJzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgbGlzdGVuZXJzW2l0ZW1dKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXRGdW5jdGlvbjtcbiAgICAgIH07XG4gICAgfSkoaXRlbSk7IC8vIGZvciBkb2Vzbid0IGNyZWF0ZSBhIGNsb3N1cmUsIGZvcmNpbmcgaXRcbiAgfVxufTtcbiJdfQ==
