let modelMat;
let program;
let gl;

let points = [];
let colors = [];

let obstaclePoints = [];

let colorSelection;

let segDist = 4;

let camPos;
let camFront;
let camUp;
let camYaw = 270;
let camPitch = 0;

//let segDist = 0.51825575467;

//If we want to log all operations
let testMode = true;

function main() {
    initalizeCameraControls();
    let canvas = document.getElementById("Canvas");
    gl = WebGLUtils.setupWebGL(canvas, undefined);
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);
    if (!gl) {
        console.log("gl didn't work");
    }

    let fovy = 30;
    let projMat = perspective(fovy, 1, .1, 500);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false, flatten(projMat));

    let at = vec3(0.0, 0.0, 0.0);
    let eyePos = vec3(0.0, 0.0, 50.0);

    camPos = vec3(0.0,0.0,50.0);
    camUp = vec3(0.0,1.0,0.0);
    camFront = vec3(0.0,0.0,-1.0);

    updateViewMat();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    colorSelection = [
        vec4(0.941, 0.902, 0.549, 1.0), //khaki
        vec4(0.627, 0.322, 0.176, 1.0), //sienna
        vec4(0.502, 0.502, 0.0, 1.0), //olive
        vec4(0.502, 0.0, 0.502, 1.0), //purple
        vec4(0.753, 0.753, 0.753, 1.0), //silver
        vec4(0.502, 0.0, 0.0, 1.0), //maroon
        vec4(0.0, 0.502, 0.502, 1.0), //teal
        vec4(0.0, 0.502, 0.0, 1.0), //green
        vec4(0.941, 0.502, 0.502, 1.0), //coral
        vec4(0.737, 0.561, 0.561, 1.0), //rosy
        vec4(1.0, 1.0, 1.0, 1.0), //white
        vec4(0.439, 0.502, 0.565, 1.0), //slate
        vec4(0.78, 0.082, 0.522, 1.0)//viored
    ];
    // cube();
    // parabola(5, 20);
    // angleSubdivisionGeneration(idealRadius(6, 4));
    // outsideAngleGeneration();
    // render();
    // draw();
    // animate();

   // findNextPointOnCurve(3.5, 4, 0.0, 0.0, 0.0, 4.0);
   addAxis();
//    findNextPointOnCurve(20,4,0.0,0.0,0.0,4.0);
//    console.log(`${x} and ${y}`);
//    angleBetweenTwoPoints(0.0, 4.0, 4.0, 0.0);
//    angleBetweenTwoPoints(4.0, 8.0, 8.0, 4.0);
   constructCurve(20, 4, 9, -12.0, -8.0);
   render();
   draw();
}


function addAxis(){
    points.push(vec4(-200.0, 0.0, 0.0, 1.0));
    points.push(vec4(200.0, 0.0, 0.0, 1.0));
    colors.push(colorSelection[12]);
    colors.push(colorSelection[12]);
    points.push(vec4(0.0,-200.0,0.0,1.0));
    points.push(vec4(0.0,200.0,0.0,1.0));
    colors.push(colorSelection[12]);
    colors.push(colorSelection[12]);
}
function constructCurve(theta, distance, iterations, xstart, ystart) {
   // MAYBE USE LAW OF SINES TO FIND ANGLE BETWEEN POINTS
    // let x1, y1, x2, y2;
    // [x2, y2] = findNextPointOnCurve(theta, distance, xstart, ystart, xstart, ystart + distance);
    // x1 = xstart;
    // y1 = ystart + distance;
    // findNextPointOnCurve(theta, distance, x1, y1, x2, y2);
    let x1, y1;
    let x2, y2;
    x1 = xstart;
    y1 = ystart;
    x2 = xstart;
    y2 = ystart + distance;
    points.push(vec4(x1, y1, 0.0, 1.0));
    points.push(vec4(x2, y2, 0.0, 1.0));
    colors.push(colorSelection[9]);
    colors.push(colorSelection[10]);
    let tempX, tempY;
    for(let i=0; i<iterations;i++){
       [tempX,tempY] = findNextPointOnCurve(theta, distance, x1, y1, x2, y2);
       x1 = x2;
       y1 = y2;
       x2 = tempX;
       y2 = tempY;
       points.push(vec4(x1, y1, 0.0, 1.0));
       points.push(vec4(x2, y2, 0.0, 1.0));
       colors.push(colorSelection[9]);
       colors.push(colorSelection[10]);
    }
    console.log(points);
}

