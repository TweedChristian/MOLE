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
let curves = [];

let points = [];
let colors = [];

const colorSelection = {
    KHAKI: [0.941, 0.902, 0.549, 1.0],
    SIENNA: [0.627, 0.322, 0.176, 1.0],
    OLIVE: [0.502, 0.502, 0.0, 1.0],
    PURPLE: [0.502, 0.0, 0.502, 1.0],
    SILVER: [0.753, 0.753, 0.753, 1.0],
    MAROON: [0.502, 0.0, 0.0, 1.0],
    TEAL: [0.0, 0.502, 0.502, 1.0],
    GREEN: [0.0, 0.502, 0.0, 1.0],
    CORAL: [0.941, 0.502, 0.502, 1.0],
    ROSY: [0.737, 0.561, 0.561, 1.0],
    WHITE: [1.0, 1.0, 1.0, 1.0],
    SLATE: [0.439, 0.502, 0.565, 1.0],
    VIORED: [0.78, 0.082, 0.522, 1.0],
    CORNFLOWER_BLUE: [0.45882, 0.54510, 0.99216, 1.0],
    MEDIUM_PURPLE: [0.53725, 0.50196, 0.96078, 1.0],
    OBJECT_TRANSLUSCENT: [0.5, 0.23, 0.01, 0.05],
    LINE_TRANSLUSCENT: [0.45882, 0.54510, 0.99216, 0.1]
}

let segDist = 4;

let camPos;
let camFront;
let camUp;
let camYaw = 112;
let camPitch = -10;

const minExtensionDistance = 2;
const demoTheta = 10;
//let segDist = 0.51825575467;

//If we want to log all operations
let testMode = false;

function main() {
    initalizeCameraControls();
    webGLInit();

    addAxis(true, false, true);

    demo();
    render();
    draw();
}

function demo(){
    addObstacle(0, 4, 0, 4);
    curves.push(constructCurve(10, 3, 18, 17.2, 23.2, 0));
    drawCurve(0, colorSelection.LINE_TRANSLUSCENT);

    let dist = idealDistance(7.218, 10);


    curve2 = curveFromYawPitch(dist, 10, 0, [7.218, 6, 0], [0, 0, 1], 18);
    //Odd case: No delta pitch and [0,1,0] is direction
    curves.push(curve2);
    //drawCurve(1, colorSelection.PURPLE);

    curve3 = curveFromYawPitch(dist, -10, 0, [7.218, 6, 0], [0, 0, -1], 18);
    curves.push(curve3);
    // drawCurve(2, colorSelection.SIENNA);

    curve4 = curveFromYawPitch(dist, 0, -10, [7.218, 6, 0], [0, -1, 0], 18);
    curves.push(curve4);
    //drawCurve(3, colorSelection.MAROON);

    curve5 = curveFromYawPitch(dist, 0, 10, [7.218, 6, 0], [0, 1, 0], 18);
    curves.push(curve5);
    // drawCurve(4, colorSelection.CORAL);

    curve6 = curveFromYawPitch(3, 0, 10, [5, 5, 5], [0, 1, 0], 18);
    curves.push(rotateEntireCurve(0, curve6));
   // drawCurve(5, colorSelection.KHAKI);
    curves.push(curve6);
   // drawCurve(6, colorSelection.MEDIUM_PURPLE);
    curveCorrect(0);
}

function splineEntireCurve(curve) {
    let splinePoints = []
    for (let i = 0; i < curve.length - 3; i++) {
        splinePoints.push(...catMullRomSpline(curve[i], curve[i + 1], curve[i + 2], curve[i + 3], 0.5));
    }
    return splinePoints;
}

