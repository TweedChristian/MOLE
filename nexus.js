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