function findNextPointOnCurve(theta, distance, x0, y0, x1, y1){
    if(x0 !== x1 || y0 !== y1){
        //First find the next point on the line defined by P0 and P1
        let [x2,y2] = extendLine(x0,y0,x1,y1,distance);

        console.log("Next point on line");
        console.log(`${x2} and ${y2}`);

        //Apply a rotation to P3 based on theta
        let thetaRads = degToRad(theta);
        //Need to rotate about P1
        let x2P = x2 - x1;
        let y2P = y2 - y1;
        console.log("Translated");
        console.log(`${x2P} and ${y2P}`);
        let [x2r, y2r] = apply2dRotation(x2P, y2P, -thetaRads);
        console.log('Rotated');
        console.log(`${x2r} and ${y2r}`);
        let x2RT = x2r + x1;
        let y2RT = y2r + y1;
        console.log("Translated Back");
        console.log(`${x2RT} and ${y2RT}`);
        angleBetweenTwoPoints(x2P, y2P, x2r, y2r);
        return [x2RT, y2RT];
    }
   else{
       throw console.error("Cannot make a line segment from those points, they are the same.");
   } 

}

/**Not using traditional unit tests, but we call this function to do some general tests
 * 
 */
function testAngleBetweenTwoPoints() {
    console.log("===TESTING===");

    //90 degree rotation
    let test1 = 90;
    if (angleBetweenTwoPoints(1, 1, -1, 1, true) === test1) {
        console.log('PASSED');
    }
    else {
        console.log('FAILED');
    }

    //270 degree rotation
    let test2 = -90;
    if (angleBetweenTwoPoints(1, 1, 1, -1, true) === test2) {
        console.log('PASSED');
    }
    else {
        console.log('FAILED');
    }

    //45 degree rotation
    let test3 = 45;
    console.log("Test 3");
    if (angleBetweenTwoPoints(1, 1, 0, Math.sqrt(2), true) === test3) {
        console.log('PASSED');
    }
    else {
        console.log('FAILED');
    }

    let test4 = 100;
    console.log('Test 4');
    if(angleBetweenTwoPoints(1,1,0.5,1,true) !== test4){
        console.log('PASSED');
    }
    else{
        console.log('FAILED');
    }
}

/**Curves can be generated with 12 cases. This stores a curve's important information
 * @param Direction is the axis the curve is moving along([x,y,z])
 * @param Translation is the movement from the origin to a point in space ([x,y,z])
 * @param Rotation is the degrees the curve is rotated around that axis. 0 is the negative of the axis (-90, 0, 90, 180)
 * @param Points are the line segments composing the curve.
 * A point's orientation can be determined by 
 */