function curveCorrect(curveIndex) {
    let curve = curves[curveIndex];
    let successfulCurve;
    let obstacleCollisionResults = checkCurve(curve);
    if (obstacleCollisionResults[0].length === 0) {
        //No collision do nothing
        return;
    }
    let obstacleIndex = obstacleCollisionResults[1];

    let faultPoints = obstacleCollisionResults[0];
    radius = 0.5 * distance3d(curve[faultPoints[0]], curve[faultPoints[1] + 1]);

    if (radius < obstacles[obstacleIndex][3]) {
        //Radius is smaller than the object don't do anything or too small to matter
    }
    else {
        let dist;
        let curvePivotStart = faultPoints[0];
        let curvePivotEnd = faultPoints[1];
        let found = false;
        let noPossibility = false;
        while (!found && !noPossibility) {
            radius = 0.5 * distance3d(curve[curvePivotStart], curve[curvePivotEnd]);
            dist = idealDistance(radius, 10);
            if (dist > minExtensionDistance) {
                let centerCurve = constructCurve(10, dist, 18, curve[curvePivotStart][0], curve[curvePivotStart][1], curve[curvePivotStart][2]);
                // let leftCurve = rotateEntireCurve(0, centerCurve);
                // let rightCurve = rotateEntireCurve(-0, centerCurve);

                // curves.push(centerCurve);
                // drawCurve(curves.length - 1, colorSelection.MAROON);
                // curves.push(leftCurve);
                // drawCurve(curves.length - 1, colorSelection.OLIVE);
                // curves.push(rightCurve);
                // drawCurve(curves.length - 1, colorSelection.SIENNA);

                let leftFound;
                let rightFound;
                for (let i = 0; i < curvePivotStart; i++) {
                    if(!leftFound){
                        for(let j = 0; j < Math.ceil(centerCurve.length / 2); j++){
                            let outerCurveIndex = curvePivotStart - i;
                            let [yaw1, pitch1] = findChangeInYawPitch(curve[outerCurveIndex - 1], curve[outerCurveIndex], centerCurve[j]);
                            let [yaw2, pitch2] = findChangeInYawPitch(curve[i], centerCurve[j], centerCurve[j + 1]);
                            if(Math.abs(yaw1) <= 10 && Math.abs(pitch1) <= 10 && !leftFound){
                                if(Math.abs(yaw2) <= 10 && Math.abs(pitch2) <= 10 && !leftFound){
                                    leftFound = true;
                                }
                            }
                        }
                    }
                }

                for(let i=curvePivotEnd; i < curve.length - 1; i++){
                    if(!rightFound){
                        for(let j=centerCurve.length - 1; j > Math.ceil(centerCurve.length / 2); j--){
                            let [yaw1, pitch1] = findChangeInYawPitch(centerCurve[j], curve[i], curve[i+1]);
                            let [yaw2, pitch2] = findChangeInYawPitch(curve[i], centerCurve[j], centerCurve[j-1]   );
                            if(Math.abs(yaw1) <= 10 && Math.abs(pitch1) <= 10 && !rightFound){
                                if(Math.abs(yaw2) <= 10 && Math.abs(pitch2) <= 10 && !rightFound){
                                    rightFound = true;
                                }
                            }
                        }
                    }
                }
                let newCurveCollisionTest = checkCurveAgainstSingleObstacle(centerCurve, obstacleIndex);
                if(leftFound && rightFound && newCurveCollisionTest.length === 0){
                    found = true;
                    successfulCurve = centerCurve;
                    let finalCurve = mergeTwoCurves(curve, successfulCurve, curvePivotStart, curvePivotEnd);
                    drawSpline(splineEntireCurve(finalCurve), colorSelection.VIORED);
                }
                // leftFound = false;
                // rightFound = false;
                // for (let i = 0; i < curvePivotStart; i++) {
                //     if(!leftFound){
                //         for(let j = 0; j < Math.ceil(leftCurve.length / 2); j++){
                //             let indexBoi = curvePivotStart - i;
                //             let [yaw1, pitch1] = findChangeInYawPitch(curve[indexBoi - 1], curve[indexBoi], leftCurve[j]);
                //             let [yaw2, pitch2] = findChangeInYawPitch(curve[i], leftCurve[j], leftCurve[j + 1]);
                //             console.log(yaw1, pitch1, yaw2, pitch2);
                //             if(Math.abs(yaw1) <= 10 && Math.abs(pitch1) <= 10 && !leftFound){
                //                 if(Math.abs(yaw2) <= 10 && Math.abs(pitch2) <= 10 && !leftFound){
                //                     pathPoints.push(curve[indexBoi - 1]);
                //                     pathPoints.push(curve[indexBoi]);
                //                     pathPoints.push(curve[indexBoi]);
                //                     pathPoints.push(leftCurve[j]);
                //                     pathPoints.push(leftCurve[j]);
                //                     pathPoints.push(leftCurve[j + 1]);
                //                     pathColors.push(colorSelection.SIENNA);
                //                     pathColors.push(colorSelection.SIENNA);
                //                     pathColors.push(colorSelection.SIENNA);
                //                     pathColors.push(colorSelection.SIENNA);
                //                     pathColors.push(colorSelection.SIENNA);
                //                     pathColors.push(colorSelection.SIENNA);
    
                //                     leftFound = true;
                //                 }
                //             }
                //         }
                //     }
                // }

                // for(let i=curvePivotStartEnd; i < curve.length - 1; i++){
                //     if(!rightFound){
                //         for(let j=leftCurve.length - 1; j > Math.ceil(leftCurve.length / 2); j--){
                //             let [yaw1, pitch1] = findChangeInYawPitch(leftCurve[j], curve[i], curve[i+1]);
                //             let [yaw2, pitch2] = findChangeInYawPitch(curve[i], leftCurve[j], leftCurve[j-1]   );
                //             if(Math.abs(yaw1) <= 10 && Math.abs(pitch1) <= 10 && !rightFound){
                //                 if(Math.abs(yaw2) <= 10 && Math.abs(pitch2) <= 10 && !rightFound){
                //                     pathPoints.push(curve[i + 1]);
                //                     pathPoints.push(curve[i]);
                //                     pathPoints.push(curve[i]);
                //                     pathPoints.push(leftCurve[j]);
                //                     pathPoints.push(leftCurve[j]);
                //                     pathPoints.push(leftCurve[j + 1]);
                //                     pathColors.push(colorSelection.GREEN);
                //                     pathColors.push(colorSelection.GREEN);
                //                     pathColors.push(colorSelection.GREEN);
                //                     pathColors.push(colorSelection.GREEN);
                //                     pathColors.push(colorSelection.GREEN);
                //                     pathColors.push(colorSelection.GREEN);
                //                     rightFound = true;
                //                 }
                //             }
                //         }
                //     }
                // }
                if(!found){
                    curvePivotStart = curvePivotStart - 1;
                    curvePivotEnd = curvePivotEnd + 1;
                    if (curvePivotStart < 0 || curvePivotEnd > curve.length) {
                        noPossibility = true;
                    }
                }
            }
            else {
                curvePivotStart = curvePivotStart - 1;
                curvePivotEnd = curvePivotEnd + 1;

                if (curvePivotStart < 0 || curvePivotEnd > curve.length) {
                    noPossibility = true;
                }
            }
        }  
    }
    pathPoints.push(curve[8]);
    pathPoints.push(curve[9]);
    pathColors.push(colorSelection.MAROON);
    pathColors.push(colorSelection.MAROON);
    pathPoints.push(curve[10]);
    pathPoints.push(curve[11]);
    pathColors.push(colorSelection.MAROON);
    pathColors.push(colorSelection.MAROON);

}

