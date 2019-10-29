//Model Matrix is moving shit in the scene


let modelMat;
let program;
let gl;

let points = [];
let colors = [];

let colorSelection;

function main(){
    let canvas = document.getElementById("Canvas");
    gl = WebGLUtils.setupWebGL(canvas, undefined);
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);
    if (!gl) {
        console.log("gl didn't work");
    }
    let projMat = ortho(-3.0, 3.0, -3.0, 3.0, -10, 100);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false, flatten(projMat));

    let at = vec3(0.0, 0.0, 0.0);
    let eyePos = vec3(2.0, 2.0, 10.0);
    let up = vec3(0.0, 1.0, 0.0);

    let viewMat = lookAt(eyePos, at, up);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'viewMatrix'), false, flatten(viewMat));

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    colorSelection = [
        vec4(0.941,0.902,0.549,1.0), //khaki
        vec4(0.627, 0.322,0.176,1.0), //sienna
        vec4(0.502,0.502,0.0,1.0), //olive
        vec4(0.502,0.0,0.502,1.0), //purple
        vec4(0.753,0.753,0.753,1.0), //silver
        vec4(0.502,0.0,0.0,1.0), //maroon
        vec4(0.0,0.502,0.502,1.0), //teal
        vec4(0.0,0.502,0.0,1.0), //green
        vec4(0.941,0.502,0.502,1.0), //coral
        vec4(0.737,0.561,0.561,1.0), //rosy
        vec4(1.0,1.0,1.0,1.0), //white
        vec4(0.439,0.502,0.565,1.0), //slate
        vec4(0.78,0.082,0.522,1.0)//viored
    ];

    cube();
    render();
    animate();
}

function render(){

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

function animate(){
    theta += 5;
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelMatrix'), false, flatten(rotateY(theta)));
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
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