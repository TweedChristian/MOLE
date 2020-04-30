let modelMat;
let program;
let gl;

//Paths are rendered as lines
//Obstacles are rendered as triangles
let pathPoints = [];
let pathColors = [];
let obstaclePoints = [];
let obstacleColors = [];


//Stores x,y,z,s
let obstacles = [];

let points = [];
let colors = [];


let colorSelection;

let segDist = 4;

let camPos;
let camFront;
let camUp;
let camYaw = 270;
let camPitch = 0;

//let segDist = 0.51825575467;

//If we want to log all operations
let testMode = false;

function main() {
    initalizeCameraControls();
    webGLInit();

    addAxis();
    // addObstacle(3, 1, -4, 1);
    // curveAroundObstacle(0);
    addObstacle(-6, 6, 6, 1);
    addObstacle(6, 6, -6, 1);
    // collisionDetection([0,0,0], [-3,3,3], [1,2,3], [-2,3,4],[-2,-3,5]);
    // collisionDetection([0,0,0], [-1,1,6], [1,2,3], [-2,3,4],[-2,-3,5]);
    pathPoints.push(vec4(-6, -6, -6, 1.0));
    pathPoints.push(vec4(6, 6, 6, 1.0));
    pathColors.push(colorSelection[2]);
    pathColors.push(colorSelection[2]);
    detectCollisionInObstacle(vec4(-6, -6, -6, 1.0), vec4(6, 6, 6, 1.0));
    render();
    draw();
}

function webGLInit() {
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

    camPos = vec3(0.0, 0.0, 10.0);
    camUp = vec3(0.0, 1.0, 0.0);
    camFront = vec3(0.0, 0.0, -1.0);

    updateViewMat();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
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
        vec4(0.78, 0.082, 0.522, 1.0),//viored
        vec4(0.45882, 0.54510, 0.99216, 1.0) //cornflower blue
    ];
}


function addAxis() {
    pathPoints.push(vec4(-200.0, 0.0, 0.0, 1.0));
    pathPoints.push(vec4(200.0, 0.0, 0.0, 1.0));
    pathColors.push(colorSelection[12]);
    pathColors.push(colorSelection[12]);
    pathPoints.push(vec4(0.0, -200.0, 0.0, 1.0));
    pathPoints.push(vec4(0.0, 200.0, 0.0, 1.0));
    pathColors.push(colorSelection[7]);
    pathColors.push(colorSelection[7]);
    pathPoints.push(vec4(0.0, 0.0, -200.0, 1.0));
    pathPoints.push(vec4(0.0, 0.0, 200.0, 1.0));
    pathColors.push(colorSelection[13]);
    pathColors.push(colorSelection[13]);
}

function detectCollisionInObstacle(a, b) {
    let obstacleCount = obstacles.length;

    let indexArr = [];
    for(let i=0; i < obstacleCount; i++){
        let newStart = i * 36;
        indexArr.push(...[newStart, newStart + 6, newStart + 12, newStart + 18, newStart + 24, newStart + 30]);
    }
    let triangles = [];
    indexArr.map((i) => {
        triangles.push([obstaclePoints[i], obstaclePoints[i + 1], obstaclePoints[i + 2]]);
    })
    triangles.map(triangle => {
        // console.log(triangle);
        collisionDetection(a,b,triangle[0], triangle[1], triangle[2]);    
    })
}

function initiatePathing(start, end, theta) {
    let distance = distance3d(start, end);
    let maxRadius = Math.sqrt(segDist * segDist / (1 - Math.cos(degToRad(theta))));
    if (distance > maxRadius) {
        //Break curve
    }
    else if (distance.toFixed(3) === radius.toFixed(3)) {
        //Just right
        constructCurve(theta, segDist, Math.ceil(180 / theta), start[0], start[1], start[2]);
    }
    else {
        //Shrink curve
        let radius = distance / 2;
        let newDist = Math.sqrt(2 * radius * radius * (1 - Math.cos(degToRad(theta))));
        constructCurve(theta, newDist, Math.ceil(180 / theta), start[0], start[1], start[2]);
    }
}

