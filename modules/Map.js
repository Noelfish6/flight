function Map(){
	var projection;
	var m = {t:20,r:20,b:20,l:20},
		w, h, W=800, H=600;


	var exports = function(div){
		// console.log('test', div);
		//Reset width and height and projection
		W = Math.max(div.node().clientWidth, W);
		H = Math.max(div.node().clientHeight, H);
		w = W - m.l - m.r;
		h = H - m.t - m.b;

		div.style('width',W+'px')
			.style('height',H+'px');

		var datum = div.datum() || [];
		// console.log(datum);
		//Append DOM
		var svgEnter = div.select('svg');
		var plotEnter = svgEnter.append('g').attr('class','map');

		svgEnter.append('rect')
			.attr('x',0)
			.attr('y',0)
			.attr('width',W) //same size with svg, W
			.attr('height',H)
			.style('fill','none')
			.style('pointer-events','all');

		plot = svgEnter.merge(svg)
			.attr('width',W)
			.attr('height',H)
			.select('.map')
			.attr('transform','translate('+m.l+','+m.t+')');

	//Draw dots
	var city = plot.selectAll('.city')
			.data(datum);
	var cityEnter = city.enter()
			.append('g').attr('class','city');
		cityEnter.append('circle').attr('r',5)
			.style('fill','none').style('stroke','grey');
		cityEnter.append('city').attr('r',2)
			.style('stroke','grey');
		city.merge(cityEnter)
			.attr('transform',function(d){
				var xy = projection(d.long_lat_origin);
				return 'translate('+xy[0]+','+xy[1]+')';
			});

	city.exit().remove();

	};

	exports.width = function(_){
		if(!arguments.length) return W;
		W = _;
		return this;
	};

	exports.height = function(_){
		if(!arguments.length) return H;
		H = _;
		return this;
	};

	exports.projection = function(d) {
		if (d) {
			projection = d;
			return this;
		}
		return projection;
	};

	return exports;
}