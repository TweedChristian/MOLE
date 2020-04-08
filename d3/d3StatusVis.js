const circleRadius = 5;
const DATA_INTERVAL = 100;
const margin = {top: 10, right: 30, bottom: 30, left: 60}

let dataset = 0;
let dataIndex = 0;
let altData = [0.2,0.1,0,1, -0.2];
let testData = new Array();
let VERTICAL_OFFSET = 30;

let colorScale = d3.scaleLinear()
	.domain([0, 500])
	.range([0,1]);

let color2 = d3.scaleLinear()
	.domain([-1,1])
	.range(['blue', 'red']);
let intervalFN;
let heightScale;
let timeScale;
let timeScaleMax = 50;



function initialize(svgName, width, height, xAxis, yAxis){

    let svgWidth = width+margin.left+margin.right;
    let svgHeight = height+margin.top+margin.bottom;
    let svg = d3.select("#"+svgName)
    .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("style", "background-color: #f0f0f0; margin:10px")
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
        .attr('y', svgHeight)
        .attr('font-size', '20px')
		.attr('text-anchor', 'middle');
	heightScale = d3.scaleLinear()
		.domain([-1,1])
		.range([600,0]);
	widthScale = d3.scaleLinear()
		.domain([0,timeScaleMax])
		.range([0,width]);
	let heightAxis = d3.axisLeft(heightScale);
	let timeAxis = d3.axisBottom(widthScale);
	
	svg.append("g")
		.attr("transform", "translate(60,"+VERTICAL_OFFSET +")")
		.call(heightAxis);
	console.log(height)
	console.log(svgHeight)
	console.log(margin)
	svg.append("g")
		.attr("class", "timeAxis")
		.attr("transform", "translate("+margin.left+","+ (height - margin.top)+")")
		.call(timeAxis);
    return svg;
}
function plot(plotData, plotSVG, height){
	if(plotData.length >= timeScaleMax){
		timeScaleMax *= 2;
		widthScale.domain([0,timeScaleMax]);
		plotSVG.select(".timeAxis")
			.call(d3.axisBottom(widthScale));
	}
	//plot the circles
	let circle = plotSVG
		.selectAll("circle")
		.data(plotData)

	let line = plotSVG
		.selectAll("line")
		.data(plotData)

	circle.exit()
		.remove();
		
	circle.enter() //create circles
		.append("circle")
		.attr('cx', function(d, i){
			//return margin.left + (2*circleRadius * i);
			// console.log(plotSVG.attr('width'));
			//return margin.left + ((i/plotData.length)*plotSVG.attr('width'))
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
			.attr('fill-opacity',1)

	circle.transition() //update circles position as data changes
		.duration(DATA_INTERVAL*2)
		.attr('cy', function(d, i) {
			return VERTICAL_OFFSET + heightScale(plotData[i]);
		})
		.attr('cx', function(d,i){
			return margin.left + widthScale(i)
		})
		.attr('fill', function(d,i){
			return color2(plotData[i])
		})
		.attr('fill-opacity',1);

	line.enter()
		.append("line")
		.attr('x1', function(d, i){
			if(i != 0){
				return (margin.left + (widthScale(i-1)));
			}
			else{
				return(margin.left + (widthScale(i)));
			}
		})
		.attr('y1', function(d,i) {
			if(i != 0){
				return VERTICAL_OFFSET + heightScale(plotData[i-1]);
			}
			else{
				return VERTICAL_OFFSET + heightScale(plotData[i]);
			}
		})
		.attr('x2', function(d , i){
			return margin.left + (widthScale(i));
		})
		.attr('y2', function(d,i) {
			return VERTICAL_OFFSET + heightScale(plotData[i]);
		})
		.attr('stroke-width', 1)
		.attr('stroke', function(d, i) { return color2(plotData[i])})

	line.transition()
		.duration(DATA_INTERVAL*2)
		.attr('x1', function(d, i){
			if(i != 0){
				return (margin.left + (widthScale(i-1)));
			}
			else{
				return(margin.left + (widthScale(i)));
			}
		})
		.attr('y1', function(d,i) {
			if(i != 0){
				return VERTICAL_OFFSET + heightScale(plotData[i-1]);
			}
			else{
				return VERTICAL_OFFSET + heightScale(plotData[i]);
			}
		})
		.attr('x2', function(d,i){
			return margin.left + widthScale(i);
		})
		.attr('y2', function(d,i) {
			return VERTICAL_OFFSET + heightScale(plotData[i]);
		})
		.attr('stroke-width', 1)
		.attr('stroke', function(d, i) { return color2(plotData[i])})
		
	line.exit()
		.remove();
};
function stopButton(){
	clearInterval(intervalFN);
}