addEventListener("keydown", function(event){
    this.console.log(event.key);
    keyDownHandler(event.key)
});

addEventListener("keyup", function(event){
    keyUpHandler(event.key);
})

function keyDownHandler(key){
    let validKeys = ['w','a','s','d'];
    if(!validKeys.includes(key)){
        return;
    }
    console.log("double u");
    let rect = document.getElementById(key + "Rect");
    rect.style.fill="green";
}

function keyUpHandler(key){
    let validKeys = ['w','a','s','d'];
    if(!validKeys.includes(key)){
        return;
    }
    console.log("double u");
    let rect = document.getElementById(key + "Rect");
    rect.style.fill="yellow";
}