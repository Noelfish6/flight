function Radial(){

	var m = {t:20,r:20,b:20,l:20},
		w = d3.select('.plot').node().clientWidth - m.l - m.r,
		h = d3.select('.plot').node().clientHeight - m.t - m.b,
        _isOuter = true,
        _scaleRadius, _filter;

	var exports = function(selection){
        var scaleAngle = d3.scaleTime()
            .domain([new Date(2008, 0, 1), new Date(2009, 0, 1)])
            .range([0, Math.PI*2]);

        var delayRadialAreaGenerator = d3.radialArea()
			.angle(function(d){ return scaleAngle(d.date); })
			.outerRadius(function(d){
                var value = _filter(d.depDelay);
                return _isOuter ? _scaleRadius(value) : _scaleRadius(0);
            })
			.innerRadius(function(d){
                var value = _filter(d.depDelay);
                return !_isOuter ? _scaleRadius(value) : _scaleRadius(0);
            });

        selection.attr("d", function(d){
            data = d.sort(function(a, b){
                return a.date.valueOf() - b.date.valueOf();
            });
            return delayRadialAreaGenerator(data);
        });

	};

    exports.scaleRadius = function(d) {
        if (!arguments.length) { return _scaleRadius; }
        _scaleRadius = d;
        return this;
    };

    exports.isOuter = function(d) {
        if (!arguments.length) { return _isOuter; }
        _isOuter = d;
        return this;
    };

    exports.filter = function(d) {
        if (!arguments.length) { return _filter; }
        _filter = d;
        return this;
    };

	return exports;
}