function curve(direction, translation, rotation, points) {
    this.direction = direction;
    this.translation = translation;
    this.rotation = rotation;
    this.points = points;
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

/**Calculates a third point a distance (d) down the line determined by the first two points
 * Note: Since the determination of the third x coordinate is done with the quadratic equation, 
 * we have +/- d to find the new x coordinate. If the line is oriented towards Q1 or Q4, then we
 * use +d, otherwise -d
 * @param {float} x0 
 * @param {float} y0 
 * @param {float} x1 
 * @param {float} y1 
 * @param {float} d 
 * @returns [x2,y2]
 */
function extendLine(x0, y0, x1, y1, d) {

    //These shortcut operations in case the slope is 0 or undefined
    //Vertical line, slope is infinity
    if(x1.toFixed(3) === x0.toFixed(3)){

        if(y1 > y0){
            //Moving +y
            return [x1, y1 + d];
        }
        else{
            //Moving -y
            return [x1, y1 - d];
        }
    }

    //No slope
    if(y1.toFixed(3) === y0.toFixed(3)){
        if(x1 > x0){
            //Moving +x
            return [x1 + d, y1];
        }
        else{
            //Moving -x
            return [x1 - d, y1];
        }
    }

    let x2, y2, m;

    let isQ1orQ4 = false;
    if (x1 - x0 > 0) {
        isQ1orQ4 = true;
    }

    m = (y1 - y0) / (x1 - x0);

    if (isQ1orQ4) {
        x2 = (x1 + (Math.pow(m, 2) * x1) + (d * Math.sqrt(Math.pow(m, 2) + 1))) / (1 + Math.pow(m, 2));
        y2 = (m * (x2 - x1) + y1);

        if (testMode) {
            console.log(
                `The new coordinate in the direction of Quadrant 1 or 3 are x: ${x2}, y: ${y2}.\r
            The previous points are x0: ${x0}, y0: ${y0}, x1: ${x1}, y1: ${y1}, and the distance is ${d}.`
            );
        }

        return [x2, y2];
    }

    x2 = (x1 + (Math.pow(m, 2) * x1) - (d * Math.sqrt(Math.pow(m, 2) + 1))) / (1 + Math.pow(m, 2))
    y2 = (m * (x2 - x1) + y1);

    if (testMode) {
        console.log(
            `The new coordinate in the direction of Quadrant 1 or 3 are x: ${x2}, y: ${y2}.\r
        The previous points are x0: ${x0}, y0: ${y0}, x1: ${x1}, y1: ${y1}, and the distance is ${d}.`
        );
    }
    return [x2, y2];
}

/**Returns a radius based on an ideal formula of r = sqrt( d ^ 2 / 2 * (1 - cos(ang)))
 * 
 * @param {int} count The amount of times to divide the semicircle by
 * @param {int} segDist The distance of the extension
 * @returns the expected radius
 */
function idealRadius(count, segDist) {
    let ang = 180 / count;
    let radius = Math.sqrt(Math.pow(segDist, 2) /
        2 / (1 - (Math.cos(ang * Math.PI / 180))));
    return radius
}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var indices = [a, b, c, a, c, d];
    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        colors.push(colorSelection[a]);
    }
}


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
            points.push(vec4(startX, startY, 0.0, 1.0));
            colors.push(colorSelection[2]);
            x = genX(i, startX);
            y = genY(i, startY);
            points.push(vec4(x, y, 0.0, 1.0));
            colors.push(colorSelection[3]);
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
        points.push(vec4(x, y, 0.0, 1.0));
        points.push(vec4(x2, y2, 0.0, 1.0));
        colors.push(colorSelection[7]);
        colors.push(colorSelection[8]);
    }

    //X axis
    points.push(vec4(-200, 0.0, 0.0, 1.0));
    points.push(vec4(200, 0.0, 0.0, 1.0));
    colors.push(colorSelection[12]);
    colors.push(colorSelection[12]);
    //Y axis
    points.push(vec4(0.0, -200, 0.0, 1.0));
    points.push(vec4(0.0, 200, 0.0, 1.0));
    colors.push(colorSelection[12]);
    colors.push(colorSelection[12]);
    console.log(points);

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
        points.push(vec4(x, y, 0.0, 1.0));
        colors.push(colorSelection[3]);
        points.push(vec4(x2, y2, 0.0, 1.0));
        colors.push(colorSelection[5]);
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
        points.push(vec4(x, y, 0.0, 1.0));
        colors.push(colorSelection[3]);
        points.push(vec4(x2, y2, 0.0, 1.0));
        colors.push(colorSelection[5]);
        // points.push(vec4(0.0, 0.0, 0.0, 1.0));
        // colors.push(colorSelection[6]);
        // points.push(vec4(x, y, 0.0, 1.0));
        // colors.push(colorSelection[7]);
        // points.push(vec4(0.0,0.0,0.0, 1.0));
        // colors.push(colorSelection[6]);
        // points.push(vec4(x2, y2, 0.0, 1.0));
        // colors.push(colorSelection[7]);
    }
    points.push(vec4(-200, 0.0, 0.0, 1.0));
    points.push(vec4(200, 0.0, 0.0, 1.0));
    points.push(vec4(0.0, 200, 0.0, 1.0));
    points.push(vec4(0.0, -200, 0.0, 1.0));
    colors.push(colorSelection[12]);
    colors.push(colorSelection[12]);
    colors.push(colorSelection[12]);
    colors.push(colorSelection[12]);

    // //Calculating distance
    // console.log("----Calculating Distance Between Points -----");
    // for (let i = 1; i < points.length; i++) {
    //     distance(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], true);
    // }
    console.log(points);

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


