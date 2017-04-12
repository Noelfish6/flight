function MapLines(){
	var projection = d3.geoMercator();
	var m = {t:20,r:20,b:20,l:20},
		w, h, W=800, H=600;


	var exports = function(selection){

		var data = selection.datum() || [];
		var pathGenerator = d3.geoPath().projection(projection); 
	
		selection.selectAll("path").remove();
		selection.selectAll("path")
			.data(data)
			.enter()
			.append("path")
			.attr("d", function(d){
				var lineData = {
					type:"Feature",
			        geometry:{
			            type:'LineString',
			            coordinates:[d.long_lat_origin,d.long_lat_dest]
			        },
			        properties:{}
				};
				return pathGenerator(lineData);
			})
			.style('fill','none')
		    .style('stroke','blue')
		    .style('stroke-width','2px');

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