function mergeTwoCurves(curveA, curveB, startIndex, endIndex) {
    let oddCurve = curveA.slice(0, startIndex);
    let newCurve = oddCurve.concat(curveB);
    let finalCurve = newCurve.concat(curveA.slice(endIndex));
    return finalCurve;
}

function catMullRomSpline(pointA, pointB, pointC, pointD, alpha) {
    // https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline

    //0 alpha for uniform, centripetal is 0.5, chordal is 1
    pointA = pointA.slice(0, 3);
    pointB = pointB.slice(0, 3);
    pointC = pointC.slice(0, 3);
    pointD = pointD.slice(0, 3);

    let t0 = 0;
    let t1 = Math.pow(distance3d(pointA, pointB), alpha) + t0;
    let t2 = Math.pow(distance3d(pointB, pointC), alpha) + t1;
    let t3 = Math.pow(distance3d(pointC, pointD), alpha) + t2;

    let numPoints = 100;
    let increment = (t2 - t1) / numPoints;
    let A1, A2, A3, B1, B2, C;
    let catMullPoints = [];
    for (let t = t1; t < t2; t += increment) {
        A1 = add(scale(((t1 - t) / (t1 - t0)), pointA), scale(((t - t0) / (t1 - t0)), pointB));
        A2 = add(scale(((t2 - t) / (t2 - t1)), pointB), scale(((t - t1) / (t2 - t1)), pointC));
        A3 = add(scale(((t3 - t) / (t3 - t2)), pointC), scale(((t - t2) / (t3 - t2)), pointD));
        B1 = add(scale(((t2 - t) / (t2 - t0)), A1), scale(((t - t0) / (t2 - t0)), A2));
        B2 = add(scale(((t3 - t) / (t3 - t1)), A2), scale(((t - t1) / (t3 - t1)), A3));
        C = add(scale(((t2 - t) / (t2 - t1)), B1), scale(((t - t1) / (t2 - t1)), B2));
        catMullPoints.push(C);
    }
    return catMullPoints;
}