function constructCurve(theta, distance, iterations, xstart, ystart, zstart) {
    let curvePoints = [];
    let x1, y1;
    let x2, y2;
    x1 = xstart;
    y1 = ystart;
    x2 = xstart;
    y2 = ystart + distance;
    curvePoints.push(vec4(x1, y1, zstart, 1.0));
    curvePoints.push(vec4(x2, y2, zstart, 1.0));
    pathColors.push(colorSelection[9]);
    pathColors.push(colorSelection[10]);
    let tempX, tempY;
    for (let i = 0; i < iterations; i++) {
        [tempX, tempY] = findNextPointOnCurve(theta, distance, x1, y1, x2, y2);
        x1 = x2;
        y1 = y2;
        x2 = tempX;
        y2 = tempY;
        curvePoints.push(vec4(x1, y1, zstart, 1.0));
        curvePoints.push(vec4(x2, y2, zstart, 1.0));
        pathColors.push(colorSelection[9]);
        pathColors.push(colorSelection[10]);
    }
    let rotMat = rotateX(45);
    let scaleMat = scalem(0.5, 0.5, 0.5);
    let transMat = translate(-1, 0, 0);

    let newPoints = curvePoints;
    // newPoints = newPoints.map((point) => {
    //     return mult(scaleMat, point);
    // })
    newPoints = newPoints.map((point) => {
        return mult(rotMat, point);
    })
    // newPoints = newPoints.map((point) => {
    //     return mult(transMat, point);
    // })
    let testPoints = newPoints.slice(3, 9);
    projectToXY(testPoints[0], testPoints[2], testPoints[4]);
    pathPoints.push(...newPoints);
}

