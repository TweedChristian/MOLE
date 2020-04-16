let MV = document.createElement('script');
MV.src = '../../lib/MV.js';
document.head.appendChild(MV);

function generateCurve(obstacle){
    
}

// function generateEurlers(vectorI, vectorF){
//     let x = vectorF.x - vectorI.x;
//     let y = vectorF.y - vectorI.y;
//     let z = vectorF.z - vectorI.z;
//     let yaw = Math.atan2(x,y);
//     let pitch = Math.atan2(y,z);
//     let roll = Math.atan2(z,x);
//     let result = {
//     }
// }

function checkVectors(sideLength, turningAngle){
    //equation: y = sqrt((s*s) / 2 - (x * x))
    let vectors = [];
    let newSideLength = alterSideLength(sideLength);
    let segmentLength = 4;
    let intervals = newSideLength / segmentLength;
    let x, y, x2, y2;
    let validAngle = true;
    for(let i=0; i < intervals; i++){
        x = i * segmentLength;
        y =  -Math.sqrt((Math.pow(sideLength, 2) / 2) - (Math.pow(x, 2)));
        vectors.push([x,y,z,1]);
        x2 = (i+1) * segmentLength;
        y2 = -Math.sqrt((Math.pow(sideLength,2) / 2) - (Math.pow(x2,2)));
        if(Math.atan2(y2 - y, x2 - x) > turningAngle){
            validAngle = false;
        }
    }
    console.log(vectors);
}

//MAKE SIDE LENGTH DIVISIBLE BY 4 IN ORDER TO SEGMENTIZE


//Inflates the object to 
function alterSideLength(sl){
    let fixedSideLength = Math.ceil(sl);
    let offset = fixedSideLength % 4;
    fixedSideLength += (4 - offset);
    return fixedSideLength;
}

/**
 * Keep track of current angle turned
 * 
 */


 //TODO: make a way to find the midpoint of a curve that only has 2 points

 //obstacle is center and side length
 //curve is start, and end

function collisionDetection(start, end, obstacle){
    let pd = {
        x: end.x - start.x,
        y: end.y - start.y,
        z: end.z - start.z
    }
    let pm = {
    }

}