function drawSpline(spline, color){
    for (let i = 0; i < spline.length - 1; i++) {
        pathPoints.push([...spline[i], 1]);
        pathPoints.push([...spline[i + 1], 1]);
        pathColors.push(color);
        pathColors.push(color);
    }
}

function checkCurve(curve) {
    let obstacleCollision;
    let totalCollision = false;
    let obstacleIndex;
    let i, j;
    let faultPoints = [];
    for (i = 0; i < obstacles.length; i++) {
        if (!totalCollision) {
            for (j = 0; j < curve.length - 1; j++) {
                obstacleCollision = detectCollisionInObstacle(curve[j], curve[j + 1], i);
                if (obstacleCollision) {
                    faultPoints.push(j);
                    obstacleIndex = i;
                    totalCollision = true;
                }
                else {
                }
            }
        }
        //Only want to find one obstacle at a time
    }
    return [faultPoints, obstacleIndex];
}

function checkCurveAgainstSingleObstacle(curve, obstacleIndex){
    let obstacleCollision;
    let i, j;
    let faultPoints = [];
    for (j = 0; j < curve.length - 1; j++) {
        obstacleCollision = detectCollisionInObstacle(curve[j], curve[j + 1], obstacleIndex);
        if (obstacleCollision) {
            faultPoints.push(j);
            obstacleIndex = i;
        }
        else {
        }
    }
    return faultPoints;
}  

function curveFromYawPitch(distance, deltaYaw, deltaPitch, startPoint, initialDirection, iterations) {
    let unitDirection = normalize((initialDirection.slice(0, 3)));
    let point2 = [
        (unitDirection[0] * distance) + startPoint[0],
        (unitDirection[1] * distance) + startPoint[1],
        ((unitDirection[2]) * distance) + startPoint[2],
        1
    ];
    let [yaw, pitch] = findYawPitch(unitDirection);
    let curvePoints = [[...startPoint, 1], point2];
    let unitDir, point3;
    for (let i = 0; i < iterations; i++) {
        yaw += deltaYaw;
        pitch += deltaPitch;
        unitDir = findDirectionVector(yaw, pitch);
        point3 = [
            (unitDir[0] * distance) + point2[0],
            (unitDir[1] * distance) + point2[1],
            (unitDir[2] * distance) + point2[2],
            1
        ];
        point2 = point3;
        curvePoints.push(point3);
    }
    return curvePoints;
}

