// Simple CSV parse to create JSON for MMM module for my Smart Mirror

// runs with PM2 on boot
var fs = require('fs');

var Papa = require('papaparse');


function parseStats() {
	var file = 'stats.csv';
var content = fs.readFileSync(file, "utf8");

Papa.parse(content, {
    delimiter: ",",
		header: true,
		dynamicTyping: true,
 
		download: false,
		transformHeader:function(h) {
			return h.replace(/\s/g, '_');
		  },
        complete: function (results) {
		//console.log(results.data)
		let buffer = results.data;

		let revenue = reportBouncer(buffer.filter(data => data.Adjusted_Revenue != 0 && typeof data.Adjusted_Revenue == 'number').map(data => data
			.Adjusted_Revenue));
//console.log(revenue);
			let unknownXchangeRate = 3.337;
			let MTDraw = revenue.reduce((a, b) => a + b, 0);
			let WTDraw = revenue.slice(-7,-1).reduce((a, b) => a + b, 0);
		
			let MTD = Math.floor((MTDraw/unknownXchangeRate)*100)/100;
			let WTD = Math.floor((WTDraw/unknownXchangeRate)*100)/100;
			let TOD = Math.floor((returnToday(revenue,unknownXchangeRate))*100)/100;
				
//console.log("MTDraw = ",MTDraw);
//console.log("WTDraw = ",WTDraw);
//			 console.log("MTD = $"+MTD);
//			 console.log("WTD = $"+WTD);
//			 console.log("Today = $"+TOD);

			 json = {

				"stats": [
					{  
						"icon":"fa-calendar-alt",
						"data":"MTD",
						"value":MTD,
						"type":"USD"
					 },
					 {  
						"icon":"fa-calendar-plus",
						"data":"WTD",
						"value":WTD,
						"type":"USD"
					 },
					 {  
						"icon":"fa-clock",
						"data":"TOD",
						"value":TOD,
						"type":"USD"
					 },
				]
				
			 };
			 let write = JSON.stringify(json)

			 fs.writeFile("binary.json", write, function(err) {
				if(err) {
					return console.log(err);
				}
				console.log("The file was saved!");
			}); 




        }
});
};

function run() {
	setTimeout(function(){ parseStats();}, 15000);
};

run();



function returnToday(rev,xchange){
				
	if (rev.slice(-1) != 0){
		return rev.slice(-1).reduce((a, b) => a + b, 0)/xchange;
	} else {
		return 0;
	}
};



function reportBouncer(arr) {
	return arr.filter(Boolean);
};