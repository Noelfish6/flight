function Map(){
	var projection;
	var m = {t:20,r:20,b:20,l:20},
		w, h, W=800, H=600;

    var _dis = d3.dispatch("circle:clicked");

	var exports = function(selection){
		//Reset width and height and projection
		W = Math.max(selection.node().clientWidth, W);
		H = Math.max(selection.node().clientHeight, H);
		w = W - m.l - m.r;
		h = H - m.t - m.b;

    	var circles = selection
            .attr("transform", function(d){
				var xy = projection(d.value);
                if (!xy) { return ""; }
				return 'translate('+xy[0]+','+xy[1]+')';
			})
            .append("circle");
        circles.style('fill','rgba(255, 255, 255, 0.6)')
            .style('stroke','grey')
            .style('stroke-width', 1)
            .attr("r", 0)
            .on('click',function(d){
				_dis.call('circle:clicked', null, d);
			})
            .transition()
            .attr("r", 4);

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

    exports.on = function(){
		_dis.on.apply(_dis,arguments);
		return this;
	};

	return exports;
}
