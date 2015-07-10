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
