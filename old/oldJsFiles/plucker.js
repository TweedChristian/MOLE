
function collisionDetection(i1, f1, i2, f2){
    let pd = [
        i1[0] - f1[0],
        i1[1] - f1[1],
        i1[2] - f1[2]
    ];
    let pm = cross(i1, f1);
    let qd = [
        i2[0] - f2[0],
        i2[1] - f2[1],
        i2[2] - f2[2]
    ];
    let qm = cross(i2, f2);
    console.log("===Vectors===");
    console.log("===pd===");
    console.log(pd);
    console.log("===pm===");
    console.log(pm);
    console.log('===qd===');
    console.log(qd);
    console.log('===qm===')
    console.log(qm);
    console.log('===w test===');
    console.log(dot(pd, pm) + dot(qd, qm));
    console.log("===intersect testing===");
    console.log(dot(pd, qm));
    console.log(dot(qd, pm));
    let intersect = (dot(pd, qm) + dot(qd, pm));
    let parallel = cross(pd, qd);
    console.log("===parallel===");
    console.log(parallel);
    let xAxis = [1,0,0];
    let yAxis = [0,1,0];
    let zAxis =[0,0,1];
    console.log("===intersect===");
    console.log(intersect);
    let xtest = dot(cross(pd,qd), xAxis);
    console.log('===XTEST===');
    console.log(xtest);
    let ytest = dot(cross(pd,qd), yAxis);
    console.log("===YTEST===");
    console.log(ytest);
    let ztest = dot(cross(pd,qd), zAxis);
    console.log("===ZTEST===");
    console.log(ztest);
    let res = multConst(dot(pm, zAxis), qd);
    console.log('===MultConstTest===')
    console.log(res);
    res = subtractVectors(res, multConst(dot(qm, zAxis), pd));
    console.log(res);
    res = subtractVectors(res, multConst(dot(pm, qd), zAxis));
    console.log(res);
    res = divideConst(dot(cross(pd, qd), zAxis), res);
    console.log(res);

}

function mult(u, v){
    return [(u[0] * v[0]), (u[1] * v[1]), (u[2] * v[2])];
}

function multConst(c, u){
    return [(c * u[0]), (c * u[1]), (c * u[2])];
}

function addVectors(u,v){
    return [(u[0] + v[0]), (u[1], v[1]), (u[2], v[2])];
}

function subtractVectors(u,v){
    return [(u[0] - v[0]), (u[1] - v[1]), (u[2] - v[2])];
}
function divideConst(c, u){
    return [(u[0] / c), (u[1] / c), (u[2] / c)];
}