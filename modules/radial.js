function Radial(){

	var m = {t:20,r:20,b:20,l:20},
		w = d3.select('.plot').node().clientWidth - m.l - m.r,
		h = d3.select('.plot').node().clientHeight - m.t - m.b;

	var exports = function(selection){

		var delay = selection.datum()?selection.datum():[];
		var _isDeparture = true;
		var MIN_DURATION = -600, MAX_DURATION = 5000;

		var delayPoints = delay.map(function(d, i) {
	  		var angle = Math.PI*2*(i/366);
	  		var delayTime;
	  		if (_isDeparture) {
	  			delayTime = d.depDelay >= 0? +d.depDelay: 0;
	  		} else {
	  			0;
	  			//delayTime = d.depDelay < 0? +d.depDelay: 0;
	  		}
	  		return { angle: angle, delay: delayTime};
		});

		var aheadPoints = delay.map(function(d, i) {
	  		var angle = Math.PI*2*(i/366);
	  		var aheadTime;
	  		if (_isDeparture) {
	  			aheadTime = d.depDelay < 0? +d.depDelay: 0;
	  		} else {
	  			0;
	  		}
	  		return { angle: angle, delay: aheadTime*-1};
		});

		// --- origin codes --- //
		// 	var delayPoints = delay.map(function(d, i) {
	 	//  		var angle = Math.PI*2*(i/366);
	 	//  		var delayTime;
	 	//  		if (_isDeparture) {
	 	//  			delayTime = d.depDelay >= 0? +d.depDelay: 0;
	 	//  		} else {
	 	//  			delayTime = d.depDelay < 0? +d.depDelay: 0;
	 	//  		}
	 	//  		return { angle: angle, delay: delayTime};
		// });



		var maxDelay = d3.max(delayPoints, function(d){ return d.delay; });
		var maxAhead = d3.max(aheadPoints, function(d){ return d.delay; });
		// console.log("delayPoints", maxDelay, delayPoints);
		// console.log("aheadPoints", maxAhead, aheadPoints);

		var delayScaleY = d3.scaleLinear().domain([0, maxDelay]).range([10, h/2 - 150]);
		var aheadScaleY = d3.scaleLinear().domain([0, maxAhead]).range([10, h/2 - 150]);

		var delayRadialAreaGenerator = d3.radialArea()
			.angle(function(d){ return d.angle; })
			.outerRadius(function(d){ return delayScaleY(d.delay); })
			.innerRadius(10);

		var aheadRadialAreaGenerator = d3.radialArea()
			.angle(function(d){ return d.angle; })
			.outerRadius(function(d){ return aheadScaleY(d.delay); })
			.innerRadius(10);

		selection
			.append('path')
			.datum(delayPoints)
			.attr('d', delayRadialAreaGenerator);

		selection
			.append('path')
			.datum(aheadPoints)
			.attr('d', aheadRadialAreaGenerator);

		};

		exports.isDeparture = function(d) {
			if(!arguments.length) {
				return _isDeparture;
			}
			_isDeparture = d;
			return this;
	};

	return exports;


}