/**A helper function to calculate distances between points. It deep copies the points to avoid trashing an array
 * @param {*} xi
 * @param {*} yi 
 * @param {*} xf 
 * @param {*} yf
 * @returns distance
 */
function distance(xi, yi, xf, yf) {
    xfDeep = JSON.parse(JSON.stringify({ val: xf })).val;
    yfDeep = JSON.parse(JSON.stringify({ val: yf })).val;
    xiDeep = JSON.parse(JSON.stringify({ val: xi })).val;
    yiDeep = JSON.parse(JSON.stringify({ val: yi })).val;
    let distance = Math.sqrt(Math.pow(xfDeep - xiDeep, 2) + Math.pow(yfDeep - yiDeep, 2));
    if (testMode) {
        console.log(`Distance between point (${xf}, ${yf}) and ( ${xi}, ${yi}) is ${distance}`);
    }
    return distance;
}

/**Determines the angle between two points based on the 2d rotation matrix.
 * Note: If the denominator is 0, then we either have 90 or 270 degrees, 90 degrees if the numerator 
 * is positive
 * @param {*} x0 
 * @param {*} y0 
 * @param {*} x1 
 * @param {*} y1 
 * @returns Theta in degrees
 */
function angleBetweenTwoPoints(x0, y0, x1, y1) {
    let numerator = (y1 * x0) - (x1 * y0);
    let denominator = (x0 * x1) + (y0 * y1);
    let result;

    if (denominator === 0) {
        console.log("In check");
        //Either 90, 270, or bug
        if (numerator >= 0) {
            result = Math.PI / 2;
        }
        else {
            result = -Math.PI / 2;
        }
    }
    else {
        result = Math.atan(numerator / denominator);
    }

    //Testing to see if this was a valid rotation
    let testPoints = apply2dRotation(x0, y0, result);

    if (testMode) {
        console.log(`Test points: (${testPoints[0]}, ${testPoints[1]}), received (${x1}, ${y1})`);
    }

    // if (x1.toFixed(3) !== testPoints[0].toFixed(3) && y1.toFixed(3) !== testPoints[1].toFixed(3)) {
    //     throw console.error(`This was not a valid rotation. Expected (${testPoints[0]}, ${testPoints[1]}), but received (${x1}, ${y1})`);
    // }

    if (testMode) {
        console.log(`Rotation between A: (${x0}, ${y0}) to B: (${x1}, ${y1}) is of ${radToDeg(result)} degrees`);
    }

    return radToDeg(result);
}

/**Takes a rotation matrix and multiplies a vector by it. This is for 2d rotations only.
 * @param {*} x 
 * @param {*} y 
 * @param {*} theta is in radians
 * @returns [x,y] as the new coordinates
 */
function apply2dRotation(x, y, theta) {
    let rotatedX = (x * Math.cos(theta)) - (y * Math.sin(theta));
    let rotatedY = (x * Math.sin(theta)) + (y * Math.cos(theta));
    return [rotatedX, rotatedY];
}

