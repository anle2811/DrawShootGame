const { Line, Player, Tank } = require('/models/GamePlay');
const gamePlay = require('/models/GamePlay');

const canvas = document.getElementById('mainLayer');
const context = canvas.getContext('2d');
const mainDiv = document.getElementById('mainDiv');
canvas.width = mainDiv.clientWidth;
canvas.height = mainDiv.clientHeight;
context.fillStyle = 'snow';
context.fillRect(0, 0, canvas.width, canvas.height);

const drawingArea = document.getElementById('drawingArea');
drawingArea.width = window.innerWidth;
drawingArea.height = window.innerHeight/4;
drawingArea.style.top = (window.innerHeight/4 + drawingArea.height/2)+'px';
drawingArea.style.position = 'absolute';

const paintLayer = document.getElementById('paintLayer');
const paintLayerCtx = paintLayer.getContext('2d');
paintLayer.width = drawingArea.width;
paintLayer.height = drawingArea.height;
paintLayer.style.border = 'thin solid cyan';
paintLayer.style.position = 'absolute';

const picFrame = document.getElementById('picFrame');
const picFrameCtx = picFrame.getContext('2d');
picFrame.width = 0;
picFrame.height = 0;
picFrame.style.position = 'absolute';

const doneBtn = document.getElementById('paintDone');
doneBtn.style.top = (window.innerHeight/4 + paintLayer.height + paintLayer.height/2)+'px';
doneBtn.style.position = 'absolute';

const players = {
    mySelf: new Player('Anlele', new Tank(canvas.width/2 - 25, canvas.height - 50, 50, 'red')),
    enemy: new Player('Abc', new Tank(canvas.width/2 - 25, 0, 50, 'blue'))
};
function initTheGame(){
    
}

let firePicFrame = false;
let picFrameTop = -(drawingArea.offsetTop * 2);
function paintDone(){
    if(firePicFrame){
        picFrameTop = picFrame.offsetTop;
        firePicFrame = false;
    }else{
        drawPicFrame();
        repaintToPicFrame();
        picFrame.style.top = (paintLayer.height - picFrame.height) + 'px';
        doneBtn.innerText = 'FIRE';
        firePicFrame = true;
    }
}

function firePic(){
    if(picFrameTop > drawingArea.offsetTop * -1){
        picFrame.style.border = 'none';
        picFrame.style.top = picFrameTop + 'px';
        picFrameTop -= 2;
    }
    requestAnimationFrame(firePic);
}
firePic();

let picFrameDragable = false;
let picFrameXTouch = 0;
picFrame.addEventListener('mousedown', e =>{
    picFrameDragable = true;
    picFrameXTouch = e.offsetX;
}, false);
picFrame.addEventListener('mousemove', e =>{
    if(picFrameDragable){
        const xChange = picFrame.offsetLeft + ((picFrame.offsetLeft + e.offsetX) - (picFrame.offsetLeft + picFrameXTouch));
        picFrame.style.left = xChange + 'px';
    }
}, false);

picFrame.addEventListener('touchmove', e =>{
    e.preventDefault();
    picFrame.style.left = (e.changedTouches[0].pageX - picFrame.width/2) + 'px';
}, false);

const mouseCoor = {
    x: 0,
    y: 0
}
let isDrawing = false;

paintLayer.addEventListener('mousedown', event =>{
    isDrawing = true;
    mouseCoor.x = event.offsetX;
    mouseCoor.y = event.offsetY;
    const newLine = new Line(mouseCoor.x, mouseCoor.y, paintLayerCtx);
    players.mySelf.lineArr.push(newLine);
    newLine.draw();
}, false);
paintLayer.addEventListener('mousemove', event =>{
    if(isDrawing){
        mouseCoor.x = event.offsetX;
        mouseCoor.y = event.offsetY;
        const newLine = new Line(mouseCoor.x, mouseCoor.y, paintLayerCtx);
        players.mySelf.lineArr.push(newLine);
        newLine.draw();
    }
}, false);
window.addEventListener('mouseup', event =>{
    isDrawing = false;
    picFrameDragable = false;
    mouseCoor.x = 0;
    mouseCoor.y = 0;
}, false);
/////
paintLayer.addEventListener('touchstart', event =>{
    event.preventDefault();
    mouseCoor.x = event.touches[0].clientX;
    mouseCoor.y = event.touches[0].clientY - drawingArea.offsetTop;
    const newLine = new Line(mouseCoor.x, mouseCoor.y, paintLayerCtx);
    players.mySelf.lineArr.push(newLine);
    newLine.draw();
}, false);
paintLayer.addEventListener('touchmove', event =>{
    event.preventDefault();
    mouseCoor.x = event.touches[0].clientX ;
    mouseCoor.y = event.touches[0].clientY - drawingArea.offsetTop;
    const newLine = new Line(mouseCoor.x, mouseCoor.y, paintLayerCtx);
    players.mySelf.lineArr.push(newLine);
    newLine.draw();
}, false);
paintLayer.addEventListener('touchend', e =>{
    isDrawing = false;
    mouseCoor.x = 0;
    mouseCoor.y = 0;
}, false);

