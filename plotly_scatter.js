(function (FH, $, undefined) {
/**
	FH.plotter((data, output_container, type, title, selection)
	
	data must be in the following format:
		Object {
				field1: Array[],
				field2: Array[],
				........
				fieldN: Array[],
				timestamp: Array[],
				device_id: Array[]
		}
**/
FH.plotter = function (data, output_container, type, title) {
	
	this.type = type;
	if (this.type == 1){
		this.type = 'choropleth'; 
	}
	if (this.type == 2){
		this.type = 'scattergeo';
	}
	if (this.type == 3){
		this.type = 'scatter';
	}
	
	this.state_data = data;
	this.plot_title = title;
	/*
		
	*/
	this.output_container = output_container;
	//output_container.html('<div id = "map" style="position:relative; left:60px; margin-top:20px;"></div>');
	output_container.html('<div id = "map"></div>');
	this.output = output_container.find("#map");
	
	//data is the object of options and settings necessary for the Plot.ly object
	this.data = []; //data and layout are passed to the plot.ly object
	this.layout = {}; 
}

/** 
	Preforms initial data processing. Has to be called first!
	@method init
	@public
*/
FH.plotter.prototype.init = function(){
	this.output.html('');
	var this_instance = this;
	    
	var title_string = this_instance.plot_title;
	title_string += '</br><b>' + this.state_data.timestamp.length + '</b> records total';
	
	this.layout = {
		font: {
			family:'"Open Sans", verdana, arial, sans-serif',
			size:12,
			color:"#444"
		},
		titlefont: {
			size: 17
		},
		autosize:true,
		title: title_string,
		//height:600,
		//width:900,
		margin:{
			autoexpand:false,
			t:50,
			b:70,
			r:70,
			l:70,
			pad: 10,
		},
		showlegend:true
		//,paper_bgcolor:"#CFCFCF"
	};
	
	//x-axis properties: xaxis
	var xaxis = {
		type:"date",
		autorange:true,
		tickmode: "auto",
		tickformat:"%m/%e %H:%M",
		tickangle: -20,
		ticks: "outside",
		title:"Date / Time",
		showline:true,
		//linecolor:"rgb(102, 102, 102)",
		linewidth:2,
		//gridcolor:"rgb(217, 217, 217)",
		gridwidth:1.5,
		zeroline:false,
		showticklabels:true,
		//hoverformat:"%I:%M %p"
		hoverformat:"%c",
		titlefont:{
			size:20,
			color:"rgb(31, 119, 180)"
		},
		/*rangeslider:{
			y:2,
			x:1,
			xanchor: "left",
			yanchor: "bottom",
			bgcolor: "#cfcfcf",
			bordercolor: "#444",
			borderwidth: 1,
			thickness: 0.15,
			visible: true
		},*/
		rangeselector:{
			x: 0,
			y: 0,
			xanchor: "left",
			yanchor: "bottom",
			bgcolor: "#eee",
			activecolor: "#d4d4d4",
			bordercolor: "#444",
			borderwidth: 0,
			visible: true
		}
	};
	
	//create buttons for the range selector
	var buttons = [];
	buttons[0] = {
		step: 'all',
		label: 'reset'
	};
		
	buttons[1] = {
		step: 'month',
		stepmode: 'backward',
		count: 1,
		label: '1 Month'
	};
	buttons[2] = {
		step: 'day',
		stepmode: 'backward',
		count: 7,
		label: '1 Week'
	};
	buttons[3] = {
		step: 'day',
		stepmode: 'backward',
		count: 1,
		label: '1 Day'
	};
	buttons[4] = {
		step: 'hour',
		stepmode: 'backward',
		count: 1,
		label: '1 Hour'
	};
	xaxis.rangeselector.buttons = buttons;
	
	
	//y-axis properties
	//this will depend on the type of data.
	//let's look at the keys in the data object
	var data_keys = [];
	var data_types = [];
	$.each(this.state_data, function(key, value){
		if ((key != 'timestamp') && (key != 'device_id')){
			if ((key == 'TMP102') || (key == 'TMP006')){
				data_types.push('Temperature (&deg;C)');
			}
			else{
				data_types.push(key);
			}
				data_keys.push(key);
		}
	});
	var data_types_set = new Set(data_types);
	var y_axis_types = Array.from(data_types_set);
	
	console.log(data_keys);
	console.log(data_types);
	console.log(data_types_set);
	console.log(y_axis_types);
	
	//create properties object for the firts y axis
	var yaxis = {
		showgrid:true,
		//linecolor:"rgb(60, 120, 216)",
		showline:true,
		//linewidth:2.5,
		type:"linear",
		autorange:true,
		rangemode:"normal",
		title:y_axis_types[0],
		//ticksuffix:"",
		showticklabels:true,
		titlefont:{
			size:20
			//color:"rgb(31, 119, 180)"
		}
	};
	
	var yaxis2 = {};
	console.log(data_types_set.size);
	console.log((data_types_set.size > 1));
	if (data_types_set.size > 1){
		//second y-axis properties
		yaxis2 = {
			overlaying:"y",
			side:"right",
			//range:[0, 4],
			autorange: true,
			anchor : "x",
			type:"linear",
			showline:true,
			//linecolor:"rgb(230, 145, 56)",
			//linewidth:2.5,
			//showgrid:true,
			//gridcolor:"rgb(246, 178, 107)",
			//rangemode:"tozero",
			title:y_axis_types[1],
			titlefont:{
				size:20
				//color:"rgb(255, 127, 14)"
			}			
		};
	}
		
	//add geo object to this.layout for geo maps
	var geo={
		scope: 'usa',
		showlakes: true,
		showrivers:true,
        lakecolor: '#92DCE0',
		coastlinecolor: 'rgb(0,0,0)',
		bgcolor:"#CFCFCF"
	};

	//var location_mode - only used for 'choropleth' and 'scattergeo'
	var plot_data = this.data[0];
	//if choropleth map
	if (this.type == 'choropleth'){
		
		plot_data.marker ={
             line:{
                 color: 'rgb(0,0,0)',
                 width: 1
              }
          };
		plot_data.locations = this_instance.getStates();
        plot_data.z = this_instance.getAmounts();
        plot_data.text = this_instance.getStateText();
        plot_data.zmin = 0;
        plot_data.zmax = Math.ceil(this_instance.max_amount/1000000)*1000000;
        plot_data.colorscale = [
              [0, '#ccffcc'], [0.2, '#66ff66'],
              [0.4, '#00ff00'], [0.6, '#009900'],
              [0.8, '#006600'], [1, '#003300']
        ];
        plot_data.colorbar = {
              title: 'Millions USD',
              thickness: 25,
			  nticks: 10,
			  ticks:"outside",
			  exponentformat:"B",
			  tickprefix:"$"
          };
		  plot_data.name='ABS';

		this_instance.plotData();
	}
	
	//if scattergeo map
	if (this.type == 'scattergeo'){
		//scattergo displays funding amounts as circles whose radius depends on the total amount
		//this defines radius scaling. 
		var scaled_amounts = [];
		var pix_per_max = 120;  //constant for MAX radius in pixels which corresponds to the rounded max amount
		//var scale = this.max_amount/pix_per_max; //scale everything my max amount.
		var scale = 100000000/pix_per_max; //scale everything with constant amount 
		//in this case, $100M=120 pix
		for (var i=0; i<this_instance.amounts.length; i++){
			scaled_amounts[i] = Math.ceil(this_instance.amounts[i]/scale);
		}
		//console.log('sizes: ');
		//console.log(scaled_amounts);
		plot_data.marker = {
            size: scaled_amounts,
            line: {
                color: 'black',
                width: 2
            },
			color:"rgb(25, 215, 25)"
        };
		plot_data.text = this_instance.getCityText();

		var url = 'scripts/geocities/coordinatesAPI2.php';
		var citylist = {};
		citylist.cities = this.cities;
		var request = $.ajax({
			url:url, 
			data:citylist,
			type:'POST'		
		});
		request.done(function(received_data){	
			var coords = $.parseJSON(received_data);
			var lat = coords.lat;
			var lon = coords.lon;
		    //console.log(coords);
			//console.log(lat);
			//console.log(lon);
			plot_data.lat = lat;
			plot_data.lon = lon;
			this_instance.plotData();
		});	
	}; //end if this.type == 'scattergeo'
	
	if (this.type == 'scatter'){
		//add axis configuration to the layout
		this.layout.xaxis = xaxis;
		this.layout.yaxis = yaxis;
		if (y_axis_types.length > 1){
			console.log('Should not run!');
			this.layout.yaxis2 = yaxis2;
		}

		//iterate through each data index
		
		$.each(data_keys, function(key, value){
			//determine if the trace is going to y or y2
			var i = y_axis_types.indexOf(data_types[key]);
			var y_axis_index = (i == 0) ? "y" : "y2";
			console.log(key);
			console.log(value);
			console.log(i);
			console.log(y_axis_index);
						
			var trace = {
				//x is always timestamp
				x: this_instance.state_data.timestamp,
				y: this_instance.state_data[value],	
				mode: 'lines',
				type: 'scatter',
				line:{
					width:2.5,
					dash:"solid"
					//simplify:true
					//color:"rgb(109, 158, 235)"
				},
				marker:{
					symbol: "circle",
					opacity: 1,
					size: 2
					//color:"rgba(31, 119, 180, 0.5)"
					},
				name: value,
				yaxis: y_axis_index
			};
			this_instance.data.push(trace);
		});
		
		/*var trace2 = {
			x: this_instance.state_data.timestamp,
			y: this_instance.state_data['data.clickType'],	
			mode: 'markers',
			type: 'scatter',
			yaxis: 'y2',
			type:"scatter",
			fill:"tozeroy",
			line:{
				shape:"hvh"
			},
			marker:{
				size:8
			},
			name: 'click type'
		};
		*/
		this_instance.plotData();
	}; //end if this.type == 'scatter'
} //end init()

FH.plotter.prototype.plotData = function(){
	//console.log('plotting...');
    Plotly.plot(this.output[0], this.data, this.layout, {showLink: true});
;
}

FH.plotter.prototype.getStates = function(){
	return this.states;
}

FH.plotter.prototype.getAmounts = function(){
	return this.amounts;
}

FH.plotter.prototype.getMax = function() {
	return this.max_amount;
}

FH.plotter.prototype.getFormattedAmounts = function(){
	return this.amounts_usd;
}

FH.plotter.prototype.getStateText = function(){
	var state_text = [];
	for (var i = 0; i < this.states.length; i++){
		state_text[i] = this.states[i]+ '</br> Funded: ' + this.amounts_usd[i];
	}
	return state_text;
}

FH.plotter.prototype.getCityText = function(){
	var city_text = [];
	for (var i = 0; i < this.cities.length; i++){
		city_text[i] = this.cities[i]+ '</br> Funded: ' + this.amounts_usd[i];
	}
	return city_text;
}	  
}(window.FH= window.FH || {}, jQuery));