/**Finds the four coefficients for the the equation ax + by + cz + d = 0
 * @param {[x,y,z]} p is point 1 of the plane
 * @param {[x.y,z]} q is point 2 of the plane
 * @param {[x,y,z]} r is point 3 of the plane
 * @throws err if p,q, or r are less than 3 values.
 * @returns the array [a,b,c,d]
 */
function findPlaneCoefficients(p, q, r) {

    if (p.length > 3 || q.length > 3 || r.length > 3) {
        throw err;
    }

    //S and T are the two vectors from which we get a cross product
    let s = [(p[0] - q[0]), (p[1] - q[1]), (p[2] - q[2])];
    let t = [(r[0] - q[0]), (r[1] - q[1]), (r[2] - q[2])];

    let a = ((s[1] * t[1]) - (s[2] * t[2]));
    let b = ((s[2] * t[0]) - (s[0] * t[2]));
    let c = ((s[0] * t[1]) - (s[1] * t[0]));

    let d = -((a * p[0]) + (b * p[1]) + (c * p[2]));

    return [a, b, c, d];
}

/**Takes a plane: ax + by + cz + d = 0 and finds 
 */
function projectToXY(p, q, r) {
    console.log(`P: ${p}`);
    console.log(`Q: ${q}`);
    console.log(`R: ${r}`);

    let plane = findPlaneCoefficients(p, q, r);
    console.log(`${plane[0]}x + ${plane[1]}y + ${plane[2]}z + ${plane[3]} = 0`);

    let hyp = Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2);
    let sqhyp = Math.sqrt(hyp);

    let cosTheta = c / sqhyp;
    let sinTheta = Math.sqrt((Math.pow(a, 2) + Math.pow(b, 2)) / hyp);
    let u1 = b / sqhyp;
    let u2 = -a / sqhyp;

    let R = [
        [(cosTheta + (Math.pow(u1, 2) * (1 - cosTheta))), (u1 * u2 * (1 - cosTheta)), (u2 * sinTheta)],
        [],
        []
    ];
}

/**Takes a degree and converts it to radians
 * @param deg 
 * @returns radians
 */
function degToRad(deg) {
    return deg * Math.PI / 180;
}

/**Takes radians and turns it into degrees
 * @param {*} rad 
 */
function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

