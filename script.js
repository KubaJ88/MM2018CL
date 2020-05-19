var margin = {left:140, top:100, right:120, bottom:50},
	width = Math.max( Math.min(window.innerWidth, 1000) - margin.left - margin.right - 20, 400),
    height = Math.max( Math.min(window.innerHeight - 250, 1100) - margin.top - margin.bottom - 20, 600),
    innerRadius = Math.min(width * 1, height * .45),
    outerRadius = innerRadius * 1.05;
	
//Recalculate the width and height now that we know the radius
width = outerRadius * 2 + margin.right + margin.left;
height = outerRadius * 2 + margin.top + margin.bottom;
	
//Reset the overall font size
var newFontSize = Math.min(70, Math.max(40, innerRadius * 50.5 / 250));
d3.select("html").style("font-size", newFontSize + "%");

////////////////////////////////////////////////////////////
////////////////// Set-up Chord parameters /////////////////
////////////////////////////////////////////////////////////
	
var pullOutSize = 30 + 30/135 * innerRadius;
var numFormat = d3.format(",.0f");
var defaultOpacity = 0.85,
	fadeOpacity = 0.075;
						
var loom = d3.loom()
    .padAngle(0.03)
	.sortSubgroups(sortAlpha)
	.sortGroups(d3.descending)
	// .heightInner(28)
	.emptyPerc(0)
	.widthInner(50)
	//.widthInner(function(d) { return 6 * d.length; })
	.value(function(d) { return d.words; })
	.inner(function(d) { return d.character; })
	.outer(function(d) { return d.location; });

var arc = d3.arc()
    .innerRadius(innerRadius*1.01)
    .outerRadius(outerRadius*1.05);

var string = d3.string()
    .radius(innerRadius)
	.pullout(pullOutSize);

////////////////////////////////////////////////////////////
//////////////////// Character notes ///////////////////////
////////////////////////////////////////////////////////////
	

////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////
			
