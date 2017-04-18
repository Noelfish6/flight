//console.log(d3);

var m = {t:20,r:20,b:20,l:20},
	w = d3.select('.plot').node().clientWidth - m.l - m.r,
	h = window.innerHeight/1.3 - m.t - m.b;

var svg = d3.selectAll('.plot')
	.append('svg')
	.attr('width', w + m.l + m.r)
	.attr('height', h+ m.t + m.b)
	.append('g')
	.attr('class','canvas')
	.attr('transform','translate('+m.l+','+m.t+')');

var plot1 = svg.filter(function(d,i){ return i===0;}),
	plot2 = svg.filter(function(d,i){return i===1}).classed('time-series-radial',true),
	plot3 = svg.filter(function(d,i){return i===2}).classed('time-series',true);

var citiesMap = d3.map();
var cf, originDimension, destinationDimension, totalDimension, stationMap = d3.map();
var cfDelay, originDelayDimension;

var selectedCity = "Chicago IL";
var projection = d3.geoMercator()
        .center([-95.5795,36.8282])
        .translate([w/2, h/2])
        .scale(1000);

// dropdown list
var body = d3.select(".intorduction");
var list = d3.csvParse(d3.select("#csv").text());
var menu = body.append("select");
menu.selectAll("foo")
    .data(list)
    .enter()
    .append("option")
    .attr("value", d=>d.TPC)
    .text(d=>d.subCategory);

menu.on("change", function(){
    selectedCity = this.value;
    createVisualization();
});


d3.queue()
	.defer(d3.csv,'data/all_city.csv',parseCity)
	.defer(d3.csv,'data/dailyDelay_top5.csv',parseDelay)
	.await(dataLoaded);

function dataLoaded(err,city,delay){
    console.log(err, city[0], delay[0]);

    city.forEach(function(d) {
        citiesMap.set(d.location_dest, d.long_lat_dest);
        citiesMap.set(d.location_origin, d.long_lat_origin);
    });

	cf = crossfilter(city);
	originDimension = cf.dimension(function(d){ return d.location_origin; });
	destinationDimension = cf.dimension(function(d){ return d.location_dest; });
	totalDimension = cf.dimension(function(d){ return d.total; });

	cfDelay = crossfilter(delay);
	originDelayDimension = cfDelay.dimension(function(d){ return d.location_origin; });
	destDelayDimension = cfDelay.dimension(function(d){ return d.location_dest;});

	weatherDelayDimenstion = cfDelay.dimension(function(d){ return d.weatherDelay;});


	//Listen for changes in the dropdown menus
	d3.select('#start-station')
		.selectAll('.station')
		.on('click',function(){
			selectedCity = $(this).data('id'); //note how the 'data-id' attribute is retrieved
			originDimension.filter(location_origin.toString());
			update( originDimension.top(Infinity) );
		});

	createVisualization();
}

function createVisualization() {
	var map = Map()
        .height(600)
        .projection(projection)
        .on("circle:clicked", function(city) {
            // city = {key: "Bemidji MN", value: [-94.93372333, 47.50942417]}
            selectedCity = city.key;
            createMapLines();
            createRadialChart();
        });

	plot1.append("g")
        .classed("map", true)
        .selectAll("g")
        .data(citiesMap.entries())
        .enter()
        .append("g")
        .classed("city", true)
        .call(map);
    createMapLines();
    createRadialChart();
}

function createMapLines() {
    originDimension.filter(selectedCity);
    destinationDimension.filter(null);
    var flightsDimension = totalDimension.top(5);
    var mapLines = MapLines()
        .projection(projection);
    var flightLinesG = plot1.select(".flightLines");
    if (!flightLinesG.node()) {
        flightLinesG = plot1.append("g")
            .classed("flightLines", true);
    }
    var paths = flightLinesG
        .selectAll("path")
        .data(flightsDimension, function(d) { return d.location_origin+"-"+d.location_dest; });
    paths.exit()
        .transition()
        .style("opacity", 0)
        .remove();
    paths.enter()
        .append("path")
        .style("opacity", 0)
        .call(mapLines)
        .transition()
        .style("opacity", 1);
}

function createRadialChart() {
    originDimension.filter(selectedCity);
    destinationDimension.filter(null);
    var top5Cities = totalDimension.top(5).map(function(d){ return d.location_dest; });
    top5Cities = d3.set(top5Cities);

    originDelayDimension.filter(selectedCity);
    destDelayDimension.filter(function(d) { return top5Cities.has(d); });
    var radialData = destDelayDimension.top(Infinity);
    console.log(selectedCity, radialData);
    radialData = d3.nest()
        .key(function(d){ return d.location_dest; })
        .entries(radialData);

    var radialG = plot2.select(".radialG");
    if (!radialG.node()) {
        radialG = plot2.append("g")
            .classed("radialG", true)
            .attr("transform", "translate("+w/2+","+h/2+")");
    }
    var radialGs = radialG.selectAll("g")
        .data(radialData, function(d){ return d.key; });
    radialGs.exit()
        .transition()
        .style("opacity", 0)
        .remove();
    radialGs = radialGs
        .enter()
        .append("g")
        .merge(radialGs);

    var minDelay = d3.min(radialData, function(d){ return d3.min(d.values, function(e){ return e.depDelay; }); });
    var maxDelay = d3.max(radialData, function(d){ return d3.max(d.values, function(e){ return e.depDelay; }); });
    var scaleY = d3.scaleLinear()
        .domain([minDelay, maxDelay])
        .range([h/2, 50]);
    var departureRadial = Radial().scaleRadius(scaleY)
        .filter(function(d){ return d >= 0 ? d : 0; })
        .isOuter(false);
    var arrivalRadial = Radial().scaleRadius(scaleY)
        .filter(function(d){ return d <= 0 ? d : 0; })
        .isOuter(true);

    var departurePath = radialGs
        .selectAll("path.departure")
        .data(function(d){ return [d.values]; });
    departurePath.exit()
        .transition()
        .style("opacity", 0)
        .remove();
    departurePath.enter()
        .append("path")
        .classed("departure", true)
        .merge(departurePath)
        .call(departureRadial);

    var arrivalPath = radialGs
        .selectAll("path.arrival")
        .data(function(d){ return [d.values]; });
    arrivalPath.exit()
        .transition()
        .style("opacity", 0)
        .remove();
    arrivalPath.enter()
        .append("path")
        .classed("arrival", true)
        .merge(arrivalPath)
        .call(arrivalRadial);
}
var first = true;
function parseCity(d){
	stationMap.set(d.location_dest);
	return {
		location_dest:d.location_dest,
		location_origin:d.location_origin,
		total:+d.total,
		long_lat_origin:[+d.long_origin,+d.lat_origin],
		long_lat_dest: [+d.long_dest,+d.lat_dest]
		//long_dest:+d.long_dest,
		//lat_dest:+d.lat_dest
	};
}

function parseDelay(d){
	return {
		location_origin:d.location_origin,
		location_dest:d.location_dest,
		month:+d.Month,
		dayOfMonth:+d.DayofMonth,
		date: new Date(2008, +d.Month, +d.DayofMonth),
		depDelay:+d.DepDelay,
		cancelled:+d.Cancelled,
		weatherDelay:+d.WeatherDelay
	};
}