function draw() {
    let mat = translate(-45.0, -45.0, -120.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelMatrix'), false, flatten(translate(0, 0, 0)));
    gl.drawArrays(gl.LINES, 0, points.length);
}

function render() {
    var cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);

    var vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

let id;
let theta = 0;

function animate() {
    theta += 0.7;
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelMatrix'), false, flatten(rotateY(theta)));
    // gl.drawArrays(gl.TRIANGLES, 0, points.length);
    gl.drawArrays(gl.LINES, 0, points.length);
    id = requestAnimationFrame(animate);
}

//For now render obstacles as boxes
function addObstacle() {
    let x = document.getElementById("x").value();
    let y = document.getElementById("y").value();
    let z = document.getElementById("z").value();
    let l = document.getElementById("l").value();
    let w = document.getElementById("w").value();
    let h = document.getElementById("h").value();

    let minY = y - (h / 2);
    let maxY = y + (h / 2);
    let minX = x - (w / 2);
    let maxX = x + (w / 2);
    let minZ = z - (l / 2);
    let maxZ = z + (l / 2);

    let topBackLeft = vec4(minX, maxY, minZ, 1.0);
    let topBackRight = vec4(maxX, maxY, minZ, 1.0);
    let topFrontLeft = vec4(minX, maxY, maxZ, 1.0);
    let topFrontRight = vec4(maxX, maxY, maxZ, 1.0);
    let bottomBackLeft = vec4(minX, minY, minZ, 1.0);
    let bottomBackRight = vec4(maxX, minY, minZ, 1.0);
    let bottomFrontLeft = vec4(minX, minY, maxZ, 1.0);
    let bottomFrontRight = vec4(maxX, minY, maxZ, 1.0);

    //Make our triangles

    //Top Face
    obstaclePoints.push(topFrontLeft);
    obstaclePoints.push(topFrontRight);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(topFrontLeft);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(topBackLeft);

    //Bottom Face

    //Front Face

    //Back Face

    //Right Face

    //Left Face
}


/** CAMERA FUNCTIONS **/


/**
 * Simply adds a listener for key inputs to the window
 */
function initalizeCameraControls() {
    document.addEventListener('keydown', (event) => {
        moveCamera(event);
    });
}

/**Parses through all the key events to properly 
 * transform the camera
 * @param event is the keydown event
 */
function moveCamera(event) {
    let cameraSpeed = 0.5;
    let cameraTurnSpeed = 1;
    let camRight = normalize(cross(camFront, camUp));
    if(event.ctrlKey && event.key === ' '){
        //DOWN
        console.log("DOWN ALT THING")
        camPos = [
            camPos[0] - (camUp[0] * cameraSpeed),
            camPos[1] - (camUp[1] * cameraSpeed),
            camPos[2] - (camUp[2] * cameraSpeed)
        ];
    }
    else if(event.key === ' ') {
        //UP
        console.log('Space Key');
        camPos = [
            camPos[0] + (camUp[0] * cameraSpeed),
            camPos[1] + (camUp[1] * cameraSpeed),
            camPos[2] + (camUp[2] * cameraSpeed)
        ];
    }
    else if(event.key === 'a') {
        //Strafe Left
        camPos = [
            camPos[0] - (camRight[0] * cameraSpeed),
            camPos[1] - (camRight[1] * cameraSpeed),
            camPos[2] - (camRight[2] * cameraSpeed)
        ];
    }
    else if(event.key === 'd') {
        //Strafe Right
        console.log('D Key');
        camPos = [
            camPos[0] + (camRight[0] * cameraSpeed),
            camPos[1] + (camRight[1] * cameraSpeed),
            camPos[2] + (camRight[2] * cameraSpeed)
        ];
    }
    else if(event.key === 'w') {
        //Forwards
        console.log('W Key');
        camPos = [
            camPos[0] + (camFront[0] * cameraSpeed), 
            camPos[1] + (camFront[1] * cameraSpeed), 
            camPos[2] + (camFront[2] * cameraSpeed)
        ];
    }
    else if(event.key === 's') {
        //Backwards
        console.log('S Key');
        camPos = [
            camPos[0] - (camFront[0] * cameraSpeed), 
            camPos[1] - (camFront[1] * cameraSpeed), 
            camPos[2] - (camFront[2] * cameraSpeed)
        ];

    }
    else if(event.keyCode === 38) {
        //Pitch Up
        console.log('Up Key');
        camPitch += cameraTurnSpeed;
    }
    else if(event.keyCode === 40) {
        //Pitch Down
        console.log('Down Key');
        camPitch -= cameraTurnSpeed;
    }
    else if(event.keyCode === 37) {
        //Yaw Left
        console.log('Left Key');
        camYaw -= cameraTurnSpeed;
    }
    else if(event.keyCode === 39) {
        //Yaw Right
        console.log('Right Key');
        camYaw += cameraTurnSpeed;
    }
    else {
    }

    if(camYaw > 360){
        camYaw = 0;
    }
    if(camYaw < 0){
        camYaw = 360;
    }
    if(camPitch > 89){
        camPitch = 89;
    }
    if(camPitch < -89){
        camPitch = -89;
    }

    camFront[0] = Math.cos(degToRad(camYaw)) * (Math.cos(degToRad(camPitch)));
    camFront[1] = Math.sin(degToRad(camPitch));
    camFront[2] = Math.sin(degToRad(camYaw)) * (Math.cos(degToRad(camPitch)));
    updateViewMat();
    draw();
}


/**
 * Takes the global camera position, camera direction, and camera up vector
 * and generates a new view matrix, and then plugs it into the graphics pipeline
 */
function updateViewMat(){
    console.log(camFront)
    console.log(camPos);
    let viewMat = lookAt(camPos, add(camFront, camPos), camUp);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'viewMatrix'), false, flatten(viewMat));
}