function paintLayerFindMaxY(){
    let biggest = 0;
    const lineArrLength = players.mySelf.lineArr.length > 1 ? players.mySelf.lineArr.length - 1 : players.mySelf.lineArr.length;
    for(let a = 0; a < lineArrLength; a++){
        let biggestArr = [];
        for(let b = 0; b < players.mySelf.lineArr[a].pixelArr.length; b++){         
            if(players.mySelf.lineArr.length == 1){
                biggestArr.push(players.mySelf.lineArr[a].pixelArr[b].y);
            }else{
                if(players.mySelf.lineArr[a].pixelArr[b].y >= players.mySelf.lineArr[a+1].pixelArr[b].y){
                    biggestArr.push(players.mySelf.lineArr[a].pixelArr[b].y);
                }else{
                    biggestArr.push(players.mySelf.lineArr[a+1].pixelArr[b].y);
                }
            }  
        }
        if(biggest <= Math.max(...biggestArr)){
            biggest = Math.max(...biggestArr);
        } 
    }
    return biggest;
}

function paintLayerFindMinY(){
    let smallest = paintLayer.height * 2;
    const lineArrLength = players.mySelf.lineArr.length > 1 ? players.mySelf.lineArr.length - 1 : players.mySelf.lineArr.length;
    for(let a = 0; a < lineArrLength; a++){
        let smallestArr = [];
        for(let b = 0; b < players.mySelf.lineArr[a].pixelArr.length; b++){         
            if(players.mySelf.lineArr.length == 1){
                smallestArr.push(players.mySelf.lineArr[a].pixelArr[b].y);
            }else{
                if(players.mySelf.lineArr[a].pixelArr[b].y <= players.mySelf.lineArr[a+1].pixelArr[b].y){
                    smallestArr.push(players.mySelf.lineArr[a].pixelArr[b].y);
                }else{
                    smallestArr.push(players.mySelf.lineArr[a+1].pixelArr[b].y);
                }
            }  
        }
        if(smallest >= Math.min(...smallestArr)){
            smallest = Math.min(...smallestArr);
        } 
    }
    return smallest;
}

function paintLayerFindMaxX(){
    let biggest = players.mySelf.lineArr[0].x;
    const lineArrLength = players.mySelf.lineArr.length > 1 ? players.mySelf.lineArr.length - 1 : players.mySelf.lineArr.length;
    if(players.mySelf.lineArr.length == 1){
        return biggest;
    }else{
        for(let a = 0; a < lineArrLength; a++){
            if(biggest <= players.mySelf.lineArr[a+1].x){
                biggest = players.mySelf.lineArr[a+1].x;
            }
        }
    }
    return biggest;
}

function paintLayerFindMinX(){
    let smallest = players.mySelf.lineArr[0].x;
    const lineArrLength = players.mySelf.lineArr.length > 1 ? players.mySelf.lineArr.length - 1 : players.mySelf.lineArr.length;
    if(players.mySelf.lineArr.length == 1){
        return smallest;
    }else{
        for(let a = 0; a < lineArrLength; a++){
            if(smallest >= players.mySelf.lineArr[a+1].x){
                smallest = players.mySelf.lineArr[a+1].x;
            }
        }
    }
    return smallest;
}

function repaintToPicFrame(){
    paintLayerCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    for(let a = 0; a < players.mySelf.lineArr.length; a++){
        players.mySelf.lineArr[a].x = players.mySelf.lineArr[a].x - picFrame.offsetLeft;
        players.mySelf.lineArr[a].y = players.mySelf.lineArr[a].y - picFrame.offsetTop;
        players.mySelf.lineArr[a].ctx = picFrameCtx;
        players.mySelf.lineArr[a].selfDraw();
        for(let b = 0; b < players.mySelf.lineArr[a].pixelArr.length; b++){
            players.mySelf.lineArr[a].pixelArr[b].x = players.mySelf.lineArr[a].pixelArr[b].x - picFrame.offsetLeft;
            players.mySelf.lineArr[a].pixelArr[b].y = players.mySelf.lineArr[a].pixelArr[b].y - picFrame.offsetTop;
            players.mySelf.lineArr[a].pixelArr[b].ctx = picFrameCtx;
            players.mySelf.lineArr[a].pixelArr[b].draw();
        }
    }
}

function drawPicFrame(){
    const x = paintLayerFindMinX() - gamePlay.PEN_PIXEL_SIZE;
    const y = paintLayerFindMinY() - gamePlay.PEN_PIXEL_SIZE;
    const width = paintLayerFindMaxX() - x + gamePlay.PEN_PIXEL_SIZE;
    const height = paintLayerFindMaxY() - y + gamePlay.PEN_PIXEL_SIZE;

    picFrame.width = width;
    picFrame.height = height;
    picFrame.style.border = 'thin solid yellow'
    picFrame.style.top = y + 'px';
    picFrame.style.left = x + 'px';
}

