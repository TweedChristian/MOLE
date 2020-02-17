const circleRadius = 5;
const DATA_INTERVAL = 100;
const margin = {top: 10, right: 30, bottom: 30, left: 60}

let dataset = 0;
let dataIndex = 0;
let altData = [12,133,60,346,487,128,112,90,243,457,234];
let testData = new Array();

let colorScale = d3.scaleLinear()
.domain([0, 500])
.range([0,1]);

let color2 = d3.scaleLinear()
.domain([0,500])
.range(['blue', 'red']);
let intervalFN;



function initialize(svgName, width, height, xAxis, yAxis){

    let svgWidth = width;
    let svgHeight = height;
    let svg = d3.select("#"+svgName)
    .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("style", "background-color: #f0f0f0")
    // .append("g")
    //     .attr("transform", "translate("+ margin.left + "," + margin.top + ")")  
        
    let yLabel = svg.append('text')
        .text(yAxis)
        .attr('x', 20)
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
            //console.log("hmm")
            //.transition()
            //.attr('cx', 0)
            //console.log("hmm")
            .remove();
        circle.enter() //create circles
          .append("circle")
          .attr('cx', function(d,i){
            console.log(d);
            return 10 + (10 * i);
          })
          .attr('r', circleRadius)
          .attr('fill-opacity', 0)
          .attr('fill', function(d, i) {
            return color2(plotData[i]);
          })
          .attr('cy', function(d, i) {
            console.log("Y", height - (plotData[i] + 2 * circleRadius));
            console.log(plotData[i])
            console.log(circleRadius)
            return height - (plotData[i] + 2 * circleRadius)
          })
          .transition()
          .attr('fill-opacity',1)
        circle.transition() //update circles position if data changes
          .attr('cy', function(d, i) {
            return height - (plotData[i] + 2 * circleRadius)
          })
          .attr('fill-opacity',1);
        line.enter()
          .append("line")
            //.attr('x1', dataIndex - (2 * circleRadius))
            .attr('x1', function(d, i){
              return (i * (2*circleRadius));
            })
            .attr('y1', function(d,i) {
              if(i != 0){
                return height -(plotData[i-1] + (2* circleRadius))
              }
              else{
                return height -(plotData[i] + (2* circleRadius))
              }
            })
            .attr('x2', function(d , i){
              return i * (2*circleRadius);
            })
            .attr('y2', function(d,i) {
                return height -(plotData[i] + (2* circleRadius))
            })
            .transition()
            .attr('x2', function(d,i){
              return (i+1) * (2 * circleRadius);
            })
            .attr('stroke-width', 1)
            .attr('stroke', function(d, i) { return color2(plotData[i])})

          line.transition()
            .duration(DATA_INTERVAL)
            .attr('x1', function(d, i){
              return (i * (2*circleRadius));
            })
            .attr('y1', function(d,i) {
              if(i != 0){
                return height -(plotData[i-1] + (2* circleRadius))
              }
              else{
                return height -(plotData[i] + (2* circleRadius))
              }
            })
            .attr('x2', function(d,i){
              return (i + 1) * (2 * circleRadius);
            })
            .attr('y2', function(d,i) {
              return height - (plotData[i] + (2*circleRadius))
            })
            .attr('stroke-width', 1)
            .attr('stroke', function(d, i) { return color2(plotData[i])})
        line.exit()
          .remove();

      };
      function stopButton(){
        clearInterval(intervalFN);
      }
      function changeData(){
        console.log("Changing Data")
        if(dataset == 0){
          dataset = 1;
          plot(altData, svg);
        }
        else{
          dataset = 0;
          plot(testData,svg);
        }
      }