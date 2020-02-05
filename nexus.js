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

function fetchData() {
    let distance = +document.getElementById('distance').value;
    let depth = +document.getElementById('depth').value;
    let arc = document.getElementById('arc').checked;
    //Emptying the array
    values.splice(0, values.length);
    values.push(distance, depth, arc);
    console.log(values);
}

function addObject() {
    let x = +document.getElementById('x').value;
    let y = +document.getElementById('y').value;
    let z = +document.getElementById('z').value;
    let radius = +document.getElementById('radius').value;
    obstacles.push([x, y, z, radius]);
    console.log(obstacles);
}


function setupControls() {
    let mode = document.getElementById('mode').checked;
    if (mode == true) {
        document.addEventListener('keydown', (event) => {
            //Should probably filter key here    
            //TODO: Add keyup listener for control things only

            send(event.key); 
        });
    }
    else {
        document.addEventListener('keyup', (event) => {
            filterKey(event.key); 
        })
    }
}
//TODO: Add red text for reject
function addCommand(message) {
    let ul = document.getElementById('logBox');
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
}

function send(key) {
    //Send key to server
    addCommand('Key pressed: ' + key);
    fetch('/submit', {
        method: 'POST',
        body: JSON.stringify({ character: key }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(f => {
            console.log(f);
        })
}
function compare(){
    let bore = document.getElementById('boring').value;
    let extension = document.getElementById('extension').value;
    let turnx = document.getElementById('turnx').value;
    let turnz = document.getElementById('turnz').value;
    if(bore !== controls[0]){
        addCommand('Boring speed: ' + bore);
        controls[0] = bore;
    }
    else if(extension !== controls[1]){
        addCommand('Extension Rate: ' + extension);
        controls[1] = extension;
    }
    else if(turnx !== controls[3]){
        addCommand('Turning x: ' + turnx + ' degrees');
        controls[3] = turnx;
    }
    else if(turnz !== controls[4]){
        addCommand('Turning z: ' + turnz + ' degrees');
        controls[4] = turnz;
    }
    else{
        addCommand('No effect');
    }
}

function populate(){
    let bore = document.getElementById('boring').value;
    let extension = document.getElementById('extension').value;
    let turnx = document.getElementById('turnx').value;
    let turnz = document.getElementById('turnz').value;
    controls = [bore, extension, false, turnx, turnz];
}

//Small bug here, if I click the button and then hit enter it clicks
//the bug again
function inflate(){
    if(controls[2] === false){
        addCommand('Inflating');
        controls[2] = true;
    }
    else{
        addCommand('Deflating');
        controls[2] = false;
    }
}

function filterKey(key){
    if(key == 'Enter'){
        compare();
    }
    else{
        send(key);
    }
}