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
            var filteredData = filterData(d.dates, config.xScale);
            var count = filteredData.length;
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

        d3.select(this).append('text')
          .text(function(d) {
            var boundary = config.xScale.range();
            var min = boundary[0];
            var max = boundary[1];
            var total = config.xScale.invert(max).getTime() - config.xScale.invert(min).getTime();
            var count = Math.round(filterData(d.dates, config.xScale)
            .reduce(function (sum, elem) {
              return sum + elem.end.getTime() - elem.start.getTime();
            }, 0)/total*1000);
            return  (count/10) + ' %';
          })
          .attr('text-anchor', 'end')
          .attr('transform', 'translate(' + (config.width - config.margin.right - 130) + ')')
          .style('fill', 'black')
        ;
      });


    };

    configurable(eventLine, config);

    return eventLine;
  };
};