function rotateEntireCurve(yaw, curve) {
    //Translate to origin
    //Rotate
    //Translate back
    let translatedPoints = [];
    let finalPoints = [];
    let midPoint = midPointOfPoints(curve[0], curve[curve.length - 1]);
    let point;
    //Center translation
    for (let i = 0; i < curve.length; i++) {
        translatedPoints.push(
            [
                ...subtract(curve[i].slice(0, 3), midPoint.slice(0, 3)),
                1
            ]
        )
    }

    //Find pitch, yaw
    let [currentYaw, currentPitch] = findYawPitch(translatedPoints[translatedPoints.length - 1]);

    //Set up matrices
    let pitchRotMat = rotateZ(-currentPitch);
    let yawRotMat = rotateY(-currentYaw)
    let rotMat = rotateX(yaw);
    let newYawRotMat = rotateY(currentYaw);
    let newPitchRotMat = rotateZ(currentPitch);

    translatedPoints.map((curvePoint) => {
        point = mult(pitchRotMat, curvePoint);
        point = mult(yawRotMat, point);
        point = mult(rotMat, point);
        point = mult(newYawRotMat, point);
        point = mult(newPitchRotMat, point);
        point = [...add(point.slice(0, 3), midPoint.slice(0, 3)), 1];
        finalPoints.push(JSON.parse(JSON.stringify(point)));
    });

    return finalPoints;
}

function extendLine3d(pointA, pointB, distance) {
    // https://answers.unity.com/questions/1139633/extending-a-vector.html
    let magnitude = distance3d(pointA, pointB);
    let directionVector = [pointB[0] - pointA[0], pointB[1] - pointA[1], pointB[2] - pointA[2]];
    let unitDir = [directionVector[0] / magnitude, directionVector[1] / magnitude, directionVector[2] / magnitude];
    let x = (unitDir[0] * (distance)) + pointB[0];
    let y = (unitDir[1] * (distance)) + pointB[1];
    let z = (unitDir[2] * (distance)) + pointB[2];
    return [x, y, z, 1];
}

function findYawPitch(pointA) {
    // https://stackoverflow.com/questions/21622956/how-to-convert-direction-vector-to-euler-angles
    let unitDir = normalize(pointA.slice(0, 3));
    let pitch = radToDeg(Math.asin(unitDir[1]));
    let yaw = radToDeg(Math.atan2(unitDir[2], unitDir[0]));
    return [yaw, pitch];
}

function findChangeInYawPitch(pointA, pointB, pointC) {
    let [yaw1, pitch1] = findYawPitch(subtract(pointB, pointA));
    let [yaw2, pitch2] = findYawPitch(subtract(pointC, pointB));
    // if (yaw2 - yaw1 === 180) {
    //     console.log(
    //         'Not actually a change'
    //     )
    // }
    return [yaw2 - yaw1, pitch2 - pitch1];
}

function findDirectionVector(yaw, pitch) {
    yaw = degToRad(yaw);
    pitch = degToRad(pitch);

    let x = Math.cos(yaw) * Math.cos(pitch);
    let y = Math.sin(pitch);
    let z = Math.sin(yaw) * Math.cos(pitch);
    return [x, y, z, 1];
}


function midPointOfPoints(pointA, pointB) {
    let point = add(pointA, pointB);
    point = scale(0.5, point); //This lets w go back to 1
    return point;
}

function showRange(theta, d, pointA, pointB, maxIterations, count) {
    //theta = degToRad(theta);
    if (maxIterations === count) {
        return;
    }
    else {
        //Multiplying the matrices together is O(16);
        let center = extendLine3d(pointA, pointB, d);
        let rotPoint = subtract(center, pointB);
        let left = add(mult(rotateZ(theta), rotPoint), pointB);
        let right = add(mult(rotateZ(-theta), rotPoint), pointB);
        let forwards = add(mult(rotateX(theta), rotPoint), pointB);
        let backwards = add(mult(rotateX(-theta), rotPoint), pointB);
        pathPoints.push(pointB);
        pathPoints.push(center);
        pathColors.push(colorSelection.ROSY);
        pathColors.push(colorSelection.ROSY);
        pathPoints.push(pointB);
        pathPoints.push(left);
        pathColors.push(colorSelection.TEAL);
        pathColors.push(colorSelection.TEAL);
        pathPoints.push(pointB);
        pathPoints.push(right);
        pathColors.push(colorSelection.MAROON);
        pathColors.push(colorSelection.MAROON);
        pathPoints.push(pointB);
        pathPoints.push(forwards);
        pathColors.push(colorSelection.MEDIUM_PURPLE);
        pathColors.push(colorSelection.MEDIUM_PURPLE);
        pathPoints.push(pointB);
        pathPoints.push(backwards);
        pathColors.push(colorSelection.CORAL);
        pathColors.push(colorSelection.CORAL);
        let distance = distance3d(pointB, center);
        //With recursion it's O(((16*5))^n)
        showRange(theta, distance, pointB, center, maxIterations, count + 1);
        showRange(theta, distance, pointB, left, maxIterations, count + 1);
        showRange(theta, distance, pointB, right, maxIterations, count + 1);
        showRange(theta, distance, pointB, backwards, maxIterations, count + 1);
        showRange(theta, distance, pointB, forwards, maxIterations, count + 1);
    }
}

