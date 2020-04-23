/** Tom put your stuff here, the importing is set up for you**/
console.log(d3.version)
const circleRadius = 5;
const DATA_INTERVAL = 100;
const margin = {top: 10, right: 30, bottom: 30, left: 60}

let dataset = 0;
let dataIndex = 0;
let altData = [0.2,0.1,0,1, -0.2];
let testData = new Array();
let VERTICAL_OFFSET = 30;



let intervalFN= 0;
let heightScale;
let widthScale;
let widthScaleMax = 5;
let heightScaleMax = 1;
let heightScaleMin = -1;
let dynamicDataContainer = {
    active : true,
    dataArray : []
};
let staticDataContainer = {
    active: false,
    dataArray : [-0.5,0.9,0.09,0.25,-0.3,0.5,0.1]
};
let dataBaseDataContainer = {
    active : false,
    dataArray: []
};
let color2 = d3.scaleLinear()
	.domain([heightScaleMin,heightScaleMax])
	.range(['#FFFFFF', 'blue']);
let testVisSVG = initialize("dataviz", 1000, 640, "Time", "Y-axis data");
plot(dynamicDataContainer.dataArray, testVisSVG, 640);
/**
 * Initializes a visualization with blank data to a provided SVG element
 * @param {String} svgName 	id of SVG object to draw visualization on
 * @param {String} width  	desired width of SVG vis
 * @param {int} height  	desired height of SVG vis
 * @param {String} xAxis 	xAxis label
 * @param {String} yAxis 	yAxis label
 * @returns {selection} D3 selection of all visualization elements
 */
function initialize(svgName, width, height, xAxis, yAxis){
    let svgWidth = width+margin.left+margin.right;
    let svgHeight = height+margin.top+margin.bottom;
    let svg = d3.select("#"+svgName)
    .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("class", '.c_visObject')
        .attr("style", "background-color: #668586; margin:10px; box-shadow: -6px 9px 7px 0px rgba(0,0,0,0.47);");
    // .append("g")
    //     .attr("transform", "translate("+ margin.left + "," + margin.top + ")")  
        
    let yLabel = svg.append('text')
        .text(yAxis)
        .attr('x', 0)
        .attr('y', '50%')
        .attr('transform', 'rotate(-90,20,'+svgHeight/2+')')
        .attr("font-size", "20px")
        .attr('text-anchor', 'middle');
        
    let xLabel = svg.append('text')
        .text(xAxis)
        .attr('x', '50%')
        .attr('y', svgHeight - margin.bottom/2)
        .attr('font-size', '20px')
		.attr('text-anchor', 'middle');
	heightScale = d3.scaleLinear()
		.domain([-1,1])
		.range([600,0]);
	widthScale = d3.scaleLinear()
		.domain([0,widthScaleMax])
		.range([0,width]);
	let heightAxis = d3.axisLeft(heightScale);
	let timeAxis = d3.axisBottom(widthScale);
	
    svg.append("g")
        .attr("class", "heightAxis")
		.attr("transform", "translate(60,"+VERTICAL_OFFSET +")")
		.call(heightAxis);
	svg.append("g")
		.attr("class", "timeAxis")
		.attr("transform", "translate("+margin.left+","+ (height - margin.top)+")")
		.call(timeAxis);
    return svg;
}
/**
 * Draws a scatter plot of the provided data to the provided plotSVG
 * @param {Array[number]} plotData Data to be plotted
 * @param {*} plotSVG D3 selection of plot elements to draw onto, from initialize()
 */
