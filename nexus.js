/**This file is what interacts with all other libraries and organizes
them in a 'process' */

//import path vis module
//import data vis module
//import pathing module
//import server module

let obstacles = [];
let values = [];

//[ x, y, z, radius ]

function main(){
    toggle();
}

function fetchData(){ 
    let distance = +document.getElementById('distance').value;
    let depth = +document.getElementById('depth').value;
    let arc = document.getElementById('arc').checked;
    //Emptying the array
    values.splice(0, values.length);
    values.push(distance, depth, arc);
    console.log(values);
    setupControls();
}

function toggle(){
    document.getElementById('parabola').addEventListener('change', () => {
        document.getElementById('arc').checked = !document.getElementById('parabola').checked;
    })
    document.getElementById('arc').addEventListener('change', () => {
        document.getElementById('parabola').checked = !document.getElementById('arc').checked;
    })
}

function addObject(){
    let x = +document.getElementById('x').value;
    let y = +document.getElementById('y').value;
    let z = +document.getElementById('z').value;
    let radius = +document.getElementById('radius').value;
    console.log(typeof x)
    obstacles.push([x,y,z,radius]);
    console.log(obstacles);
}


function setupControls(){
    let mode = document.getElementById('mode').checked;
    if(mode == true){
        document.addEventListener('keydown', (event) => {
            console.log(event.key);
            send(event.key);
        });
    }
    else{
        document.addEventListener('keyup', (event) => {
            console.log(event.key);
            send(event.key);
        })
    }
}

function send(key){
    //Send key to server
    fetch('/submit', {
        method: 'POST',
        body: JSON.stringify({character: key}),
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(f => {
        console.log(f);
    })
}
