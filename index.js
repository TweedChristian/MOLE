let modelMat;
let program;
let gl;

let points = [];
let colors = [];

let obstaclePoints = [];

let colorSelection;

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

function main() {
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
    let up = vec3(0.0, 1.0, 0.0);

    let viewMat = lookAt(eyePos, at, up);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'viewMatrix'), false, flatten(viewMat));

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
    //   cube();
    //parabola(5, 20);
  //  angleSubdivisionGeneration(idealRadius(6,4));
    outsideAngleGeneration();
    render();
    draw();
    // animate();
}

/**Returns a radius based on an ideal formula of r = sqrt( d ^ 2 / 2 * (1 - cos(ang)))
 * 
 * @param {int} count The amount of times to divide the semicircle by
 * @param {int} segDist The distance of the extension
 */
function idealRadius(count, segDist){
    let ang = 180 / count;
    let radius = Math.sqrt(Math.pow(segDist, 2) / 
    2 / (1 - (Math.cos(ang * Math.PI / 180)) ) );
    console.log(radius);
    return radius
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

//let segDist = 0.51825575467;
let segDist = 4;

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

// function test(){
//    // let pts = [];
//     points.push(vec4(-5,-4,0.0,1.0));
//     colors.push(colorSelection[8]);
//     let ang = 3.5;
//     let rad = (ang) * Math.PI / 180;
//     let x = 4 * Math.cos(rad) + points[0][0];
//     let y = 4 * Math.sin(rad) + points[0][1];
//     colors.push(colorSelection[6]);
//     points.push(vec4(x,y,0.0,1.0));
//     for(let i=1;i<100;i++){
//         let rad = (ang * i) * Math.PI / 180;
//         let x = 4 * Math.cos(rad) + points[i-1][0];
//         let y = 4 * Math.sin(rad) + points[i-1][1];
//         colors.push(colorSelection[6]);
//         points.push(vec4(x,y,0.0,1.0));
//         let rad2 = (ang * (i + 1)) * Math.PI / 180;
//         let x2 = 4 * Math.cos(rad2) + points[i][0];
//         let y2 = 4 * Math.sin(rad2) + points[i][1];
//         colors.push(colorSelection[8]);
//         points.push(vec4(x2,y2,0.0,1.0));
//     }
//     console.log(points);
// }

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
 * 
 * @param {*} xi is the x coordinate of the initial point
 * @param {*} yi is the y coordinate of the initial point
 * @param {*} xf is the x coordinate of the final point
 * @param {*} yf is the y coordinate of the final point
 * @param {boolean} log is whether or not the user wants to log the result
 */
function distance(xi, yi, xf, yf, log) {
    xfDeep = JSON.parse(JSON.stringify({ val: xf })).val;
    yfDeep = JSON.parse(JSON.stringify({ val: yf })).val;
    xiDeep = JSON.parse(JSON.stringify({ val: xi })).val;
    yiDeep = JSON.parse(JSON.stringify({ val: yi })).val;
    let distance = Math.sqrt(Math.pow(xfDeep - xiDeep, 2) + Math.pow(yfDeep - yiDeep, 2));
    if (log) {
        console.log(`Distance between point (${xf}, ${yf}) and ( ${xi}, ${yi}) is ${distance}`);
    }
    return distance
}

function parabola(distance, degreesOfMotion) {
    let segment = distance / 1000;
    let depth = distance * Math.tan(degreesOfMotion * Math.PI / 180) / 2;
    let a = 4 * depth / (distance * distance);
    let b = -4 * depth / distance;
    let y;
    let x;
    for (let i = 0; i < 1000; i++) {
        x = i * segment;
        y = (a * x * x) + (b * x);
        points.push(vec4(x, y, 0.0, 1.0));
        colors.push(colorSelection[5]);
        x2 = (i + 1) * segment;
        y2 = (a * x2 * x2) + (b * x2);
        points.push(vec4(x2, y2, 0.0, 1.0));
        colors.push(colorSelection[5]);
    }
}

function draw() {
    let mat = translate(-45.0, -45.0, -120.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelMatrix'), false, flatten(translate(0, 0, 0)));
    gl.drawArrays(gl.LINES, 0, points.length);
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