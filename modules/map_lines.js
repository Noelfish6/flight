function MapLines(){
	var projection = d3.geoMercator();
	var m = {t:20,r:20,b:20,l:20},
		w, h, W=800, H=600;


	var exports = function(selection){
        selection
			.attr("d", function(d){
                var source = projection(d.long_lat_origin),
                    target = projection(d.long_lat_dest);
                var dx = source[0] - target[0],
                    dy = source[1] - target[1],
                    dr = Math.sqrt(dx * dx + dy * dy);
                // Create an arc from source to target with a particular curve
                return "M" + source[0] + "," + source[1] + "A" + dr + "," + dr + " 0 0,1 " + target[0] + "," + target[1];
			})
			.style('fill','none')
		    .style('stroke','blue')
		    .style('stroke-width','1px');
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
