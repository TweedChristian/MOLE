/** Requests the db to send up a csv */

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

function testCall(route){
    fetch(route, {
        method: 'GET',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(body => {
        console.log(body);
        if(body.type === 'error'){
            addCommand(body.message);
            addCommand('Error', 'red');
        }
        else {
            addCommand(JSON.stringify(body.data));
            addCommand('Message Received', 'green');
        }
    })
}

function testErrorPost(message){
    let json = {
        type: 'error',
        message: 'Testing error message'
    };
    fetch('/submit', {
        method: 'POST',
        body: JSON.stringify(json),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(body => {
            console.log(body);
            addCommand(JSON.stringify(body));
        });
}

function testPathPost(){
    let pathJSON = {
        type: 'path',
        cartesian: [1,3,2],
        euler: [0,60,0],
        distance: 5,
        index: 0
    }
    fetch('/submit', {
        method: 'POST',
        body: JSON.stringify(pathJSON),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(body => {
            console.log(body);
        });
}

function testCorrectedPathPost() {
        let pathJSON = {
            type: 'correctedPath',
            cartesian: [0,0,2],
            euler: [2,60,15],
            distance: 2,
            index: 1
        }
        fetch('/submit', {
            method: 'POST',
            body: JSON.stringify(pathJSON),
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(body => {
                console.log(body);
            });
}

function testPathInitialize() {
    let pathInitJSON = {
        type: 'pathInitialize',
        obstacles: [[
            [-1,1,1,1],
            [-1,1,-1,1],
            [1,1,1,1],
            [1,1,-1,1],
            [-1,-1,-1,1],
            [1,-1,-1,1],
            [-1,-1,1,1],
            [1,-1,1,1]
        ]],
        points: [
            [6,1,0,1],
            [10,2,2,1],
            [2,3,4,1],
            [4,4,6,6]
        ]
    };

    fetch('/submit', {
        method: 'POST',
        body: JSON.stringify(pathInitJSON),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(body => {
        console.log(body);
    });
}

function testAddObstacle() {
    let obstacleJSON = {
        type: 'addObstacle',
        obstacle: [[
            [-1,1,1,1],
            [-1,1,-1,1],
            [1,1,1,1],
            [1,1,-1,1],
            [-1,-1,-1,1],
            [1,-1,-1,1],
            [-1,-1,1,1],
            [1,-1,1,1]
        ]],
    };

    fetch('/submit', {
        method: 'POST',
        body: JSON.stringify(obstacleJSON),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
    .then( response => response.json())
    .then( body => {
        console.log(body);
    })
}