function randomizeObstacles(numObstacles) {
    for (let i = 0; i < numObstacles; i++) {
        let x = (Math.cos(Math.PI * Math.round(Math.random()))) * Math.random() * 60;
        let y = (Math.cos(Math.PI * Math.round(Math.random()))) * Math.random() * 60;
        let z = (Math.cos(Math.PI * Math.round(Math.random()))) * Math.random() * 60;
        addObstacle(
            x, y, z, Math.random() * 5)
    }
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
    camPos = vec3(28.178494562874054, 19.997956366804384, -65.1714409838708);
    camUp = vec3(0.0, 1.0, 0.0);
    camFront = vec3( -0.36891547752548215, -0.17364817766693033, 0.9130978484451158);

    updateViewMat();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.lineWidth(5);
}

function addAxis(x, y, z) {
    if (x) {
        pathPoints.push(vec4(-200.0, 0.0, 0.0, 1.0));
        pathPoints.push(vec4(200.0, 0.0, 0.0, 1.0));
        pathColors.push(colorSelection.VIORED);
        pathColors.push(colorSelection.VIORED);
    }
    if (y) {
        pathPoints.push(vec4(0.0, -200.0, 0.0, 1.0));
        pathPoints.push(vec4(0.0, 200.0, 0.0, 1.0));
        pathColors.push(colorSelection.GREEN);
        pathColors.push(colorSelection.GREEN);
    }
    if (z) {
        pathPoints.push(vec4(0.0, 0.0, -200.0, 1.0));
        pathPoints.push(vec4(0.0, 0.0, 200.0, 1.0));
        pathColors.push(colorSelection.CORNFLOWER_BLUE);
        pathColors.push(colorSelection.CORNFLOWER_BLUE);
    }
}

function detectCollisionInObstacle(a, b, obstacleIndex) {
    let collisionDetected = false;
    let indexArr = [];
    let triangles = [];
    let obstacleStart = obstacleIndex * 36;
    indexArr = [obstacleStart, obstacleStart + 6, obstacleStart + 12, obstacleStart + 18, obstacleStart + 24, obstacleStart + 30];
    indexArr.map((i) => {
        triangles.push([obstaclePoints[i], obstaclePoints[i + 1], obstaclePoints[i + 2]]);
    })
    triangles.map(triangle => {
        if (collisionDetected) {

        }
        else {
            collisionDetected = collisionDetection(a, b, triangle[0], triangle[1], triangle[2]);
        }
    })
    return collisionDetected;
}

//NOT DONE
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

function idealDistance(radius, theta) {
    let newDist = Math.sqrt(2 * radius * radius * (1 - Math.cos(degToRad(theta))));
    return newDist;
};

function constructCurve(theta, distance, iterations, xstart, ystart, zstart) {
    let curvePoints = [];
    let x1, y1;
    let x2, y2;
    x1 = xstart;
    y1 = ystart;
    x2 = xstart;
    y2 = ystart - distance;

    curvePoints.push([x1, y1, zstart, 1]);
    curvePoints.push([x2, y2, zstart, 1]);
    let tempX, tempY;
    for (let i = 0; i < iterations; i++) {
        [tempX, tempY] = findNextPointOnCurve(theta, distance, x1, y1, x2, y2);
        curvePoints.push([tempX, tempY, zstart, 1]);
        x1 = x2;
        y1 = y2;
        x2 = tempX;
        y2 = tempY;
    }
    return curvePoints;
}

