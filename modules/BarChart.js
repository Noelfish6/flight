function BarChart() {

	var m = {t:20,r:20,b:20,l:20},
	w = d3.select('.plot').node().clientWidth - m.l - m.r,
	h = d3.select('.plot').node().clientHeight - m.t - m.b;

	var exports = function(selection){
		var delay = selection.datum()?selection.datum():[];
		var x = d3.scaleBand().rangeRound([0, w]).padding(0.1),
   			y = d3.scaleLinear().rangeRound([h, 0]);

		var g = d3.select('#plot3').append("g")
			.classed("bar", true)
		    .attr("transform", "translate(" + m.l + "," + m.t + ")");

		x.domain(delay.map(function(d) { return d.date; }));
  		y.domain([0, d3.max(delay, function(d) { return d.weatherDelay; })]);

  		// g.append("g")
		  //   .attr("class", "axis axis--x")
		  //   .attr("transform", "translate(0," + h + ")")
		  //   .call(d3.axisBottom(x));

	  	// g.append("g")
	   //    	.attr("class", "axis axis--y")
	   //    	.call(d3.axisLeft(y).ticks(10, "%"))
	   //  	.append("text")
		  //   .attr("transform", "rotate(-90)")
	   //    	.attr("y", 6)
	   //    	.attr("dy", "0.71em")
	   //    	.attr("text-anchor", "end");
	   //    	.text("Frequency");
		g.selectAll(".bar")
		    .data(delay)
		    .enter()
		    .append("rect")
		    .attr("class", "bar")
		    .attr("x", function(d) { return x(d.date); })
		    .attr("y", function(d) { return y(d.weatherDelay); })
		    .attr("width", x.bandwidth())
		    .attr("height", function(d) {return h - y(d.weatherDelay); });


	};

	return exports;
}
