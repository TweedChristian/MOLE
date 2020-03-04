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



function initialize(svgName, width, height, xAxis, yAxis){

    let svgWidth = width;
    let svgHeight = height;
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
	let heightAxis = d3.axisLeft(heightScale);
	
	svg.append("g")
		.attr("transform", "translate(60,"+VERTICAL_OFFSET +")")
		.call(heightAxis);
    return svg;
}
function plot(plotData, plotSVG, height){
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
			return 60 + (2*circleRadius * i);
		})
		.attr('r', circleRadius)
		.attr('fill-opacity', 0)
		.attr('fill', function(d, i) {
			return color2(plotData[i]);
		})
		.attr('cy', function(d, i) {
			// return height - (plotData[i] + 2 * circleRadius)
			return 30 + heightScale(plotData[i]);
		})
		.transition()
			.attr('fill-opacity',1)

	circle.transition() //update circles position if data changes
		.attr('cy', function(d, i) {
			//return height - (plotData[i] + 2 * circleRadius)
			return VERTICAL_OFFSET + heightScale(plotData[i]);
		})
		.attr('fill', function(d,i){
			return color2(plotData[i])
		})
		.attr('fill-opacity',1);

	line.enter()
		.append("line")
		.attr('x1', function(d, i){
			if(i != 0){
				return (50 + (2*circleRadius*i));
			}
			else{
				return(60 + (2*circleRadius*i));
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
			return 60 + (2*circleRadius * i);
		})
		.attr('y2', function(d,i) {
			return VERTICAL_OFFSET + heightScale(plotData[i]);
		})
		.attr('stroke-width', 1)
		.attr('stroke', function(d, i) { return color2(plotData[i])})

	line.transition()
		.duration(DATA_INTERVAL)
		.attr('x1', function(d, i){
			if(i != 0){
				return 50 + (i * (2*circleRadius));
			}
			else{
				return (60 + (i * circleRadius * 2));
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
		// .attr('x2', function(d,i){
		// 	return ((i + 1) * (2 * circleRadius))+60;
		// })
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