function drawCurve(index, color) {
    let path = curves[index];
    for (let i = 0; i < path.length - 1; i++) {
        pathPoints.push(path[i]);
        pathPoints.push(path[i + 1]);
        pathColors.push(color);
        pathColors.push(color);
    }
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

        //angleBetweenTwoPoints(x2P, y2P, x2r, y2r);

        return [x2RT, y2RT];
    }
    else {
        throw console.error("Cannot make a line segment from those points, they are the same.");
    }
}

function collisionDetection(a, b, p, q, r) {
    //P Q R is always clockwise
    //So use P - Q + R

    let line1 = [subtract(a.slice(0, 3), b.slice(0, 3)), cross(a.slice(0, 3), b.slice(0, 3))];
    let plane = findPlaneCoefficients(p, q, r);

    let intersection = subtract(cross(line1[1], plane.slice(0, 3)), scale(plane[3], line1[0]));
    let homogenousIntersection = dot(plane.slice(0, 3), line1[0]);

    let finalIntersection = [intersection[0] / homogenousIntersection, intersection[1] / homogenousIntersection, intersection[2] / homogenousIntersection];


    let aZero = testAgainstZero(plane[0]);
    let bZero = testAgainstZero(plane[1]);
    let cZero = testAgainstZero(plane[2]);

    let s = [
        p[0] - q[0] + r[0],
        p[1] - q[1] + r[1],
        p[2] - q[2] + r[2]
    ];
    // Fetch max and min values
    let xMin = Math.min(p[0], q[0], r[0], s[0]);
    let xMax = Math.max(p[0], q[0], r[0], s[0]);
    let yMin = Math.min(p[1], q[1], r[1], s[1]);
    let yMax = Math.max(p[1], q[1], r[1], s[1]);
    let zMin = Math.min(p[2], q[2], r[2], s[2]);
    let zMax = Math.max(p[2], q[2], r[2], s[2]);
    let inRange = false;

    let xInRange = (xMin <= finalIntersection[0]) && (xMax >= finalIntersection[0]);
    let yInRange = yMin <= finalIntersection[1] && yMax >= finalIntersection[1];
    let zInRange = zMin <= finalIntersection[2] && zMax >= finalIntersection[2];
    //CASE 1 x,y,z
    if (!aZero && !bZero && !cZero) {
        inRange = xInRange && yInRange;
    }
    //CASE 2 y,z
    else if (aZero && !bZero && !cZero) {
        inRange = xInRange && yInRange;
    }
    //CASE 3 x,z
    else if (!aZero && bZero && !cZero) {
        inRange = xInRange && yInRange;
    }
    //CASE 4 x,y
    else if (!aZero && !bZero && cZero) {
        inRange = xInRange && yInRange && zInRange;
    }
    //CASE 5 x
    else if (!aZero && bZero && cZero) {
        inRange = yInRange && zInRange;
    }
    //CASE 6 y
    else if (aZero && !bZero && cZero) {
        inRange = xInRange && zInRange;
    }
    //CASE 7 z
    else if (aZero && bZero && !cZero) {
        inRange = xInRange && yInRange;
    }
    if (inRange) {
        let ab = subtract(b.slice(0, 3), a.slice(0, 3));
        let ac = subtract(finalIntersection, a.slice(0, 3));
        let crossProduct = cross(ab, ac);
        let crossMagnitude = length(crossProduct);
        if (testAgainstZero(crossMagnitude)) {
            //Is Zero
            let dotAbAc = dot(ab, ac);
            if (dotAbAc < 0) {
                return false;
            }
            else {
                let abDist = distance3d(a.slice(0, 3), b.slice(0, 3));
                abDist = abDist * abDist;
                if (abDist < dotAbAc) {
                    return false
                }
                else {
                    return true;
                }
            }
        }
        return false;
    }
    //Need to check if intersection point is inbetween the points themselves
    //https://stackoverflow.com/questions/328107/how-can-you-determine-a-point-is-between-two-other-points-on-a-line-segment

    return false;
}

