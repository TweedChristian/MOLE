const net = require("net");
const http = require('http');
const frontPort = 3000;
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { Parser } = require('json2csv');

const adapter = new FileSync('db.json');
const db = low(adapter);

let pythonServer;
let socket;
let port = 7086;
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
 * roll,
 * distance
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
  * extensionRate,
  * drillTemp,
  * steeringYaw,
  * steeringPitch,
  * frontPSI,
  * backPSI
  */

  //TODO: ADD OTHER COMMANDS FROM DB

/**
 * SERVER, DATABASE INITIALIZE FUNCTIONS
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

//Checking on initialization of HTTP Server
if(httpServer){
    console.log('HTTP Server Started');
}
else{
    console.log('Failed to Initialize HTTP Server')
}

//Checking on Initialization of LowDB Database
if(db){
    initializeDb();
    console.log('Database Initialized');
}
else{
    console.log('Failed to Initialize Database');
}

/**Preloads the database with relevant fields, and
 * sets the time fields to date.now
 * @field sentControls,
 * @field controlsStatusResponses
 * @field idealPathPoints
 * @field sentPaths
 * @field obstacles
 * @field pathStatusResponses
 * @field correctedPathPoints
 * @field errors
 * @field lastUpdated
 * @field createdAt
 */
function initializeDb() {
    db.defaults(
        {
            sentControls: [],
            controlsStatusResponses: {
                driftX: [],
                driftY: [],
                driftZ: []
            },

            idealPathPoints: [],
            sentPaths: [],
            obstacles: [],
            correctedPathPoints: [],
            pathStatusResponses: {
                imuAccX: [],
                imuAccY: [],
                imuAccZ: [],
                imuYaw: [],
                imuPitch: [],
                imuRoll: [],
                boringRPM: [],
                extensionRate: [],
                drillTemp: [],
                steeringYaw: [],
                steeringPitch: [],
                frontPSI: [],
                backPSI: []
            },
            errors: [],
            lastUpdated: Date.now(),
            createdAt: Date.now()
        }
    )
    .write(); 
}


/**
 * HTTP FUNCTIONS
 */

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
        case '/compile':
            sendFile(response, '../front-end/compile/compile.html');
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
                case 'compile':
                    handleCompile(dataJSON, response);
                    break;
                case 'pathInitialize':
                    handlePathInitialize(dataJSON, response);
                    break;
                case 'correctPath':
                    handleCorrectPath(dataJSON, response);
                    break;
                case 'addObstacle': 
                    handleAddObstacle(dataJSON, response);
                    break;
                    //TODO: Talk with tom about whether or not to send the whole db
                case 'dataVisRequest':
                    handleDataVisRequest(dataJSON, response);
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
    });
}


function handleCompile(dataJSON, response) {

    //this will just send a csv
    // response.end(JSON.stringify(status), 'utf-8');
}

function handlePathInitialize(dataJSON, response) {

}

function handleCorrectPath(dataJSON, response) {

}

function handleAddObstacle(dataJSON, response) {

}

function handleDataVisRequest(dataJSON, response) {

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

/**Takes the control information from the client and process it for some information.
 * It adds it to the database as well.
 * @param {JSON} controls 
 */
function processControls(controls){
    writeToDb(data);
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
        extensionRate: 1.0,
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
    writeToDb(data);
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
    writeToDb(data);
    if(data){
        console.log(data);
        //processPathing(data);
        let result = sendToDataLayer(data);
        if(result) {
            //TODO: Switch on the type of result
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


/**
 * DATA LAYER FUNCTIONS
 */



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



process.on('SIGTERM', () => {
    pythonServer.close();
    httpServer.close();
    console.log("Exit time");
    process.exit();
})



/**
 * DATABASE FUNCTIONS
 */

/** A function that takes a given JSON file, and 
 * maps it to the appropriate attribute.
 * If the type cannot match, it will add an error message
 * @param {JSON} dataJSON 
 */
function writeToDb(dataJSON) {
    switch(dataJSON.type){

        //A pathing command
        case 'path':
            db.get('sentPaths')
              .push(dataJSON);

            updateDbTime();
            break;

        //Error messages
        case 'error':

            db.get('errors')
            .push(dataJSON.message);

            updateDbTime();
            break;

        //Manual Controls 
        case 'controls':

            db.get('sentControls')
              .push(dataJSON)

            updateDbTime();
            break;

        //General Machine Status received from controls
        case 'status':

            let currentState = db.get('controlsStatusResponses').value();

            currentState.imuAccX.push(dataJSON.imuAccX);
            currentState.imuAccY.push(dataJSON.imuAccY);
            currentState.imuAccZ.push(dataJSON.imuAccZ)
            currentState.imuPitch.push(dataJSON.imuPitch);
            currentState.imuRoll.push(dataJSON.imuRoll);
            currentState.imuYaw.push(dataJSON.imuYaw);
            currentState.drillTemp.push(dataJSON.drillTemp);
            currentState.extensionRate.push(dataJSON.extensionRate);
            currentState.steeringPitch.push(dataJSON.steeringPitch);
            currentState.steeringYaw.push(dataJSON.steeringYaw);
            currentState.boringRPM.push(dataJSON.boringRPM);
            currentState.frontPSI.push(dataJSON.frontPSI);
            currentState.backPSI.push(dataJSON.backPSI);

            db.set('controlsStatusResponses', currentState);

            updateDbTime();
            break;

        //Received Localization Data
        case 'pathStatus':

            let currentDriftState = db.get('pathStatusResponses');

            currentDriftState.driftX.push(dataJSON.driftX);
            currentDriftState.driftY.push(dataJSON.driftY);
            currentDriftState.driftZ.push(dataJSON.driftZ);

            db.set('pathStatusResponses', currentDriftState);

            updateDbTime();
            break;

        //The initial full path generation
        case 'pathInitialize':

            let points = dataJSON.points;
            let obstacles = dataJSON.obstacles;

            db.set('idealPathPoints', points);
            db.set('obstacles', obstacles);

            updateDbTime();
            break;

        //We don't call this, but this is for when the robot
        //detects a new obstacle
        case 'addObstacle':

            db.get('obstacles')
              .push(dataJSON.obstacle);

            updateDbTime();
            break;
        
        case 'correctPath':
            //Will Only Send One Point at a Time
            // [x,y,z,1]
            db.get('correctedPathPoints')
              .push(dataJSON.point)

            updateDbTime();
            break;

            //No match for the db, write an error message
        default:

            db.get('errors')
              .push('Failed to Match the JSON Object');

            updateDbTime();
    }
}

/**A small helper function to fill in the last update
 * time for the database. It also functions as the write
 * call. 
 */
function updateDbTime(){
    db.set('updatedAt', Date.now()).write();
}



//Server Listen
pythonServer.listen(port); //7086
httpServer.listen(process.env.PORT || frontPort); //3000