(function (FH, $, undefined) {
 
	/**
   * Process generic array of JSON data into Dynatable
   * Requires:
   * numeral.js
   * <script rc="http://cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js"></script>
   * moment.js
   * <script src="http://momentjs.com/downloads/moment.js" type="text/javascript"></script>
   * dynatable
   * <script src="https://cdnjs.cloudflare.com/ajax/libs/Dynatable/0.3.1/jquery.dynatable.min.js" type="text/javascript"></script> 
   *    
   @class dataprocess
   @constructor
   */
  FH.dataprocess = function (fetched_data, output_container) {
	this.fetched_data = fetched_data; //final fetched data
	
	this.total_data_length = fetched_data.length; //total length of the fetched data
	
	//dataset name to be used in plot and table titles
	this.data_name = 'IoT device ' + fetched_data[0].device_id;
	
	//callbacks are currently not used
    this.onServerDataLoadCallbacks = $.Callbacks(); 
	
	//jQuery container for the output (ex. $("#output"))
	//split the output into two divs:
	// #controlbuttons one for buttons 
	// #resultoutput for the output
	this.output_initial = output_container;
	this.output_initial.html('');
	this.output_initial.append('<div id = "controlbuttons"></div>');
	this.buttons = this.output_initial.find("#controlbuttons");
	this.output_initial.append('<div id = "resultoutput"></div>');
	this.output = this.output_initial.find("#resultoutput");
	
	//store columns of generic data in this structure
	this.columns = {};
	this.data_selection = [];
	//date-time format string
	this._fmt_string = 'YYYY-MM-DD HH:mm:ss.SSSSSS';
	
	//start everything
	this._setUp();
}	

/**
	Perform the initial set-up and data_analysis
	@method _setUp
	@private
*/
FH.dataprocess.prototype._setUp = function (){
	var this_object = this;
	
	var table_button = '<button id = "showtable" class = "noselect">Show Table</button> ';
	var plot_button = ' <button id = "showplot" class = "noselect">Show Plot</button>';
	var table_button_ref;
	var plot_button_ref;
	
	if (this.getTotalLength() == 0) {
		this.output.html('<p class = "notice">We did not find anything. Please try other search parameters...</p>');
	} 
	else{
		var info_str = '<p class = "sucess notice"> Total: '+this.getTotalLength()+' records</p>';
		info_str += '<p> Select relevant data: </p>';
		this.buttons.append(info_str);
		//create list of data fields
		//make a form with checkboxes
		//and append them to buttons div
		this.buttons.append(this._createFieldList());
		this.dataselector = this.buttons.find("form");
		//bind action on form change
		this.dataselector.change(function(){	
			this_object.output.html('');
			this_object._updateDataSelection();
		});
		
		//add buttons for plotting and tabulation
		this.buttons.append(table_button);
		this.buttons.append(plot_button);
		plot_button_ref = this.buttons.find("#showplot");
		table_button_ref = this.buttons.find("#showtable");
		//bind  actions to added buttons
		table_button_ref.bind('click', function() {	
		    this_object.columns = {};
			//get user_selected selected datafields 
			this_object._updateDataSelection();
			
			this_object._getFormattedDataTable_html();
			this_object._getFormattedDataTable();
		});
		
		plot_button_ref.bind('click', function() {
			this_object._plotData();
		});
					
		
		//table_button_ref.click();		
		
	} //end if getTotalLength == 0
} //end _setUp

/**
	1. Output formatted table of data into the html table with id='dataoutput'
	2. Organize data
	3. Display options for data plotting
	@method _getFormattedDataTable_html
	@private
*/ 
 FH.dataprocess.prototype._getFormattedDataTable_html = function (){
	var this_instance = this;
	var output_div = this.output;

	output_div.html("");

	var html_string = "<table id = 'dataoutput'>";
	html_string += '<caption>';
	html_string += this.data_name;
	html_string += '</caption>';

	$.each(this_instance.fetched_data, function(index,item) {
		//flatten each item 
		var flat_item = this_instance._flattenJSON(item);
		//and process
		html_string += this_instance._processItem(flat_item, index);
	});
	html_string += '</table>';
	output_div.append(html_string);
}//end getFormattedDataTable_html
 
 /**
   Process a single item into a row of the HTML table
   If this is the first item (index = 0), then create a header row as well
   @method _processItem
   @private
   */
FH.dataprocess.prototype._processItem = function(single_entry, record_index){
	var this_instance = this;
	//define vars for table formatting
	var sc1 = '<span class = "clickable on">';
	var sc_end = '</span>';
	var sc0 = '<span class = "clickable off">';
	var td1 = '<td>';
	var td2 = '</td>';
	var h1 = '<th>';
	var h2 = '</th>';
	var tr1 = '<tr>';
	var tr2 = '</tr>';
	
	var return_string = '';
	
	//create table headers if dealing with the first row of data
	if (record_index == 0){
		//open table header <thead> tag
		return_string = '<thead><tr class = "noselect">';
		 //add an index row
		return_string += h1 +'#' + h2;
		//add all other headers
		$.each(single_entry, function (idx, value) {
			//index contains field name
			//value has the contents of the field (can be a string, a numeral or an object)
			
			//check if the index has 'data'
			var s_idx = idx.split('.');
			if (s_idx[0] == 'data'){
				//if so, check if this data is selected
				if (this_instance.data_selection.indexOf(s_idx[1]) > -1){
					idx = s_idx[1];
				}
				else{
					//data is not selected
					//do not add the header
					idx = -1;
				}
			}
			else{
				idx = s_idx[0];
			}
			
			if (idx != -1){
			return_string += h1 + idx + h2;
			//add column names to the columns object
			this_instance.columns[idx] = [];
			}
		});
		return_string += '</tr></thead>';
		//close the header tag
	}// end if (index == 0)
	
	//now fill in table rows
	return_string += tr1;
	//first, the index column of the given row
	return_string += td1 + (record_index+1) + td2;
	//now the rest of the columns
	$.each(single_entry, function (idx, value) {
		//index contains field name
		//value has the contents of the field (can be a string, a numeral or an object)
		
		//check if the index starts with 'data'
		//ex. 'data.TMP006'
		var s_idx = idx.split('.');
		if (s_idx[0] == 'data'){
			//if so, check if this data is selected
			if (this_instance.data_selection.indexOf(s_idx[1]) > -1){
				idx = s_idx[1];
			}	
			else{
				//data is not selected
				//do not add the header
				idx = -1;
			}
		}
		else{
			idx = s_idx[0];
		}
		
		//now, some data might require additional processing 
		if (idx != -1){
			if (typeof value == 'object'){
				value = JSON.stringify(value);
			}
			//record timestamps as actual date in the format given belov
			if (idx == 'timestamp'){
				//the format of timestamp depends on the indended use of the data
				//for plot.ly default date-time format is
				//yyyy-mm-dd HH:MM:SS.ssssss
				value = moment(parseInt(value, 10)).format(this_instance._fmt_string);
			}
			
			//pares batteryVoltage payload as number in mV
			if (idx == 'batteryVoltage'){
				var mV = value.split("mV");
				value = parseInt(mV, 10);
			}
			
			//parse data.clickType
			if (idx == 'clickType'){
				switch (value) {
					case 'SINGLE':
						value = 1;
						break;
					case 'DOUBLE':
						value = 2;
						break;
					case 'LONG':
						value = 3;
						break;
					default:
						value = 0;
				}
			}
			
			return_string += td1 + value + td2;	
			//add value to the array in the appropriate field of the columns object
			this_instance.columns[idx].push(value);
		}
	});
	return_string += tr2;
		
	//example of using numeral.js
	//funds_amt = numeral(single_entry.fundsObligatedAmt).format('$0,0');
			
	return return_string;	
} //end _processItemsTable

/**
	Uses dynatable.js to convert the HTML table into dynatable (also HTML table but cooler)
	@method _getFormattedDataTable
	@private
*/ 
FH.dataprocess.prototype._getFormattedDataTable = function (){
	var this_instance = this;
	var output_div = this.output;
	this.dtable = this.output.find('#dataoutput');
	this.dtable.bind('dynatable:init', function(e, dynatable) {
		dynatable.sorts.functions["date"] = this_instance.sortByDate;
		dynatable.sorts.functions["usd"] = this_instance.sortByAmount;
    });
	//initialize dynatable with custom sort types
	this.dtable.dynatable({
		dataset: {
			// When sorting a particular column,
			// use our custom sort function added above.
			sortTypes:{
				timestamp: "date",
				fundsObligated: "usd",
				estimatedTotal: "usd"
			}
		}	
	});
	var dt = this.dtable.data('dynatable');
	//fix the issue with pagination when switching between tables...
	//...by forcing the newly rendered table to page 1 every time
	dt.paginationPerPage.set(10); // Show 10 records per page
	dt.paginationPage.set(1); // Go to page 1
	//this command starts it all.
	dt.process();
}//end getFormattedDataTable()
 
/**
	Returns total length of the fetched data or 0 if data was not yet fetched
	@method getTotalLength
	@public
*/
FH.dataprocess.prototype.getTotalLength = function (){
	 this.total_data_length = this.fetched_data.length;
	 return this.total_data_length;
 }//end getTotalLength
 
/**
	Helper function to sort fetched data by amount in the ascending (set ascending flag to true) or descending order (ascending set false).
	@method _sortByAmount;
	@public
*/
FH.dataprocess.prototype.sortByAmount = function (a,b,attr,dir){
	 var amount_a = a[attr];
	 var amount_b = b[attr];
	 if (amount_a == undefined){
		 amount_a = 0;
	 }
	 else{
		 amount_a = parseFloat(amount_a.substring(1).replace(/,/g,''));
	 }
	if (amount_b == undefined){
		 amount_b = 0;
	}
	else{
		 amount_b = parseFloat(amount_b.substring(1).replace(/,/g,''));
	}
	//console.log('sorting: ' + amount_a + ' and ' + amount_b);
	return (amount_b-amount_a)*dir;
 }
 
/**
	Helper function to sort fetched data by date in the ascending (set ascending flag to true) or descending order (ascending set false).
	@method _sortByDate
	@public
*/
FH.dataprocess.prototype.sortByDate = function (a,b,attr,dir){
	var date_a = a.timestamp;
	var date_b = b.timestamp;
	if (date_a == undefined){
		date_a = moment(0);
	 }
	 else{
		date_a = moment(date_a, this._fmt_string);
	 }
	 if (date_b == undefined){
		date_b = moment(0);
	 }
	 else{
		date_b = moment(date_b, this._fmt_string);
	 }
	 if (date_a.isBefore(date_b)){
		return -1*dir;
	 }
	 else{
		 return 1*dir;
	 }
 }
 
/**
	Helper function for map by state option 
	Legacy from NSF funding data processor
	@method _getDates(start)
	@depreciated
	@private
**/
FH.dataprocess.prototype._getDates = function (start){
	var min_date;
	min_date = (start) ? moment() : moment(0);
	var this_instance = this;
	$.each(this_instance.fetched_data, function(index,item) {
			//console.log(item.date);
			var current_date = (item.date == undefined) ? moment() : moment(item.date);
			if (start) {
				min_date = (current_date.isBefore(min_date)) ? current_date : min_date;
			}
			else{
				min_date = (current_date.isBefore(min_date)) ? min_date : current_date;
			}
	});
	return min_date;
 } //end getStartDate

/** 
	Flattens nested JSON objects into single level object
	@method _flatenJSON(data)
	@private
**/
FH.dataprocess.prototype._flattenJSON = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

/**
	Plot
	@method _plotData()
	@private
**/
FH.dataprocess.prototype._plotData = function(){
	this._updateDataSelection();
	this.data_selection
	this.plot = new FH.plotter(this.columns, this.output, 3, this.data_name);
	this.plot.init();
}

/**
	Create list of all data fields
	@method _createFieldList()
	@private
**/
FH.dataprocess.prototype._createFieldList = function(){
	var data_obj = this.fetched_data[0].data;
	var list = [];
	var html_string = ["<form>"];
	//variables for checkbox html string
	var cb1 = "<input style='margin-left:20px' type = 'checkbox' value = '";
	var cb2 = "' name = '";
	var cb3 = "' checked = 'checked' ";
	var cb4 = " >";
	var d = '';
	var exclude = ["Device"];
	$.each(data_obj, function(index, item) {
		//this statement allows for exclustion of some datafields
		//console.log(index);
		if (exclude.indexOf(index) > -1){
			d = "disabled";
			cb3 = "'";
		}
		else{
			//add data to the list data
			d = "";
			cb3 = "' checked = 'checked' ";
			list.push(index);
		}
		html_string.push(cb1+index+cb2+index+cb3+d+cb4);
		html_string.push(index);
		
	});
	html_string.push("</form>");
	return html_string.join('');		
}

/**
	Updates the list of selected data for plotting
	based on user input
	@method _updateDataSelection
	@private

**/
FH.dataprocess.prototype._updateDataSelection = 
function(){
	var list = [];
	if (this.dataselector !== undefined){
		var ds = this.dataselector;
		$.each(ds.find('input'), function(key, value){
			if (value.checked){
				list.push(value.name);
			}
		});
	}
	this.data_selection = list;
}
}(window.FH= window.FH || {}, jQuery));