function testAgainstZero(val) {
    return (val > -0.00001 && val < 0.00001);
}

/**Calculates a third point a distance (d) down the line determined by the first two points
 * It is created by multiplying the components of the unit vector by the distance, and then adding the second point
 * @param {float} x0 
 * @param {float} y0 
 * @param {float} x1 
 * @param {float} y1 
 * @param {float} d 
 * @returns [x2,y2]
 */
function extendLine(x0, y0, x1, y1, d) {
    let unit = normalize([x1 - x0, y1 - y0]);
    let x2 = (unit[0] * d) + x1;
    let y2 = (unit[1] * d) + y1;
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

/**A helper function to calculate distances between points.
 * @param {*} xi
 * @param {*} yi 
 * @param {*} xf 
 * @param {*} yf
 * @returns distance
 */
function distance(xi, yi, xf, yf) {
    return Math.sqrt(Math.pow(xf - xi, 2) + Math.pow(yf - yi, 2));
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
    let lookMat = lookAt([q[0], q[1], q[2]], add([q[0], q[1], q[2]], Z), Y);
    let vec1Res = mult(lookMat, p);
    let vec2Res = mult(lookMat, q);
    let vec3Res = mult(lookMat, r);

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
function addObstacle(x, y, z, s, colors) {
    obstacles.push([x, y, z, s]);
    let r = s / 2;
    let minY = y - r;
    let maxY = y + r;
    let minX = x - r;
    let maxX = x + r;
    let minZ = z - r;
    let maxZ = z + r;

    let obstacleColor1;
    let obstacleColor2;
    let obstacleColor3;
    if (colors && colors.length === 3) {
        obstacleColor1 = colors[0];
        obstacleColor2 = colors[1];
        obstacleColor3 = colors[2];
    }
    else {
        obstacleColor1 = colorSelection.OBJECT_TRANSLUSCENT;
        obstacleColor2 = colorSelection.OBJECT_TRANSLUSCENT;
        obstacleColor3 = colorSelection.OBJECT_TRANSLUSCENT;
    }
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

    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor2);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor2);


    //Bottom Face
    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(bottomFrontRight);
    obstaclePoints.push(bottomBackRight);
    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(bottomBackRight);
    obstaclePoints.push(bottomBackLeft);

    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor2);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor2);

    //Front Face

    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(topFrontLeft);
    obstaclePoints.push(topFrontRight);
    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(topFrontRight);
    obstaclePoints.push(bottomFrontRight);

    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor2);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor2);

    //Back Face

    obstaclePoints.push(bottomBackLeft);
    obstaclePoints.push(topBackLeft);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(bottomBackLeft);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(bottomBackRight);

    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor2);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor2);

    //Right Face

    obstaclePoints.push(bottomFrontRight);
    obstaclePoints.push(topFrontRight);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(bottomFrontRight);
    obstaclePoints.push(topBackRight);
    obstaclePoints.push(bottomBackRight);

    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor2);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor2);

    //Left Face

    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(bottomBackLeft);
    obstaclePoints.push(topBackLeft);
    obstaclePoints.push(bottomFrontLeft);
    obstaclePoints.push(topBackLeft);
    obstaclePoints.push(topFrontLeft);

    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor2);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor1);
    obstacleColors.push(obstacleColor3);
    obstacleColors.push(obstacleColor2);
}


function curveAroundObstacle(index) {
    if (obstacles.length === index + 1) {
        let obstacle = obstacles[index];
        let arcR = obstacle[3] * Math.sqrt(2) / 2;
        let xStart = obstacle[0] - arcR;
        let dynamicDistance = Math.sqrt(2 * arcR * arcR * (1 - Math.cos(degToRad(20))));
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