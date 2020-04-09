const net = require("net");
const http = require('http');
const frontPort = 3000;
const fs = require('fs');
const mime = require('mime');
const path = require('path');

let pythonServer;
let socket;
let port = 7086;
let received = 0;
let dir = '../front-end/';

/**CONTROLS
 * type: 'controls'
 * boringSpeed
 * extensionRate
 * inflateFront
 * inflateBack
 * turningZ
 * turningX
 */

 /**ERROR
  * type: 'error'
  * message (255 char limit)
  */

/**PATH
 * type: 'path',
 * yaw,
 * pitch,
 * roll
 */

 /**STATUS
  * type: 'status',
  * imuAccX,
  * imuAccY,
  * imuAccZ,
  * imuYaw,
  * imuPitch,
  * imuRoll,
  * boringRPM,
  * extensionRPM,
  * drillTemp,
  * steeringYaw,
  * steeringPitch,
  * frontPSI,
  * backPSI
  */



//Starting the servers
startNetServer();

//Initializing our http server
const httpServer = http.createServer(function(request, response){
   // console.log(request.method);
    if(request.method === 'GET'){
        handleGet(request, response);
    }
    else if(request.method === 'POST'){
        handlePost(request, response);
    }
    else{
        handleOtherRequest(response);
    }
})

if(httpServer){
    console.log('HTTP Server Started');
}
else{
    console.log('Failed to Initialize HTTP Server')
}

/**Takes a GET request from a client, and then checks whether or not
 * the file is in one of our folders, and responds with the appropriate
 * file if applicable
 * @param request is the http request
 * @param response is the http response we will send out, possibly containing the file
 */
function handleGet(request, response){
    const filename = dir + request.url.slice(1);
    console.log("get",filename);

    switch(request.url){
        case '/':
            sendFile(response, '../front-end/index/index.html');
            break;
        case '/controls':
            sendFile(response, '../front-end/controls/controls.html');
            break;
        case '/about':
            sendFile(response, '../front-end/about/about.html');
            break;
        case '/pathing':
            sendFile(response, '../front-end/pathing/pathing.html');
            break;
        case '/datavis':
            sendFile(response, '../front-end/datavis/datavis.html');
            break;
        default:
            sendFile(response, filename);
            break;
    }
}

/**Takes a given file name, and attempts to locate the file within
 * our system, if it is not found it returns a 404
 * @param response is the http response we will send
 * @param filename is the name of the file from the http request
 */
const sendFile = function(response, filename){
    const type = mime.getType(filename);
   // console.log(filename);
  //  console.log(type);
    let filePath = path.resolve(__dirname, filename)
    fs.readFile(filePath, function(err, content){
        if(err === null){
            //no error, file found
            response.writeHead(200, {'Content-Type': type});
            response.end(content);
        }
        else{
            //file not found
            response.writeHead(404);
            response.end('404 Error: File Not Found');
        }
    });
}

/**Takes an http request, and checks the 'type' field of the 
 * json, returns 400 if the type doesn't match one of our commands,
 * or will return 500 if there are errors with the data layer
 * @param {*} request is the http request we received
 * @param {*} response is the http response we will send
 */
function handlePost(request, response){

    let dataString = '';

    request.on('data', function(data){
        dataString += data;
    });

    request.on('end', function(){
        console.log("REQUEST SPOT");
        console.log(JSON.parse(dataString));
        let dataJSON = JSON.parse(dataString);
        if(dataJSON){
            switch(dataJSON.type){
                case 'controls':
                    handleControls(dataJSON, response);
                    break;
                case 'error':
                    handleError(dataJSON, response);
                    break;
                case 'path':
                    handlePathing(dataJSON, response);
                    break;
                default:
                    response.writeHead(400, 'Incorrect Command', {'Content-Type': 'text/plain'});
                    response.end('Your POST request did not follow the typing conventions');
            }
        }
        else {
            response.writeHead(400, 'No Command', {'Content-Type': 'text/plain'});
            response.end('Your POST request did not contain any command information.');
        }
        //SEND TO NET
        // console.log("hello");
        // sendToDataLayer(dataString);
        // response.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
        // response.end(JSON.stringify(status), 'utf-8');
    })
}

