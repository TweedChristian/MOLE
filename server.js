const net = require("net");

let serve;
let port = 7084;
let received = 0;
function makeMoveJSON(){
    let move = {
        yaw: 20,
        pitch: 30,
        duration: 10
    };
    let newJSON = JSON.stringify(move)
    return newJSON
}

function startServer(){
    console.log('Server Started')
    serve = net.createServer(function (socket){
        let message = makeMoveJSON();
        try{
        socket.on('data', function(data){
            console.log(data.toString());
            if(received === 0){
                socket.write(message);
            }
            else{
                socket.write('Got your json bby');
            }
        });
        }
        catch(error){
            console.log(error);
        }
    });
}

startServer();

serve.listen(port);


setTimeout(function(){
    console.log('slow');
    serve.close()
}, 100000)


/** 
let s = net.Socket();
s.connect(port);
s.write('jef2');
s.on('data', function(data){
    console.log(data.toString());
})
s.end(); */