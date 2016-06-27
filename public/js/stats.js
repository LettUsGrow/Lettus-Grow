"use strict";

var dummyData = [
  {
    timeStamp: 1466506805000, /* unix time in milliseconds */ 
    waterLevel: 67 /* /100 */
  },
  {
    timeStamp: 1466512212000,
    waterLevel: 61
  },
  {
    timeStamp: 1466525700000,
    waterLevel: 20
  }
];

window.stats = (function() {
  var els = document.getElementsByClassName('stats-for-pot');

  for(var elNum = 0; elNum < els.length; elNum++) {
    chart(els[elNum])();
  }
})();

function chart(selection) {
  function my() {
    // Document setup
    var margin = {top: 1, right: 1, bottom: 25, left: 1},
        width = selection.offsetWidth - margin.left - margin.right,
        height = selection.offsetHeight - margin.top - margin.bottom;

    // Axes
    var x = d3.scaleTime().range([0, width]).domain(d3.extent(dummyData, function(d) { return d.timeStamp; })),
        y = d3.scaleLinear().range([0, height]).domain([100, 0]);

    var xAxis = d3.axisBottom(x).ticks(5).tickSizeOuter(0),
        yAxis = d3.axisLeft(y).ticks(0).tickSizeOuter(0);

    var line = d3.line()
      .x(function(d) { return x(d.timeStamp); })
      .y(function(d) { return y(d.waterLevel); });
    
    var svg = d3.select(selection).append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
        .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append('g').attr('class', 'x axis').call(xAxis)
      .attr('transform', 'translate(0,' + height + ')');
    svg.append('g').attr('class', 'y axis').call(yAxis);

    svg.append("path")
      .datum(dummyData)
      .attr("class", "line")
      .attr("d", line);
  };
  return my;
}