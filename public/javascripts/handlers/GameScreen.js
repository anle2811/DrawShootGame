
import { Line, LinePixel, Player, Tank, PEN_PIXEL_SIZE } from '../models/GamePlay.js';
const socket = io();
let playerNum = 0;
let roomId = '';
let myName = 'NULL';
console.log('HEHE: '+ initInfo.action);
if(initInfo.action === 'newRoom'){
    console.log('NEW ROOM');
    socket.emit('newRoom', initInfo.nickName);
}else{
    if(initInfo.action === 'joinRoom'){
        console.log('JOIN ROOM: ');
        socket.emit('joinRoom', {nickName: initInfo.nickName, roomInfo: initInfo.roomInfo});
    }
}

const canvas = document.getElementById('mainLayer');
const context = canvas.getContext('2d');
const mainDiv = document.getElementById('mainDiv');
canvas.width = mainDiv.clientWidth;
canvas.height = mainDiv.clientHeight;
context.fillStyle = 'snow';
context.fillRect(0, 0, canvas.width, canvas.height);

const controlArea = document.getElementById('controlArea');

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

const enemyPicFrame = document.getElementById('enemyPicFrame');
const enemyPicFrameCtx = enemyPicFrame.getContext('2d');
enemyPicFrame.width = 0;
enemyPicFrame.height = 0;
enemyPicFrame.style.position = 'absolute';

const doneBtn = document.getElementById('paintDone');
doneBtn.style.top = (window.innerHeight/4 + paintLayer.height + paintLayer.height/2)+'px';
doneBtn.style.position = 'absolute';

const players = {
    mySelf: new Player(new Tank(myName, canvas.width/2 - 25, canvas.height - 50, 50, 'red', context)),
    enemy: null
};

socket.on('initGame', data=>{
    playerNum = data.playerNumber;
    myName = data.nickName;
    players.mySelf.tank.nickName = data.nickName;
    roomId = data.roomInfo.roomId;
});

socket.on('startTheGame_roomEnemy', nickName=>{
    console.log('startTheGame_roomEnemy');
    players.enemy = new Player(new Tank(nickName, canvas.width/2 - 25, 0, 50, 'red', context));
    players.mySelf.tank.color = 'blue';
})

socket.on('startTheGame_newEnemy', data=>{
    console.log('startTheGame_newEnemy');
    players.enemy = new Player(new Tank(data.nickName, canvas.width/2 - 25, 0, 50, 'blue', context));
    socket.emit('startTheGame_roomEnemy', {nickName: myName, socketId: data.socketId});
});


let firePicFrame = false;
let picFrameTop = -(drawingArea.offsetTop * 2);
let enemyPicFrameTop = canvas.height;
const picFrameBound = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};
doneBtn.addEventListener('click', e=>{
    paintDone();
}, false);
function paintDone(){
    if(firePicFrame){
        socket.emit('firePicFrame', {roomId: roomId, lineArr: players.mySelf.lineArr, picFrameBound: picFrameBound, picFrameOffsetX: picFrame.offsetLeft});
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

socket.on('fireEnemyPicFrame', data=>{
    drawEnemyPicFrame(data.picFrameBound);
    for(let a = 0; a < data.lineArr.length; a++){
        const distanceA = enemyPicFrame.height - data.lineArr[a].y;
        players.enemy.lineArr.push(new Line(data.lineArr[a].x, distanceA, enemyPicFrameCtx));
        players.enemy.lineArr[a].selfDraw();
        for(let b = 0; b < data.lineArr[a].pixelArr.length; b++){
            const distanceB = enemyPicFrame.height - data.lineArr[a].pixelArr[b].y;
            players.enemy.lineArr[a].pixelArr.push(new LinePixel(data.lineArr[a].pixelArr[b].x, distanceB, PEN_PIXEL_SIZE, enemyPicFrameCtx));
            players.enemy.lineArr[a].pixelArr[b].draw();
        }
    }
    enemyPicFrame.style.left = data.picFrameOffsetX + 'px';
    enemyPicFrame.style.top = -(controlArea.offsetHeight) + 'px';
    enemyPicFrameTop =  -(controlArea.offsetHeight);
});

function firePic(){
    if(picFrameTop > drawingArea.offsetTop * -1){
        picFrame.style.border = 'none';
        picFrame.style.top = picFrameTop + 'px';
        picFrameTop -= 2;
    }
    requestAnimationFrame(firePic);
}
firePic();
///////////////
function fireEnemyPic(){
    if(enemyPicFrameTop < (canvas.height - drawingArea.offsetTop)){
        enemyPicFrame.style.top = enemyPicFrameTop + 'px';
        enemyPicFrameTop += 2;
    }
    requestAnimationFrame(fireEnemyPic);
}
fireEnemyPic();

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

/*function repaintPicFrame(){
    picFrameCtx.clearRect(0, 0, picFrame.width, picFrame.height);
    for(let a = 0; a < players.mySelf.lineArr.length; a++){
        players.mySelf.lineArr[a].selfDraw();
        for(let b = 0; b < players.mySelf.lineArr[a].pixelArr.length; b++){
            players.mySelf.lineArr[a].pixelArr[b].draw();
        }
    }
}*/

function drawPicFrame(){
    const x = paintLayerFindMinX() - PEN_PIXEL_SIZE;
    const y = paintLayerFindMinY() - PEN_PIXEL_SIZE;
    const width = paintLayerFindMaxX() - x + PEN_PIXEL_SIZE;
    const height = paintLayerFindMaxY() - y + PEN_PIXEL_SIZE;
    picFrameBound.x = x;
    picFrameBound.y = y;
    picFrameBound.width = width;
    picFrameBound.height = height;
    picFrame.width = width;
    picFrame.height = height;
    picFrame.style.border = 'thin solid yellow'
    picFrame.style.top = y + 'px';
    picFrame.style.left = x + 'px';
}

function drawEnemyPicFrame(picFrameBound){
    enemyPicFrame.width = picFrameBound.width;
    enemyPicFrame.height = picFrameBound.height;
    enemyPicFrame.style.top = picFrameBound.y + 'px';
    enemyPicFrame.style.left = picFrameBound.x + 'px';
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

const attackBtn = document.getElementById('attack');
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
let enemyDir = playerDirs.none;
moveUpBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        socket.emit('enemyHoldDir', {roomId: roomId, dir: playerDirs.up});
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
        socket.emit('enemyHoldDir', {roomId: roomId, dir: playerDirs.up});
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
        socket.emit('enemyHoldDir', {roomId: roomId, dir: playerDirs.left});
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
        socket.emit('enemyHoldDir', {roomId: roomId, dir: playerDirs.right});
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
        socket.emit('enemyHoldDir', {roomId: roomId, dir: playerDirs.down});
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
        socket.emit('enemyHoldDir', {roomId: roomId, dir: playerDirs.down});
        playerDir = playerDirs.down;
        isHold = true;
    }, holdDur);
}, false);
moveDownBtn1.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveDown);
}, false);

