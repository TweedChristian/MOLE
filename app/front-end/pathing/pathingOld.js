let MV = document.createElement('script');
MV.src = '../../lib/MV.js';
document.head.appendChild(MV);

let pathColors;
let pathPoints;


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



/** Obsolete curve generation algorithms */


function outsideAngleGeneration() {
    //start at -5
    // points.push(vec4(-20,0.0,0.0,1.0));
    // points.push(vec4(-20,segDist,0.0,1.0));
    // colors.push(colorSelection[7]);
    // colors.push(colorSelection[8]);

    for (let i = 0; i < 12; i++) {
        let x, y;
        let startX = 0;
        let startY = 0;
        if (i === 0) {
            pathPoints.push(vec4(startX, startY, 0.0, 1.0));
            pathColors.push(colorSelection[2]);
            x = genX(i, startX);
            y = genY(i, startY);
            pathPoints.push(vec4(x, y, 0.0, 1.0));
            pathColors.push(colorSelection[3]);
            tempX = x;
            tempY = y;
        }
        else {
            x = genX(i, tempX);
            y = genY(i, tempY);
            tempX = x;
            tempY = y;
        }
        let x2 = genX(i + 1, x);
        let y2 = genY(i + 1, y);
        pathPoints.push(vec4(x, y, 0.0, 1.0));
        pathPoints.push(vec4(x2, y2, 0.0, 1.0));
        pathColors.push(colorSelection[7]);
        pathColors.push(colorSelection[8]);
    }

    //X axis
    pathPoints.push(vec4(-200, 0.0, 0.0, 1.0));
    pathPoints.push(vec4(200, 0.0, 0.0, 1.0));
    pathColors.push(colorSelection[12]);
    pathColors.push(colorSelection[12]);
    //Y axis
    pathPoints.push(vec4(0.0, -200, 0.0, 1.0));
    pathPoints.push(vec4(0.0, 200, 0.0, 1.0));
    pathColors.push(colorSelection[12]);
    pathColors.push(colorSelection[12]);
    console.log(pathPoints);

    // //Calculating distance
    // console.log("----Calculating Distance Between Points -----");
    // for (let i = 1; i < points.length; i++) {
    //     distance(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], true);
    // }
}

function genX(i, prevX) {
    oldX = JSON.parse(JSON.stringify({ val: prevX })).val;
    let res = (segDist * Math.cos((90 - (i * 60)) * Math.PI / 180)) + oldX
    return res;
}

function genY(i, prevY) {
    oldY = JSON.parse(JSON.stringify({ val: prevY })).val;
    return (segDist * Math.sin((90 - (i * 60)) * Math.PI / 180)) + oldY;
}

function angleSubdivisionGeneration(radius) {
    let count = 6;
    let segAngle = 180 / count;
    for (let i = 0; i < count * 2; i++) {
        let angle = segAngle * i;
        let x = Math.cos(angle * Math.PI / 180) * radius;
        let y = Math.sqrt(Math.pow(radius, 2) - Math.pow(x, 2));
        let angle2 = segAngle * (i + 1);
        let x2 = Math.cos(angle2 * Math.PI / 180) * radius;
        let y2 = Math.sqrt(Math.pow(radius, 2) - Math.pow(x2, 2));
        pathPoints.push(vec4(x, y, 0.0, 1.0));
        pathColors.push(colorSelection[3]);
        pathPoints.push(vec4(x2, y2, 0.0, 1.0));
        pathColors.push(colorSelection[5]);
        // points.push(vec4(0.0, 0.0, 0.0, 1.0));
        // colors.push(colorSelection[6]);
        // points.push(vec4(x, y, 0.0, 1.0));
        // colors.push(colorSelection[7]);
        // points.push(vec4(0.0,0.0,0.0, 1.0));
        // colors.push(colorSelection[6]);
        // points.push(vec4(x2, y2, 0.0, 1.0));
        // colors.push(colorSelection[7]);
    }
    for (let i = 0; i < count * 2; i++) {
        let angle = segAngle * i;
        let x = Math.cos(angle * Math.PI / 180) * radius;
        let y = -Math.sqrt(Math.pow(radius, 2) - Math.pow(x, 2));
        let angle2 = segAngle * (i + 1);
        let x2 = Math.cos(angle2 * Math.PI / 180) * radius;
        let y2 = -Math.sqrt(Math.pow(radius, 2) - Math.pow(x2, 2));
        pathPoints.push(vec4(x, y, 0.0, 1.0));
        pathColors.push(colorSelection[3]);
        pathPoints.push(vec4(x2, y2, 0.0, 1.0));
        pathColors.push(colorSelection[5]);
        // points.push(vec4(0.0, 0.0, 0.0, 1.0));
        // colors.push(colorSelection[6]);
        // points.push(vec4(x, y, 0.0, 1.0));
        // colors.push(colorSelection[7]);
        // points.push(vec4(0.0,0.0,0.0, 1.0));
        // colors.push(colorSelection[6]);
        // points.push(vec4(x2, y2, 0.0, 1.0));
        // colors.push(colorSelection[7]);
    }
    pathPoints.push(vec4(-200, 0.0, 0.0, 1.0));
    pathPoints.push(vec4(200, 0.0, 0.0, 1.0));
    pathPoints.push(vec4(0.0, 200, 0.0, 1.0));
    pathPoints.push(vec4(0.0, -200, 0.0, 1.0));
    pathColors.push(colorSelection[12]);
    pathColors.push(colorSelection[12]);
    pathColors.push(colorSelection[12]);
    pathColors.push(colorSelection[12]);

    // //Calculating distance
    // console.log("----Calculating Distance Between Points -----");
    // for (let i = 1; i < points.length; i++) {
    //     distance(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], true);
    // }
    console.log(pathPoints);

    // //TEST
    // let ys = points[4][1] - points[5][1];
    // let xs = points[4][0] - points[5][0];
    // let theta = Math.atan2(ys, xs) * 180 / Math.PI;
    // points.push(vec4(0.0,0.0,0.0,1.0));
    // points.push(vec4(xs, ys, 0.0,1.0));
    // colors.push(colorSelection[7]);
    // colors.push(colorSelection[7]);
    // console.log(theta);
}



function lineRotation(x0, y0, x1, y1, d) {
    let m = (y1 - y0) / (x1 - x0);
    let x2Plus = (x1 + (Math.pow(m, 2) * x1) + (d * Math.sqrt(Math.pow(m, 2) + 1))) / (1 + Math.pow(m, 2));
    let x2Minus = (x1 + (Math.pow(m, 2) * x1) - (d * Math.sqrt(Math.pow(m, 2) + 1))) / (1 + Math.pow(m, 2));
    let y2Plus = (m * (x2Plus - x1)) + y1;
    let y2Minus = (m * (x2Minus - x1) + y1);
    let m2Plus = (y2Plus - y1) / (x2Plus - x1);
    let m2Minus = (y2Minus - y1) / (x2Minus - x1);
    console.log(`Plus method: x: ${x2Plus} y: ${y2Plus} m: ${m2Plus}`);
    let dPlus = distance(x1, y1, x2Plus, y2Plus, true);
    console.log(`Minus method: x: ${x2Minus} y: ${y2Minus} m:${m2Minus}`);
    let dMinus = distance(x1, y1, x2Minus, y2Minus, true);
}