var svg = d3.select("#lotr-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

////////////////////////////////////////////////////////////
///////////////////// Read in data /////////////////////////
////////////////////////////////////////////////////////////
// svg.append("rect")
//     .attr("width", "100%")
//     .attr("height", "100%")
// 	.attr("fill", "#032D5D")
// 	.attr('opacity',0.1);
// d3.json('lotr_words_location.json').then((dataAgg) => {
// 	console.log(dataAgg)

svg.append('image')
.attr('xlink:href', 'https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg')  
.attr('x', 300)
.attr('y',100)
.attr('width',500)
.attr('height',700)
.attr('opacity', 0.1)

// console.log(d3.select('image'))


d3.csv('CL.csv', function(d) {
    // console.log(d)
    return {
        location: d.Finalist,
        character: d.Winner,
		words: 1,
		season: d.Season
    }
}).then(dataAgg => {
	////////////////////////////////////////////////////////////
	///////////////////// Prepare the data /////////////////////
	////////////////////////////////////////////////////////////
	let CharTest = d3.nest()
	.key(d=> d.character)
	.rollup(v => {
		return {
			season: v.map(d => d.season.replace(/�/g, "/")).join(' ')
		}
		})
		// v.forEach(e => {
		// 	let what = [];
		// 	what.push(e.season)
		// 	what.join(' ')
		// })
		
	
	.entries(dataAgg)

		console.log(CharTest)

	
// 	function searchName(name){ CharTest.forEach(d => {
// 		let tekst = []
// 		if (d.key==name) {
// 		   tekst.push((d.value.season))
		 
		   
// 		}
// 		return tekst;

// 	})
// }

let matrix = CharTest.map(d=> {
	return {
		klub: d.key,
		opis: d.value.season
	}
})

function searchName(name) {
	let tekst = '';
	matrix.forEach(d=> {
		if (d.klub==name) {
			tekst = (d.opis)
		}

	})

	return tekst;
}



console.log(searchName('Milan'))
	//Sort the inner characters based on the total number of words spoken
	// words: +d.Attendance.replace(/�/g, "")
	//Find the total number of words per character
	var dataChar = d3.nest()
		.key(function(d) { return d.character; })
		.rollup(function(leaves) { return d3.sum(leaves, function(d) { return d.words; }); })
		.entries(dataAgg)
		.sort(function(a, b){ return d3.descending(a.value, b.value); });				
	//Unflatten the result
	var characterOrder = dataChar.map(function(d) { return d.key; });
	//Sort the characters on a specific order
	function sortCharacter(a, b) {
	  	return characterOrder.indexOf(a) - characterOrder.indexOf(b);
	}//sortCharacter
	
	//Set more loom functions
	loom
		.sortSubgroups(sortCharacter)
		.heightInner(innerRadius*1.25/characterOrder.length);
	
	////////////////////////////////////////////////////////////
	///////////////////////// Colors ///////////////////////////
	////////////////////////////////////////////////////////////
					
	//Color for the unique locations
	var locations = [ "Atlético Madrid", "Real Madrid",  "Juventus", "Benfica",  "Bayern Munich", "Milan", "Barcelona", "Ajax",  "Stade de Reims",   "Internazionale", "Liverpool", "Valencia",   "Manchester United", "Eintracht Frankfurt", "Leeds United", "Saint-Étienne",   "Fiorentina", "Club Brugge", "Malmö FF", "Hamburg", "Borussia Dortmund", "Roma", "Celtic", "Steaua București", "Marseille", "Sampdoria", "Panathinaikos", "Bayer Leverkusen", "Monaco", "Arsenal", "Chelsea", "Partizan", "Borussia Mönchengladbach"];
	// var colors = ["#2D2E2F", "#001848",   "#000000", "#FF1800", "#3B4DB8",  "#DD2421",    "#192885",         "#E7E200", "#373F41", "#602317",     "#8D9413",   "#c17924", "#3C7E16"];
	var colors = ["#032D5D", "#666165"];
	var color = d3.scaleOrdinal()
    	.domain(locations)
    	.range(colors);
	
	//Create a group that already holds the data
	var g = svg.append("g")
	    .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
		.datum(loom(dataAgg));	

	////////////////////////////////////////////////////////////
	///////////////////// Set-up title /////////////////////////
	////////////////////////////////////////////////////////////

	var titles = g.append("g")
		.attr("class", "texts")
		.style("opacity", 0);
		
	titles.append("text")
		.attr("class", "name-title")
		.attr("x", 0)
		.attr("y", -innerRadius*5/6);

		titles.append("image")
		.attr("class", "logo-title")
		.attr("x", 0)
		.attr("y", -innerRadius*5/6-30);	
		
	titles.append("text")
		.attr("class", "value-title")
		.attr("x", 0)
		.attr("y", -innerRadius*5/6 + 25);
	
	//The character pieces	
	titles.append("text")
		.attr("class", "character-note")
		.attr("x", 0)
		.attr("y", 200)
		.attr("dy", "0.35em");
					
	////////////////////////////////////////////////////////////
	////////////////////// Draw outer arcs /////////////////////
	////////////////////////////////////////////////////////////

	var arcs = g.append("g")
	    .attr("class", "arcs")
	  .selectAll("g")
	    .data(function(s) { 
			return s.groups; 
		})
	  .enter().append("g")
		.attr("class", "arc-wrapper")
	  	.each(function(d) { 
			d.pullOutSize = (pullOutSize * ( d.startAngle > Math.PI + 1e-2 ? -1 : 1)) 
		})
 	 	.on("mouseover", function(d) {
			
			//Hide all other arcs	
			d3.selectAll(".arc-wrapper")
		      	.transition()
				.style("opacity", function(s) { return s.outername === d.outername ? 1 : 0.5; });
			
			//Hide all other strings
		    d3.selectAll(".string")
		      	.transition()
		        .style("opacity", function(s) { return s.outer.outername === d.outername ? 1 : fadeOpacity; });
				
			//Find the data for the strings of the hovered over location
			var locationData = loom(dataAgg).filter(function(s) { return s.outer.outername === d.outername; });
			//Hide the characters who haven't said a word
			d3.selectAll(".inner-label")
		      	.transition()
		        .style("opacity", function(s) {
					//Find out how many words the character said at the hovered over location
					var char = locationData.filter(function(c) { return c.outer.innername === s.name; });
					return char.length === 0 ? 0.1 : 1;
				});
 	 	})
     	.on("mouseout", function(d) {
			
			//Sjow all arc labels
			d3.selectAll(".arc-wrapper")
		      	.transition()
				.style("opacity", 1);
			
			//Show all strings again
		    d3.selectAll(".string")
		      	.transition()
		        .style("opacity", defaultOpacity);
				
			//Show all characters again
			d3.selectAll(".inner-label")
		      	.transition()
		        .style("opacity", 1);
 	 	});

	var outerArcs = arcs.append("path")
		.attr("class", "arc")
	    .style("fill", function(d) { return color(d.outername); })
	    .attr("d", arc)
		.attr("transform", function(d, i) { //Pull the two slices apart
		  	return "translate(" + d.pullOutSize + ',' + 0 + ")";
		 });
		 					
	////////////////////////////////////////////////////////////
	//////////////////// Draw outer labels /////////////////////
	////////////////////////////////////////////////////////////

	//The text needs to be rotated with the offset in the clockwise direction
	var outerLabels = arcs.append("g")
		.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2); })
		.attr("class", "outer-labels")
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
			var c = arc.centroid(d);
			return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
			+ "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + 26 + ",0)"
			+ (d.angle > Math.PI ? "rotate(180)" : "")
		})
		
	//The outer name
	outerLabels.append("text")
		.attr("class", "outer-label")
		.attr("dy", ".35em")
		.text(function(d,i){ return d.outername; });
		
	//The value below it
	outerLabels.append("text")
		.attr("class", "outer-label-value")
		.attr("dy", "1.5em")
		.text(function(d,i){ return numFormat(d.value) + " lost finals"; });

	////////////////////////////////////////////////////////////
	////////////////// Draw inner strings //////////////////////
	////////////////////////////////////////////////////////////
	
	var strings = g.append("g")
	    .attr("class", "stringWrapper")
		.style("isolation", "isolate")
	  .selectAll("path")
	    .data(function(strings) { 
			return strings; 
		})
	  .enter().append("path")
		.attr("class", "string")
		.style("mix-blend-mode", "multiply")
	    .attr("d", string)
	    .style("fill", function(d) { return d3.rgb( color(d.outer.outername) ).brighter(0.2) ; })
		.style("opacity", defaultOpacity);
		
	////////////////////////////////////////////////////////////
	//////////////////// Draw inner labels /////////////////////
	////////////////////////////////////////////////////////////
			
	//The text also needs to be displaced in the horizontal directions
	//And also rotated with the offset in the clockwise direction
	var innerLabels = g.append("g")
		.attr("class","inner-labels")
	  .selectAll("text")
	    .data(function(s) { 
			return s.innergroups; 
		})
	  .enter().append("text")
		.attr("class", "inner-label")
		.attr("x", function(d,i) { return d.x; })
		.attr("y", function(d,i) { return d.y; })
		.style("text-anchor", "middle")
		.attr("dy", ".35em")
	    .text(function(d,i) { return d.name; })
 	 	.on("mouseover", function(d) {
			
			//Show all the strings of the highlighted character and hide all else
		    d3.selectAll(".string")
		      	.transition()
		        .style("opacity", function(s) {
					return s.outer.innername !== d.name ? fadeOpacity : 1;
				});
				
			//Update the word count of the outer labels
			var characterData = loom(dataAgg).filter(function(s) { return s.outer.innername === d.name; });
			d3.selectAll(".outer-label-value")
				.text(function(s,i){
					//Find which characterData is the correct one based on location
					var loc = characterData.filter(function(c) { return c.outer.outername === s.outername; });
					if(loc.length === 0) {
						var value = 0;
					} else {
						var value = loc[0].outer.value;
					}
					return numFormat(value) + (value === 1 ? " lost final" : "lost finals"); 
					
				});
			
			//Hide the arc where the character hasn't said a thing
			d3.selectAll(".arc-wrapper")
		      	.transition()
		        .style("opacity", function(s) {
					//Find which characterData is the correct one based on location
					var loc = characterData.filter(function(c) { return c.outer.outername === s.outername; });
					return loc.length === 0 ? 0.1 : 1;
				});
					
			//Update the title to show the total word count of the character
			d3.selectAll(".texts")
				.transition()
				.style("opacity", 1);	
			d3.select(".name-title")
				.text(d.name);
			
			d3.select(".logo-title")
				.attr('href', `./img/${d.name}.png`)  
				.attr('x', -50)
				.attr('y',-350)
				.attr('width',100)
				.attr('height',100)
				.attr('opacity', 0.8);	

			d3.select(".value-title")
				.text(function() {
					var words = dataChar.filter(function(s) { return s.key === d.name; });
					return  numFormat(words[0].value) + (words[0].value === 1 ? " win" : " wins ")
				});
				
			// console.log(SearchName('Milan'))	
			//Show the character note
			d3.selectAll(".character-note")
				// .text('Won')
				.text(searchName(d.name))
				// .text(characterNotes[d.name])
				.call(wrap, 0.5*pullOutSize);
				
		})
     	.on("mouseout", function(d) {
			
			//Put the string opacity back to normal
		    d3.selectAll(".string")
		      	.transition()
				.style("opacity", defaultOpacity);
				
			//Return the word count to what it was
			d3.selectAll(".outer-label-value")	
				.text(function(s,i){ return  numFormat(s.value) + (s.value === 1 ? " lost final" : " lost finals ") });
				
			//Show all arcs again
			d3.selectAll(".arc-wrapper")
		      	.transition()
		        .style("opacity", 1);
			
			//Hide the title
			d3.selectAll(".texts")
				.transition()
				.style("opacity", 0);
			
		});
	  		
});//d3.csv

////////////////////////////////////////////////////////////
///////////////////// Extra functions //////////////////////
////////////////////////////////////////////////////////////

//Sort alphabetically
function sortAlpha(a, b){
	    if(a < b) return -1;
	    if(a > b) return 1;
	    return 0;
}//sortAlpha

//Sort on the number of words
function sortWords(a, b){
	    if(a.words < b.words) return -1;
	    if(a.words > b.words) return 1;
	    return 0;
}//sortWords

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrap(text, width) {
  text.each(function() {
	var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.2, // ems
		y = parseFloat(text.attr("y")),
		x = parseFloat(text.attr("x")),
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

	while (word = words.pop()) {
	  line.push(word);
	  tspan.text(line.join(" "));
	  if (tspan.node().getComputedTextLength() > width) {
		line.pop();
		tspan.text(line.join(" "));
		line = [word];
		tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	  }
	}
  });
}//wrap