///Not using
function pullRightPlace(){
    let biggest = 0;
    const lineArrLength = lineArr.length > 1 ? lineArr.length - 1 : lineArr.length;
    console.log('LineLength: ' + lineArrLength);
    for(let a = 0; a < lineArrLength; a++){
        let biggestArr = [];
        for(let b = 0; b < lineArr[a].pixelArr.length; b++){
            if(lineArr[a].pixelArr[b].y + lineArr[a].pixelArr[b].size >= paintLayer.height){
                console.log('Farthest: ' + lineArr[a].pixelArr[b].y);
            }else{
                if(lineArr.length == 1){
                    biggestArr.push(lineArr[a].pixelArr[b].y);
                }else{
                    if(lineArr[a].pixelArr[b].y >= lineArr[a+1].pixelArr[b].y){
                        biggestArr.push(lineArr[a].pixelArr[b].y);
                    }else{
                        biggestArr.push(lineArr[a+1].pixelArr[b].y);
                    }
                }   
            }
        }
        if(biggest <= Math.max(...biggestArr)){
            biggest = Math.max(...biggestArr);
        } 
    }
    console.log(biggest);
    biggest += 5;
    while(biggest < paintLayer.height){
        paintLayerCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
        paintLayerCtx.fillStyle = 'orange';
        paintLayerCtx.fillRect(0, 0, paintLayer.width, paintLayer.height);
        for(let i = 0; i < lineArr.length; i++){
            lineArr[i].increaseY(1);
            for(let k = 0; k < lineArr[i].pixelArr.length; k++){
                lineArr[i].pixelArr[k].increaseY(1);
            }
        }
        biggest += 1;
    }
}///

const moveUpBtn = document.getElementById('moveUp');
const moveUpBtn1 = document.getElementById('moveUp1');
const moveLeftBtn = document.getElementById('moveLeft');
const moveRightBtn = document.getElementById('moveRight');
const moveDownBtn = document.getElementById('moveDown');
const moveDownBtn1 = document.getElementById('moveDown1');
let timer;
const holdDur = 400;
let isHold = false;
let playerDirs = {
    up: 'up',
    left: 'left',
    right: 'right',
    down: 'down',
    none: 'none'
};
let playerDir = playerDirs.none;
moveUpBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.up;
        isHold = true;
    }, holdDur);
}, false);
moveUpBtn.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveUp);
}, false);
moveUpBtn1.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.up;
        isHold = true;
    }, holdDur);
}, false);
moveUpBtn1.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveUp);
}, false);
////
moveLeftBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.left;
        isHold = true;
    }, holdDur);
}, false);
moveLeftBtn.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveLeft);
}, false);
////
moveRightBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.right;
        isHold = true;
    }, holdDur);
}, false);
moveRightBtn.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveRight);
}, false);
////
moveDownBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.down;
        isHold = true;
    }, holdDur);
}, false);
moveDownBtn.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveDown);
}, false);
moveDownBtn1.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.down;
        isHold = true;
    }, holdDur);
}, false);
moveDownBtn1.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveDown);
}, false);

function endHoldDir(dir, moveDir){
    if(isHold){
        playerDir = dir;
    }else{
        moveDir();
    }
    isHold = false;
    clearTimeout(timer);
}

function playerMove(x, y, preX, preY){
    players.mySelf.tank.x += x;
    players.mySelf.tank.y += y;
    context.clearRect(preX, preY, 50, 50);
    context.fillStyle = 'snow';
    context.fillRect(preX, preY, 50, 50);
}

const prePlayerPos = {
    x: canvas.width/2 - 25,
    y: canvas.height - 50
};
function moveUp(){
    playerMove(0, -10, prePlayerPos.x, prePlayerPos.y);
}
function moveLeft(){
    playerMove(-10, 0, prePlayerPos.x, prePlayerPos.y);
}
function moveRight(){
    playerMove(10, 0, prePlayerPos.x, prePlayerPos.y);
}
function moveDown(){
    playerMove(0, 10, prePlayerPos.x, prePlayerPos.y);
}

function drawPlayer(){
    switch(playerDir){
        case playerDirs.up:
            playerMove(0, -2, prePlayerPos.x, prePlayerPos.y);
            break;
        case playerDirs.left:
            playerMove(-2, 0, prePlayerPos.x, prePlayerPos.y);
            break;
        case playerDirs.right:
            playerMove(2, 0, prePlayerPos.x, prePlayerPos.y);
            break;
        case playerDirs.down:
            playerMove(0, 2, prePlayerPos.x, prePlayerPos.y);
            break;    
        default: break;
    }
    players.mySelf.tank.draw();
    prePlayerPos.x = players.mySelf.tank.x;
    prePlayerPos.y = players.mySelf.tank.y;
    requestAnimationFrame(drawPlayer);
}

drawPlayer();

function shoot(){
    players.mySelf.tank.shoot(players.mySelf.tank.x, players.mySelf.tank.y - 20);
}

function shooting(){
    context.fillStyle = 'rgba(0,0,0,.05)';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = 'brown';
    context.fillRect(0,0,canvas.width,canvas.height/2);
    //context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    players.mySelf.tank.draw();
    players.mySelf.tank.bulletArr.forEach((bullet) => {
        bullet.update();
    })
    requestAnimationFrame(shooting);
}

shooting();
