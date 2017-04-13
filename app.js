//console.log(d3);

var m = {t:20,r:20,b:20,l:20},
	w = d3.select('.plot').node().clientWidth - m.l - m.r,
	h = d3.select('.plot').node().clientHeight - m.t - m.b;

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


var cf, originDimension, destinationDimension, totalDimension;
var cfDelay, originDelayDimension;

var selectedCity = "Boston MA";

// dropdown list
var body = d3.select("body");
var list = d3.csvParse(d3.select("#csv").text());
var menu = body.append("select");
menu.selectAll("foo")
    .data(list)
    .enter()
    .append("option")
    .attr("value", d=>d.TPC)
    .text(d=>d.subCategory);

menu.on("change", function(){
    console.log(this.value);
});

//var selectedCity = function(d){return this.value};


svg.append('rect')
	.attr('x',0)
	.attr('y',0)
	.attr('width', w + m.l + m.r)
	.attr('height', h + m.t + m.b)
	.style('fill', 'none')
	.style('pointer-events', 'all');


d3.queue()
	.defer(d3.csv,'data/all_city.csv',parseCity)
	.defer(d3.csv,'data/dailyDelay_top5.csv',parseDelay)
	.await(dataLoaded);

function dataLoaded(err,city,delay){

	cf = crossfilter(city);
	originDimension = cf.dimension(function(d){ return d.location_origin; });
	destinationDimension = cf.dimension(function(d){ return d.location_dest; });
	totalDimension = cf.dimension(function(d){ return d.total; });

	cfDelay = crossfilter(delay);
	originDelayDimension = cfDelay.dimension(function(d){ return d.location_origin; });
	destDelayDimension = cfDelay.dimension(function(d){ return d.location_dest;});
	
	weatherDelayDimenstion = cfDelay.dimension(function(d){ return d.weatherDelay;});

	createVisualization();
}

function createVisualization() {
	var projection = d3.geoMercator()
			.center([-95.5795,45.8282])
			.translate([w/2, h/2])
			.scale(700);

	var map = Map().height(600).projection(projection);

	// Q1: try to add map path
	// var projection = d3.geoAlbersUsa()
	
	// var pathGenerator = d3.geoPath().projection(projection);
	// d3.json('gz_2010_us_050_00_5m.json', map_dataloaded);
	
	// function map_dataloaded(err, map_data){
	// 	console.log(map_data);
	// 	var states = d3.select('#plot1').selectAll('.state')
	//         .data(map_data.features)
	//         .enter()
	//         .append('path').attr('class','state')
	//         .attr('d',pathGenerator)
	//         .style('fill','rgb(200,200,200)');
	// }
	 
	// delay data is not consoled 
	//why need null?

	originDimension.filter(null);
	destinationDimension.filter(null);
	d3.select('#plot1').datum(originDimension.top(Infinity)).call(map);
	console.log(selectedCity)
	originDimension.filter(selectedCity);

	var flightsDimension = totalDimension.top(5);
	var mapLines = MapLines().projection(projection);
	plot1.append("g").classed("flightLines", true).datum(flightsDimension).call(mapLines);


	var radial = Radial();
	console.log(flightsDimension.length)
	
	flightsDimension.forEach(function(d, i) { //filter from different data frames can be used together?
		console.log(d.location_dest); // data is not correct(it shows top 5 cities), delay data is needed here
		destDelayDimension.filter(d.location_dest); //d.location_origin
		// console.log(originDelayDimension)
		var delayFilter = destDelayDimension.top(Infinity);
		console.log(delayFilter)
		radial.isDeparture(true);
		plot2.append("g")
			.classed("radial-delay", true)
			.attr("transform", "translate("+(50+i*w/5)+", 150)")
			.datum(delayFilter).call(radial);

		radial.isDeparture(true);
		plot2.append("g")
			.classed("radial-arrival", true)
			.attr("transform", "translate("+(50+i*w/5)+", 150)")
			.datum(delayFilter).call(radial);	
	});


	var barChart = BarChart();
	plot3.append("g").classed("weatherBarChart", true).datum(weatherDelayDimenstion.top(Infinity)).call(barChart);
}



function parseCity(d){
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