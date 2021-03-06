function main(){
    populate();
    setupControls();
}


function setupControls() {
    document.addEventListener('keyup', (event) => {
        filterKey(event.key);
    })
}

// function addCommand(message, emergency) {
//     const start = document.getElementById('commandPlaceholder')
//     if(start){
//         start.remove();
//     }
//     if(emergency){
//         let ul = document.getElementById('logBox');
//         let li = document.createElement('li');
//         li.classList.add('c_controlsBlock__emergencyMessage');
//         li.appendChild(document.createTextNode(message));
//         ul.insertAdjacentElement('afterbegin', li);
//     }
//     else{
//         let ul = document.getElementById('logBox');
//         let li = document.createElement('li')
//         li.classList.add('c_controlsBlock__command');
//         li.appendChild(document.createTextNode(message))
//         ul.insertAdjacentElement('afterbegin', li);
//     }
// }

function addCommand(message, color) {
    const start = document.getElementById('commandPlaceholder')
    if(start){
        start.remove();
    }
    let ul = document.getElementById('logBox');
    let li = document.createElement('li');
    if(color === 'red'){
        
        li.classList.add('c_controlsBlock__emergencyMessage');
        ul.insertAdjacentElement('afterbegin', li);
    }
    else if(color === 'green'){
        li.classList.add('c_controlsBlock__heading');
    }
    else{
        li.classList.add('c_controlsBlock__command');      
    }
    li.appendChild(document.createTextNode(message));
    ul.insertAdjacentElement('afterbegin', li);
}

function emergency(){
    addCommand('EMERGENCY STOP', 'red');
}


function send(req) {
    console.log(req);
    fetch('/submit', {
        method: 'POST',
        body: JSON.stringify(req),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => checkResponseStatus(response));
}


async function checkResponseStatus(response){
    try {
        let body = await response.json();
        console.log(body);
        // addCommand(`--${body.message}--`, true);
        switch(response.status){
            case 200:
                console.log("OK!");
                handleResponse(body);
                break;
            case 400:
                console.log("COMMAND ERROR");
                addCommand(body.message, 'red');
                break;
            case 500:
                addCommand(response.statusText, 'red');
                console.log("SERVER ERROR");
                break;
            default:
                console.log(response.status);
                break;
        }
    }
    catch(err) {
        
    }
    
}

function handleResponse(response) {
    console.log(response);
    switch (response.type) {
        case 'status':
            console.log("NOT DEFAULT");
            handleStatus(response);
            break;
        case 'error':
            handleError(response);
            break;
        default:
            handleDefault(response);
            break;
    }
}

function handleError(response){
    addCommand(response.message, 'red');
    addCommand("ERROR: ", 'red');
}

function handleStatus(response) {
    console.log(response);

}

function handleDefault(response){
    console.log(response);
    console.log('shit')
}

function compare() {
    let bore = document.getElementById('boring').value;
    let extension = document.getElementById('extension').value;
    let turnx = document.getElementById('turnx').value;
    let turnz = document.getElementById('turnz').value;
    let newVals = [bore, extension, turnx, turnz];
    let names = ['Boring Speed: ', 'Extension Rate: ', 'Turning X: ', 'Turning Z: '];
    let changedFlag = 0;
    //Comparing the new settings to the old ones
    for (let i = 0; i < newVals.length; i++) {
        if (newVals[i] !== controls[i]) {
            addCommand(names[i] + newVals[i]);
            controls[i] = newVals[i];
            changedFlag = 1;
        }
    }
    if (!changedFlag) {
        addCommand('No Effect');
        //Don't send anything
        return null;
    }
    if (changedFlag) {
        let controlsJSON = {
            type: 'controls',
            boringSpeed: bore,
            extensionRate: extension,
            turningX: turnx,
            turningZ: turnz,
            inflateFront: controls[4],
            inflateBack: controls[5],
        }
        return controlsJSON;
    }
}

function populate() {
    let bore = document.getElementById('boring').value;
    let extension = document.getElementById('extension').value;
    let turnx = document.getElementById('turnx').value;
    let turnz = document.getElementById('turnz').value;
    controls = [bore, extension, turnx, turnz, false, false];
}

function inflate(location) {
    if (location === 0) {
        if (controls[4] === false) {
            addCommand('Inflating Front');
            controls[4] = true;
        }
        else {
            addCommand('Deflating Front');
            controls[4] = false;
        }
    }
    else {
        if (controls[5] === false) {
            addCommand('Inflating Back');
            controls[5] = true;
        }
        else {
            addCommand('Deflating Back');
            controls[5] = false;
        }
    }
    let controlsJSON = {
        type: 'controls',
        boringSpeed: controls[0],
        extensionRate: controls[1],
        turningX: controls[2],
        turningZ: controls[3],
        inflateFront: controls[4],
        inflateBack: controls[5],
    }
    send(controlsJSON);
}

function filterKey(key) {
    if (key == 'Enter') {
        send(compare())
    }
}
