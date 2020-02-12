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
        console.log(compare());
    }
    else {
        //send(key);
    }
}