/**Handles the controls message, along with the status of
 * the python request
 * @param {JSON} data is the JSON object containing the controls information
 * @param response is the HTTP response we will send
 */
function handleControls(data, response){
    processControls(data);
    let result = sendToDataLayer(data);
    if(result){
        response.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
        response.end(JSON.stringify(result), 'utf-8');
    }
    else {
        response.writeHead(500, 'Issue with the data layer', {'Content-Type': 'text/plain'});
        response.end();
    }
}

/**Takes the control information from the client and applies processing on it.
 * Currently, this function does nothing.
 * @param {JSON} controls 
 */
function processControls(controls){
    //TODO: get rid of dummy data for actual polling from the arduino
    let status = {
        type: 'status',
        imuAccX: 1.0,
        imuAccY: 0.0,
        imuAccZ: 1.2,
        imuYaw: 1.0,
        imuPitch: 1.0,
        imuRoll: 0.0,
        boringRPM: 1.1,
        extensionRPM: 1.0,
        drillTemp: 100,
        steeringYaw: 1.0,
        steeringPitch: 10.0,
        frontPSI: 90.0,
        backPSI: 80.0
    }
    return status;
}

/**Takes an Error command, and decides on what to do with it,
 * currently only prints the message to the console, in future iterations,
 * we will have classified forms of errors, passes the error down
 * @param data is the JSON containing the error message
 * @param response is the response we will send
 */
function handleError(data, response){
    console.log(data.message);
    let result = sendToDataLayer(data);
    if(result) {
        response.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
        response.end(JSON.stringify(result), 'utf-8');
    }
    else{
        response.writeHead(500, 'Issue with the Data Layer', {'Content-Type': 'text/plain'});
        response.end();
    }
}

/**Takes a path command from the client and applies processing to it,
 * then preceeds to send it to the data layer and responds accordingly to the 
 * data layer
 * @param data is the JSON containing the pathing command
 * @param response is the HTTP response we will send
 */
function handlePathing(data, response){
    if(data){
        console.log(data);
        //processPathing(data);
        let result = sendToDataLayer(data);
        if(result) {
            response.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            response.end(JSON.stringify(result), 'utf-8')
        }
        else {
            response.writeHead(500, 'Issue with the Data Layer', {'Content-Type': 'text/plain'});
            response.end();
        }
    }
    else{
        console.log('No data received');
        response.writeHead(500, 'Could not Process Pathing Command', {'Content-Type': 'text/plain'});
        response.end();
    }
}

/**We currently don't have a way to deal with requests that aren't gets or posts
 * so we return 418, I'm a little teapot
 * @param response is the http response we will send
 */
function handleOtherRequest(response){
    response.writeHeader(418);
    response.end();
}

/**Initializes the connection to the python data layer
 * with a TCP socket connection
 */
function startNetServer(){
    pythonServer = net.createServer(function(soc) {
        socket = soc;
    });
    if(pythonServer){
        console.log('Net Server Started');
    }
    else{
        console.log('Net Server Failed to Start');
    }
}

/**Converts our JSON object to a string and sends it over the net server's socket to 
 * communicate with the python client
 * @param {JSON} json is the object we will be passing to the data layer
 * @returns the response from the python server, or null if we fail the request
 */
function sendToDataLayer(json){
    console.log('Message Testing');
    try{
        socket.write(JSON.stringify(json));
        socket.on('data', function(data){
            // console.log(data.toString());

            //I'm not sure why we're closing the server
            pythonServer.close();

            //Data comes in as a buffer
            return data.toString();
        })
    }
    catch(error){
        console.log("ERROR OCCURED");
        console.log(error);
        return null; //For error checking above
    }
}

/**Takes the response from the data layer, and maps the appropriate 
 * action with the reponse type. If the JSON is malformed, we handle it like
 * an error.
 * @param {JSON} json is the JSON the data layer has provided us.
 */
function handleDataLayerResponse(json) {
    //TODO: BUILD THIS OUT
}


pythonServer.listen(port); //7084
httpServer.listen(process.env.PORT || frontPort); //3000


process.on('SIGTERM', () => {
    pythonServer.close();
    httpServer.close();
    console.log("Exit time");
    process.exit();
})