function endHoldDir(dir, moveDir){
    if(isHold){
        socket.emit('enemyHoldDir', {roomId: roomId, dir: dir});
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

function enemyMove(x, y, preX, preY){
    players.enemy.tank.x += x;
    players.enemy.tank.y += y;
    context.clearRect(preX, preY, 50, 50);
    context.fillStyle = 'snow';
    context.fillRect(preX, preY, 50, 50);
}

const prePlayerPos = {
    x: canvas.width/2 - 25,
    y: canvas.height - 50
};
const preEnemyPos = {
    x: canvas.width/2 - 25,
    y: 0
}

function moveUp(){
    playerMove(0, -10, prePlayerPos.x, prePlayerPos.y);
    socket.emit('myMoveDir', {roomId: roomId, dir: playerDirs.up});
}
function moveLeft(){
    playerMove(-10, 0, prePlayerPos.x, prePlayerPos.y);
    socket.emit('myMoveDir', {roomId: roomId, dir: playerDirs.left});
}
function moveRight(){
    playerMove(10, 0, prePlayerPos.x, prePlayerPos.y);
    socket.emit('myMoveDir', {roomId: roomId, dir: playerDirs.right});
}
function moveDown(){
    playerMove(0, 10, prePlayerPos.x, prePlayerPos.y);
    socket.emit('myMoveDir', {roomId: roomId, dir: playerDirs.down});
}

socket.on('enemyMove', dir=>{
    switch(dir){
        case playerDirs.up:
            enemyMove(0, 10, preEnemyPos.x, preEnemyPos.y);
            break;
        case playerDirs.left:
            enemyMove(-10, 0, preEnemyPos.x, preEnemyPos.y);
            break;
        case playerDirs.right:
            enemyMove(10, 0, preEnemyPos.x, preEnemyPos.y);
            break;
        case playerDirs.down:
            enemyMove(0, -10, preEnemyPos.x, preEnemyPos.y);
            break;
        default: break;
    }
});

socket.on('enemyHoldMove', dir=>{
    enemyDir = dir;
});

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

function drawEnemy(){
    if(players.enemy !== null){
        switch(enemyDir){
            case playerDirs.up:
                enemyMove(0, 2, prePlayerPos.x, prePlayerPos.y);
                break;
            case playerDirs.left:
                enemyMove(-2, 0, prePlayerPos.x, prePlayerPos.y);
                break;
            case playerDirs.right:
                enemyMove(2, 0, prePlayerPos.x, prePlayerPos.y);
                break;
            case playerDirs.down:
                enemyMove(0, -2, prePlayerPos.x, prePlayerPos.y);
                break;    
            default: break;
        }
        players.enemy.tank.draw();
        preEnemyPos.x = players.enemy.tank.x;
        preEnemyPos.y = players.enemy.tank.y;
    }
    requestAnimationFrame(drawEnemy);
}

drawEnemy();

socket.on('enemyShoot', function(){
    players.enemy.tank.shoot(players.enemy.tank.x, players.enemy.tank.y + 20);
});

attackBtn.addEventListener('click', e=>{
    socket.emit('myShoot', roomId);
    players.mySelf.tank.shoot(players.mySelf.tank.x, players.mySelf.tank.y - 20);
}, false);

function shooting(){
    context.fillStyle = 'rgba(0,0,0,.05)';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    players.mySelf.tank.draw();
    players.mySelf.tank.bulletArr.forEach((bullet) => {
        bullet.update();
    })
    requestAnimationFrame(shooting);
}
shooting();

function enemyShooting(){
    if(players.enemy !== null){
        context.fillStyle = 'rgba(0,0,0,.05)';
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        players.enemy.tank.draw();
        players.enemy.tank.bulletArr.forEach((bullet) => {
            bullet.update();
        })
    }
    requestAnimationFrame(enemyShooting);
}
enemyShooting();