function plot(plotData, plotSVG){
    	if(plotData.length >= widthScaleMax){
		widthScaleMax *= 2;
		widthScale.domain([0,widthScaleMax]);
		plotSVG.select(".timeAxis")
			.call(d3.axisBottom(widthScale));
    }
    if(plotData.length > 0){
        if(Math.max(...plotData) > heightScaleMax){
            heightScaleMax += (1.05*Math.max(...plotData))
            color2.domain([heightScaleMin, heightScaleMax])
            heightScale.domain([heightScaleMin, heightScaleMax])
            plotSVG.select(".heightAxis")
                .call(d3.axisLeft(heightScale));
        }
        if(Math.min(...plotData) < heightScaleMin){
            heightScaleMin -= (0.25*Math.min(...plotData));
            color2.domain([heightScaleMin, heightScaleMax]);
            heightScale.domain([heightScaleMin, heightScaleMax]);
            plotSVG.select(".heightAxis")
                .call(d3.axisLeft(heightScale));
        }
    }
	//plot the circles
	let circle = plotSVG
		.selectAll("circle")
		.data(plotData)

	let lines = plotSVG
		.selectAll(".graphLine")
        .data(plotData)

	circle.exit()
        .remove();
        
    lines.exit()
        .remove();

		
	circle.enter() //create circles
		.append("circle")
		.attr('cx', function(d, i){
			return margin.left + widthScale(i)
		})
		.attr('r', circleRadius)
		.attr('fill-opacity', 0)
		.attr('fill', function(d, i) {
			return color2(plotData[i]);
		})
		.attr('cy', function(d, i) {
			// return height - (plotData[i] + 2 * circleRadius)
			return margin.bottom + heightScale(plotData[i]);
		})
		.transition()
            .attr('fill-opacity',1);
            
    

	circle.transition() //update circles position as data changes
		.duration(DATA_INTERVAL*2)
		.attr('cy', function(d, i) {
			return margin.bottom + heightScale(d);
		})
		.attr('cx', function(d,i){
			return margin.left + widthScale(i)
		})
		.attr('fill', function(d,i){
			return color2(d)
		})
        .attr('fill-opacity',1);

    
    lines.enter()
        .append("line")
        .attr("class","graphLine")
        .attr('x1', function(d, i){
            if(i != 0){
                return margin.left + widthScale(i-1);
            }
            else{
                return margin.left + widthScale(0);
            }
        })
        .attr('y1', function(d,i) {
            if(i != 0){
                return margin.bottom + heightScale(plotData[i-1]);
            }
            else{
                return margin.bottom + heightScale(d);
            }
        })
        .attr('x2', function(d , i){
            return margin.left + widthScale(i);
        })
        .attr('y2', function(d,i) {
            return margin.bottom + heightScale(d);
        })
        .attr('stroke-width', 1)
        .attr('stroke', function(d, i) { 
            return color2(d)
        })


    lines.transition()
		.attr('x1', function(d, i){
			if(i != 0){
				return margin.left + widthScale(i-1);
			}
			else{
				return margin.left + widthScale(0);
			}
        })
        .attr('x2', function(d,i){
			return margin.left + widthScale(i);
		})
		.attr('y1', function(d,i) {
			if(i != 0){
				return margin.bottom + heightScale(plotData[i-1]);
			}
			else{
				return margin.bottom + heightScale(d);
			}
		})
		.attr('y2', function(d,i) {
			return margin.bottom + heightScale(d);
        })
		.attr('stroke', function(d, i) {
             return color2(d)
        });
}
function stopButton(){
	clearInterval(intervalFN);
}

/**
 * Adds data to a data container, plots it if it is the active container
 * @param {*} value value to add to data container
 * @param {*} svg d3 selection of plot the data is associated with
 * @param {*} dataContainer dataContainer object, which contains the dataArray and active elements
 */
function addData(value, svg, dataContainer){
    dataContainer.dataArray.push(value);
    dataIndex += 10
    if(dataContainer.active){
      plot(dataContainer.dataArray, svg, 640);
    }
}
/**
 * Plots a sine wave to the active visualization
 */
function plotSin(){
    clearInterval(intervalFN)
    intervalFN = setInterval( function(){
        addData(Math.sin(dataIndex/100), testVisSVG, dynamicDataContainer)
    }, DATA_INTERVAL)
}
/**
 * plots random data to the visualziation
 */
function addRandom(){
    clearInterval(intervalFN);
    intervalFN = setInterval( function(){
        addData((Math.random()-.5)*2, testVisSVG, dynamicDataContainer);
    } , DATA_INTERVAL);
}
/**
 * clears the visualization
 */
function clearPlot(){
    dynamicDataContainer.dataArray = [];
    dataIndex = 0;
    heightScaleMin = -1;
    heightScaleMax = 1;
    widthScaleMax = 5;
    heightScale.domain([heightScaleMin, heightScaleMax])
    color2.domain([heightScaleMin, heightScaleMax])
    widthScale.domain([0, widthScaleMax])
    testVisSVG.select(".timeAxis")
        .call(d3.axisBottom(widthScale));
    testVisSVG.select(".heightAxis")
        .call(d3.axisLeft(heightScale));
    plot([], testVisSVG);
    console.log(testData)
}
/**
 * Switches between active data containers, draws the active container to the vis
 */
function dataSwitch(){
    let selector = document.getElementById("dataSelector")
    console.log(selector.value);
    clearPlot();
    if(selector.value == "staticTest"){
        staticDataContainer.active = true;
        dynamicDataContainer.active = false;
        plot(staticDataContainer.dataArray, testVisSVG);
    }
    else if(selector.value == "dynamicTest"){
        staticDataContainer.active = false;
        dynamicDataContainer.active = true;
        plot(dynamicDataContainer.dataArray, testVisSVG);
    }
    else{
        sendDbRequest({
            type: 'dbRequest',
            data: '/db/status/' + selector.value
        });
    }
}

function sendDbRequest(req) {
    console.log(req);
    fetch(req.data, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => checkResponseStatus(response));
}


async function checkResponseStatus(response){
    let body = await response.json();
    switch(response.status){
        case 200:
            
            plot(body.data, testVisSVG)
            break;
        case 400:
            console.log("DB READ ERROR: BAD REQUEST");
            break;
        case 500:
            console.log(response.status);
            break;
        default:
            console.log(response.status);
            break;
    }
}