function findNextPointOnCurve(theta, distance, x0, y0, x1, y1) {
    if (x0 !== x1 || y0 !== y1) {
        //First find the next point on the line defined by P0 and P1
        let [x2, y2] = extendLine(x0, y0, x1, y1, distance);

        //Apply a rotation to P3 based on theta
        let thetaRads = degToRad(theta);
        //Need to rotate about P1
        let x2P = x2 - x1;
        let y2P = y2 - y1;

        let [x2r, y2r] = apply2dRotation(x2P, y2P, -thetaRads);

        let x2RT = x2r + x1;
        let y2RT = y2r + y1;

        angleBetweenTwoPoints(x2P, y2P, x2r, y2r);

        return [x2RT, y2RT];
    }
    else {
        throw console.error("Cannot make a line segment from those points, they are the same.");
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

function collisionDetection(a, b, p, q, r) {
    //P Q R is always clockwise
    //So use P - Q + R

    // console.log('POINTS');
    // console.log(a, b);
    // console.log('PLANE');
    // console.log(p, q, r)
    let line1 = [subtract(a.slice(0, 3), b.slice(0, 3)), cross(a.slice(0, 3), b.slice(0, 3))];
    let plane = findPlaneCoefficients(p, q, r);
    // console.log('collision')
    // console.log(plane);
    let intersection = subtract(cross(line1[1], plane.slice(0, 3)), scale(plane[3], line1[0]));
    let homogenousIntersection = dot(plane.slice(0, 3), line1[0]);
    // console.log(intersection);
    // console.log(homogenousIntersection);
    let finalIntersection = [intersection[0] / homogenousIntersection, intersection[1] / homogenousIntersection, intersection[2] / homogenousIntersection];
    // console.log("Final Intersection");
    // console.log(finalIntersection);

    let aZero = testAgainstZero(plane[0]);
    let bZero = testAgainstZero(plane[1]);
    let cZero = testAgainstZero(plane[2]);

    let s = [
        p[0] - q[0] + r[0],
        p[1] - q[1] + r[1],
        p[2] - q[2] + r[2]
    ];
    // console.log('s');
    // console.log(s);
    // console.log('min max tests');
    // Fetch max and min values
    let xMin = Math.min(p[0], q[0], r[0], s[0]);
    let xMax = Math.max(p[0], q[0], r[0], s[0]);
    let yMin = Math.min(p[1], q[1], r[1], s[1]);
    let yMax = Math.max(p[1], q[1], r[1], s[1]);
    let zMin = Math.min(p[2], q[2], r[2], s[2]);
    let zMax = Math.max(p[2], q[2], r[2], s[2]);
    let inRange;
    // console.log('Min Max Tests')
    // console.log(xMin, xMax, yMin, yMax, zMin, zMax);

    let xInRange = (xMin <= finalIntersection[0]) && (xMax >= finalIntersection[0]);
    let yInRange = yMin <= finalIntersection[1] && yMax >= finalIntersection[1];
    let zInRange = zMin <= finalIntersection[2] && zMax >= finalIntersection[2];
    // console.log('Range tests');
    // console.log(xInRange,yInRange,zInRange);
    // console.log('Not tests');
    // console.log(aZero, bZero, cZero);
    //CASE 1 x,y,z
    if (!aZero && !bZero && !cZero) {
        console.log('1 - x,y,z')
        inRange = xInRange && yInRange;
    }
    //CASE 2 y,z
    else if (aZero && !bZero && !cZero) {
        console.log('2 - y,z')
        inRange = xInRange && yInRange;
    }
    //CASE 3 x,z
    else if (!aZero && bZero && !cZero) {
        console.log('3 - x,z');
        inRange = xInRange && yInRange;
    }
    //CASE 4 x,y
    else if (!aZero && !bZero && cZero) {
        console.log('4 - x,y');
        inRange = xInRange && yInRange && zInRange;
    }
    //CASE 5 x
    else if (!aZero && bZero && cZero) {
        console.log('5 - x');
        inRange = yInRange && zInRange;
    }
    //CASE 6 y
    else if (aZero && !bZero && cZero) {
        console.log('6 - y');
        inRange = xInRange && zInRange;
    }
    //CASE 7 z
    else if (aZero && bZero && !cZero) {
        console.log('7 - z');
        inRange = xInRange && yInRange;
    }
    console.log(inRange);
}

function testAgainstZero(val) {
    return (val > -0.00001 && val < 0.00001);
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
    if (x1.toFixed(3) === x0.toFixed(3)) {

        if (y1 > y0) {
            //Moving +y
            return [x1, y1 + d];
        }
        else {
            //Moving -y
            return [x1, y1 - d];
        }
    }

    //No slope
    if (y1.toFixed(3) === y0.toFixed(3)) {
        if (x1 > x0) {
            //Moving +x
            return [x1 + d, y1];
        }
        else {
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

function distance3d(p, q) {
    return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2) + Math.pow(p[2] - q[2], 2))
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
 * @param {[x,y,z]} q is point 2 of the plane
 * @param {[x,y,z]} r is point 3 of the plane
 * @throws err if p,q, or r are less than 3 values.
 * @returns the array [a,b,c,d]
 */
function findPlaneCoefficients(p, q, r) {

    if (p.length < 3 || q.length < 3 || r.length < 3) {
        throw err;
    }

    //S and T are the two vectors from which we get a cross product
    let s = [(p[0] - q[0]), (p[1] - q[1]), (p[2] - q[2])];
    let t = [(r[0] - q[0]), (r[1] - q[1]), (r[2] - q[2])];
    let planeNormal = cross(s, t);
    let d = -((planeNormal[0] * p[0]) + (planeNormal[1] * p[1]) + (planeNormal[2] * p[2]));
    return [...planeNormal, d];
}

/**Takes three points and then projects them to the XY plane to find the angles between them
 * @param {[x,y,z]} p is the first point in the triangle
 * @param {[x,y,z]} q is the second point in the triangle
 * @param {[x,y,z]} r is the third point in the triangle
 */
function projectToXY(p, q, r) {
    //USE GRAM-SCHMIDT PROCESS
    let X = [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
    let Y = [r[0] - q[0], r[1] - q[1], r[2] - q[2]];
    X = normalize(X);
    Y = normalize(Y);
    let Z = cross(X, Y);
    Y = cross(Z, X)
    let lookie = lookAt([q[0], q[1], q[2]], add([q[0], q[1], q[2]], Z), Y);
    let vec1Res = mult(lookie, p);
    let vec2Res = mult(lookie, q);
    let vec3Res = mult(lookie, r);

    // console.log(distance3d(vec1Res, vec2Res));
    // console.log(distance3d(p,q));
    // console.log(distance3d(vec1Res, vec3Res));
    // console.log(distance3d(p,r));
    // console.log(distance3d(vec2Res, vec3Res));
    // console.log(distance3d(r,q));

    return [vec1Res, vec2Res, vec3Res];
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
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelMatrix'), false, flatten(translate(0, 0, 0)));
    //draw path
    gl.drawArrays(gl.LINES, 0, pathPoints.length);
    //draw obstacles
    if (obstaclePoints.length > 0) {
        gl.drawArrays(gl.TRIANGLES, pathPoints.length, obstaclePoints.length);
    }
}

function render() {

    points = [...pathPoints, ...obstaclePoints];
    colors = [...pathColors, ...obstacleColors];

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

//For now render obstacles as boxes
function addObstacle(x, y, z, s) {
    obstacles.push([x, y, z, s]);
    let r = s / 2;
    let minY = y - r;
    let maxY = y + r;
    let minX = x - r;
    let maxX = x + r;
    let minZ = z - r;
    let maxZ = z + r;

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

    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[6]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[6]);


    //Bottom Face
    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(bottomFrontRight);
    obstaclePoints.push(bottomBackRight);
    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(bottomBackRight);
    obstaclePoints.push(bottomBackLeft);

    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[6]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[6]);

    //Front Face

    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(topFrontLeft);
    obstaclePoints.push(topFrontRight);
    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(topFrontRight);
    obstaclePoints.push(bottomFrontRight);

    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[6]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[6]);

    //Back Face

    obstaclePoints.push(bottomBackLeft);
    obstaclePoints.push(topBackLeft);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(bottomBackLeft);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(bottomBackRight);

    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[6]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[6]);

    //Right Face

    obstaclePoints.push(bottomFrontRight);
    obstaclePoints.push(topFrontRight);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(bottomFrontRight);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(bottomBackRight);

    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[6]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[6]);

    //Left Face

    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(bottomBackLeft);
    obstaclePoints.push(topBackLeft);
    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(topBackLeft);
    obstaclePoints.push(topFrontLeft);

    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[6]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[5]);
    obstacleColors.push(colorSelection[8]);
    obstacleColors.push(colorSelection[6]);
}


