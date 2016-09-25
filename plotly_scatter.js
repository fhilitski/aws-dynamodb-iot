(function (FH, $, undefined) {

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
		array of obects with the following format
		Object {
				data.serialNumber: Array[],
				data.clickType: Array[],
				data.batteryVoltage: Array[],
				timestamp: Array[],
				device_id: Array[]
		}
	*/
	this.output_container = output_container;
	//output_container.html('<div id = "map" style="position:relative; left:60px; margin-top:20px;"></div>');
	output_container.html('<div id = "map"></div>');
	this.output = output_container.find("#map");
	
	this.data; //data and layout are passed to the plot.ly object
	this.layout; 
}

/** 
	Preforms initial data processing. Has to be called first!
	@method init
	@public
*/
FH.plotter.prototype.init = function(){
	this.output.html('');
	var this_instance = this;
	
	   //end debug output
    
	//data is the object of options and settings necessary for the Plot.ly object
	//first, let's define settings that are common for both plot types
	this.data = [{
          type: this_instance.type,
		  //locationmode: "USA-states",
		  hoverinfo: 'text'
		  //marker:plot_marker //this depends on the type of the plot
    }];

	var title_string = this_instance.plot_title;
	title_sting = 'IoT button ' + title_string.substr(1,title_string.length - 8) + 'XXXXXXXX</br><b>' + this.state_data.timestamp.length + '</b> records total';
	this.layout = {
		autosize:true,
		title: title_sting,
		//height:600,
		//width:900,
		margin:{
			autoexpand:false,
			t:50,
			b:50,
			r:100,
			l:100
		}
	//,paper_bgcolor:"#CFCFCF"
	};
	
	//x-axis properties: xaxis
	var xaxis = {
		type:"date",
		autorange:true,
		tickformat:"%d-%b %y",
		title:"Date / Time",
		showline:true,
		linecolor:"rgb(102, 102, 102)",
		linewidth:2,
		gridcolor:"rgb(217, 217, 217)",
		gridwidth:1.5,
		zeroline:false,
		showticklabels:true,
		//hoverformat:"%I:%M %p"
		hoverformat:"%c"
	};
	//y-axis properties
	var yaxis = {
		showgrid:false,
		linecolor:"rgb(60, 120, 216)",
		showline:true,
		linewidth:2.5,
		type:"linear",
		autorange:true,
		rangemode:"normal",
		title:"Battery voltage (mV)",
		ticksuffix:" mV",
		showticklabels:true,
		titlefont:{
			size:20,
			color:"rgb(31, 119, 180)"
		}
	};
	//second y-axis properties
	var yaxis2 = {
		overlaying:"y",
		side:"right",
		range:[0, 4],
		anchor:"x",
		type:"linear",
		//autorange:true,
		showline:true,
		linecolor:"rgb(230, 145, 56)",
		linewidth:2.5,
		showgrid:true,
		gridcolor:"rgb(246, 178, 107)",
		rangemode:"tozero",
		title:"Click Type",
		titlefont:{
			size:20,
			color:"rgb(255, 127, 14)"
		},
		tickvals:[0,1,2,3],
        ticktext : ['','SINGLE','DOUBLE','LONG']
	};
	
	
	//add geo object to this.layout for geo maps
	var geo={
				scope: 'usa',
				showlakes: true,
			  showrivers:true,
              lakecolor: '#92DCE0',
			  coastlinecolor: 'rgb(0,0,0)',
			  bgcolor:"#CFCFCF"
	};

	//var location_mode;
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
		this.layout.yaxis2 = yaxis2;
		
		var trace1 = {
			x: this_instance.state_data.timestamp,
			y: this_instance.state_data['data.batteryVoltage'],	
			mode: 'lines+markers',
			type: 'scatter',
			line:{
				width:3,
				dash:"solid",
				color:"rgb(109, 158, 235)"
			},
			marker:{
				size:8,
				color:"rgb(31, 119, 180)"
			},
			name: 'voltage'
		};
		var trace2 = {
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
		
		this_instance.data = [trace1, trace2];
		this_instance.plotData();
		
	}; //end if this.type == 'scatter'
	
} //end init()

FH.plotter.prototype.plotData = function(){
	//console.log('plotting...');
    Plotly.plot(this.output[0], this.data, this.layout, {showLink: true});
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