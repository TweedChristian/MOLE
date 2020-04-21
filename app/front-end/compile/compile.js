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