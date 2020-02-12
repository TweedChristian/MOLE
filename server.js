const net = require("net");
const http = require('http');
const frontPort = 3000;
const fs = require('fs');
const mime = require('mime');

let serve;
let socket;
let port = 7086;
let received = 0;
let dir = ''

// >>>>
startNetServer();
// <<<<<

const server = http.createServer(function(request, response){
    console.log(request.method);
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

function handleGet(request, response){
    console.log("DOES NOT PASS THE VIBE CHECK");
    const filename = dir + request.url.slice(1);
    console.log("get",filename);

    if(request.url ==='/'){
        sendFile(response, 'index.html');
    }
    else{
        sendFile(response, filename);
    }
}

const sendFile = function(response, filename){
    const type = mime.getType(filename);
    console.log(filename);
    fs.readFile(filename, function(err, content){
        if(err === null){
            //no error file found
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

function handlePost(request, response){
    let dataString = '';
    request.on('data', function(data){
        dataString += data;
    });
    request.on('end', function(){
        console.log(JSON.parse(dataString));
        //TODO: switch later based on json.type
        let status = handleControls(JSON.parse(dataString));
        //SEND TO NET
        // >>>>>>>>>>>>>>>>>>>>
        console.log("hello");
        sendToDataLayer(dataString);
        // <<<<<<<<<<<<<<<<<<<<<
        response.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
        response.end(JSON.stringify(status), 'utf-8');
    })
}

function handleControls(controls){
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
function handleOtherRequest(response){
    response.writeHeader(418);
    response.end();
}

function startNetServer(){
    console.log('Net Server Started');
    serve = net.createServer(function(soc) {
        socket = soc;
    });
}

//im uncommenting this 
function sendToDataLayer(obj){
    let validChars = ['w', 'a', 's', 'd'];
    let val = JSON.parse(obj);
    try{
        socket.write(JSON.stringify(val));
        // console.log(obj);
        socket.on('data', function(data){
            // console.log(data.toString());
            serve.close();
        })
    }
    catch(error){
        console.log(error);
    }
}
// >>>
serve.listen(port); //7084
//  <<<
server.listen(process.env.PORT || frontPort); //3000

setTimeout(function(){
    console.log('slow');
   // serve.close()
    server.close();
}, 100000)


/** 
let s = net.Socket();
s.connect(port);
s.write('jef2');
s.on('data', function(data){
    console.log(data.toString());
})
s.end(); */

// function startServer(){
//     console.log('Server Started')
//     serve = net.createServer(function (socket){
//         let message = makeMoveJSON();
//         try{
//         socket.on('data', function(data){
//             console.log(data.toString());
//             if(received === 0){
//                 socket.write(message);
//             }
//             else{
//                 socket.write('Got your json bby');
//             }
//         });
//         }
//         catch(error){
//             console.log(error);
//         }
//     });
// }

// function makeMoveJSON(){
//     let move = {
//         yaw: 20,
//         pitch: 30,
//         duration: 10
//     };
//     let newJSON = JSON.stringify(move)
//     return newJSON
// }