function curveAroundObstacle(index) {
    if (obstacles.length === index + 1) {
        let obstacle = obstacles[index];
        let arcR = obstacle[3] * Math.sqrt(2) / 2;
        let xStart = obstacle[0] - arcR;
        let dynamicDistance = Math.sqrt(2 * arcR * arcR * (1 - Math.cos(degToRad(20))));
        console.log('=====dynamic distance=====');
        console.log(dynamicDistance);
        constructCurve(20, dynamicDistance, 9, xStart, obstacle[1], obstacle[2]);
    }
    else {
        console.error("That obstacle doesn't exist");
    }
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

    event.preventDefault(); //Disable arrow key scrolling

    if (event.ctrlKey && event.key === ' ') {
        //DOWN
        camPos = [
            camPos[0] - (camUp[0] * cameraSpeed),
            camPos[1] - (camUp[1] * cameraSpeed),
            camPos[2] - (camUp[2] * cameraSpeed)
        ];
    }
    else if (event.key === ' ') {
        //UP
        camPos = [
            camPos[0] + (camUp[0] * cameraSpeed),
            camPos[1] + (camUp[1] * cameraSpeed),
            camPos[2] + (camUp[2] * cameraSpeed)
        ];
    }
    else if (event.key === 'a') {
        //Strafe Left
        camPos = [
            camPos[0] - (camRight[0] * cameraSpeed),
            camPos[1] - (camRight[1] * cameraSpeed),
            camPos[2] - (camRight[2] * cameraSpeed)
        ];
    }
    else if (event.key === 'd') {
        //Strafe Right
        camPos = [
            camPos[0] + (camRight[0] * cameraSpeed),
            camPos[1] + (camRight[1] * cameraSpeed),
            camPos[2] + (camRight[2] * cameraSpeed)
        ];
    }
    else if (event.key === 'w') {
        //Forwards
        camPos = [
            camPos[0] + (camFront[0] * cameraSpeed),
            camPos[1] + (camFront[1] * cameraSpeed),
            camPos[2] + (camFront[2] * cameraSpeed)
        ];
    }
    else if (event.key === 's') {
        //Backwards
        camPos = [
            camPos[0] - (camFront[0] * cameraSpeed),
            camPos[1] - (camFront[1] * cameraSpeed),
            camPos[2] - (camFront[2] * cameraSpeed)
        ];

    }
    else if (event.keyCode === 38) {
        //Pitch Up
        camPitch += cameraTurnSpeed;
    }
    else if (event.keyCode === 40) {
        //Pitch Down
        camPitch -= cameraTurnSpeed;
    }
    else if (event.keyCode === 37) {
        //Yaw Left
        camYaw -= cameraTurnSpeed;
    }
    else if (event.keyCode === 39) {
        //Yaw Right
        camYaw += cameraTurnSpeed;
    }
    else {
    }

    if (camYaw > 360) {
        camYaw = 0;
    }
    if (camYaw < 0) {
        camYaw = 360;
    }
    if (camPitch > 89) {
        camPitch = 89;
    }
    if (camPitch < -89) {
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
function updateViewMat() {
    let viewMat = lookAt(camPos, add(camFront, camPos), camUp);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'viewMatrix'), false, flatten(viewMat));
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
    if (angleBetweenTwoPoints(1, 1, 0.5, 1, true) !== test4) {
        console.log('PASSED');
    }
    else {
        console.log('FAILED');
    }
}