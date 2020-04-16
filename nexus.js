/**This file is what interacts with all other libraries and organizes
them in a 'process' */

//import path vis module
//import data vis module
//import pathing module
//import server module

let obstacles = [];
let values = [];
let controls = [];
//[ x, y, z, radius ]

function main() {
    populate();
    setupControls();
    collisionDetection([1,1,0], [4,1,0], [1,-1,0], [4,2,0]);
    collisionDetection([1,1,0],[4,1,0], [2,2,0], [4,4,0]);
}


function collisionDetection(i1, f1, i2, f2){
    let pd = [
        i1[0] - f1[0],
        i1[1] - f1[1],
        i1[2] - f1[2]
    ];
    let pm = cross(i1, f1);
    let qd = [
        i2[0] - f2[0],
        i2[1] - f2[1],
        i2[2] - f2[2]
    ];
    let qm = cross(i2, f2);
    console.log("===Vectors===");
    console.log("===pd===");
    console.log(pd);
    console.log("===pm===");
    console.log(pm);
    console.log('===qd===');
    console.log(qd);
    console.log('===qm===')
    console.log(qm);
    console.log('===w test===');
    console.log(dot(pd, pm) + dot(qd, qm));
    console.log("===intersect testing===");
    console.log(dot(pd, qm));
    console.log(dot(qd, pm));
    let intersect = (dot(pd, qm) + dot(qd, pm));
    let parallel = cross(pd, qd);
    console.log("===parallel===");
    console.log(parallel);
    let xAxis = [1,0,0];
    let yAxis = [0,1,0];
    let zAxis =[0,0,1];
    console.log("===intersect===");
    console.log(intersect);
    let xtest = dot(cross(pd,qd), xAxis);
    console.log('===XTEST===');
    console.log(xtest);
    let ytest = dot(cross(pd,qd), yAxis);
    console.log("===YTEST===");
    console.log(ytest);
    let ztest = dot(cross(pd,qd), zAxis);
    console.log("===ZTEST===");
    console.log(ztest);
    let res = multConst(dot(pm, zAxis), qd);
    console.log('===MultConstTest===')
    console.log(res);
    res = subtractVectors(res, multConst(dot(qm, zAxis), pd));
    console.log(res);
    res = subtractVectors(res, multConst(dot(pm, qd), zAxis));
    console.log(res);
    res = divideConst(dot(cross(pd, qd), zAxis), res);
    console.log(res);

}

function mult(u, v){
    return [(u[0] * v[0]), (u[1] * v[1]), (u[2] * v[2])];
}

function multConst(c, u){
    return [(c * u[0]), (c * u[1]), (c * u[2])];
}

function addVectors(u,v){
    return [(u[0] + v[0]), (u[1], v[1]), (u[2], v[2])];
}

function subtractVectors(u,v){
    return [(u[0] - v[0]), (u[1] - v[1]), (u[2] - v[2])];
}
function divideConst(c, u){
    return [(u[0] / c), (u[1] / c), (u[2] / c)];
}
// function fetchData() {
//     let distance = +document.getElementById('distance').value;
//     let depth = +document.getElementById('depth').value;
//     let arc = document.getElementById('arc').checked;
//     //Emptying the array
//     values.splice(0, values.length);
//     values.push(distance, depth, arc);
//     console.log(values);
// }

// function addObject() {
//     let x = +document.getElementById('x').value;
//     let y = +document.getElementById('y').value;
//     let z = +document.getElementById('z').value;
//     let radius = +document.getElementById('radius').value;
//     obstacles.push([x, y, z, radius]);
//     console.log(obstacles);
// }


function setupControls() {
    //let mode = document.getElementById('mode').checked;
    // if (mode == true) {
    //     document.addEventListener('keydown', (event) => {
    //         //Should probably filter key here    
    //         //TODO: Add keyup listener for control things only

    //         send(event.key);
    //     });
    // }
    // else {
    //     document.addEventListener('keyup', (event) => {
    //         filterKey(event.key);
    //     })
    // }
    document.addEventListener('keyup', (event) => {
        filterKey(event.key);
    })
}

//TODO: Add red text for reject
function addCommand(message) {
    let ul = document.getElementById('logBox');
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
}


function send(req) {
    console.log("i give up")
    //Send key to server
    console.log(req);
    fetch('/submit', {
        method: 'POST',
        body: JSON.stringify(req),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(status => {
            console.log(status);
        })
}

function handleResponse(response) {
    switch (response.types) {
        case 'status':
            handleStatus(response);
        case 'desync':
            handleDesync(response);
        case 'error':
            console.log(response.error);
        case 'emergency':
            handleEmergency();
    }
}

function compare() {
    let bore = document.getElementById('boring').value;
    let extension = document.getElementById('extension').value;
    let turnx = document.getElementById('turnx').value;
    let turnz = document.getElementById('turnz').value;
    let newVals = [bore, extension, turnx, turnz];
    let names = ['Boring Speed: ', 'Extension Rate: ', 'Turning X: ', 'Turning Z: '];
    let changedFlag = 0;
    //Comparing the new settings to the old ones
    for (let i = 0; i < newVals.length; i++) {
        if (newVals[i] !== controls[i]) {
            addCommand(names[i] + newVals[i]);
            controls[i] = newVals[i];
            changedFlag = 1;
        }
    }
    if (!changedFlag) {
        addCommand('No Effect');
        //Don't send anything
        return null;
    }
    if (changedFlag) {
        let controlsJSON = {
            type: 'controls',
            boringSpeed: bore,
            extensionRate: extension,
            turningX: turnx,
            turningZ: turnz,
            inflateFront: controls[4],
            inflateBack: controls[5],
        }
        return controlsJSON;
    }
}

function populate() {
    let bore = document.getElementById('boring').value;
    let extension = document.getElementById('extension').value;
    let turnx = document.getElementById('turnx').value;
    let turnz = document.getElementById('turnz').value;
    controls = [bore, extension, turnx, turnz, false, false];
}

//Small bug here, if I click the button and then hit enter it clicks
//the bug again
function inflate(location) {
    if (location === 0) {
        if (controls[4] === false) {
            addCommand('Inflating Front');
            controls[4] = true;
        }
        else {
            addCommand('Deflating Front');
            controls[4] = false;
        }
    }
    else {
        if (controls[5] === false) {
            addCommand('Inflating Back');
            controls[5] = true;
        }
        else {
            addCommand('Deflating Back');
            controls[5] = false;
        }
    }
    let controlsJSON = {
        type: 'controls',
        boringSpeed: controls[0],
        extensionRate: controls[1],
        turningX: controls[2],
        turningZ: controls[3],
        inflateFront: controls[4],
        inflateBack: controls[5],
    }
    send(controlsJSON);
}

function filterKey(key) {
    if (key == 'Enter') {
        // console.log(compare());
        send(compare())
    }
    else {
        //send(key);
    }
}