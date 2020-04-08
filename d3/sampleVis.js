let dynamicDataContainer = {
    active : true,
    dataArray : []
};
let staticDataContainer = {
    active: false,
    dataArray : [-0.5,0.9,0.09,0.25,-0.3,0.5,0.1]
};
testVisSVG = initialize("dataviz", 1000, 640, "Time", "Y-axis data");
plot(dynamicDataContainer.dataArray, testVisSVG, 640);
/**
 * Grabs value from input box and pushes it to data array
 */
function getInputFromBox() {
    let box = document.getElementById("inputBoxTest");
    console.log(box.value);
    addData(+box.value,testVisSVG, dynamicDataContainer);
    box.value='';
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
    plot([], testVisSVG, 640);
    console.log(testData)
}
/**
 * Switches between active data containers, draws the active container to the vis
 */
function dataSwitch(){
    let selector = document.getElementById("dataSelector")
    console.log(selector.value);
    // clearPlot();
    if(selector.value == "test"){
        staticDataContainer.active = true;
        dynamicDataContainer.active = false;
        plot(staticDataContainer.dataArray, testVisSVG, 600);
    }
    if(selector.value == "dynamic"){
        staticDataContainer.active = false;
        dynamicDataContainer.active = true;
        plot(dynamicDataContainer.dataArray, testVisSVG, 600);
    }
}