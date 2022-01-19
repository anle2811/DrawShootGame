module.exports = function(io){
    io.on('connection', socket=>{
        socket.on('newRoom', nickName=>{
            console.log('Nick Name: '+ nickName);
            newRoom(socket, nickName);
        });
        socket.on('checkRoom', roomInfo=>{
            checkRoom(io, socket, roomInfo);
        });
        socket.on('joinRoom', data=>{
            joinRoom(socket, data);
        })
        socket.on('startTheGame_roomEnemy', data=>{
            socket.broadcast.to(data.socketId).emit('startTheGame_roomEnemy', data.nickName);
        });

        socket.on('myMoveDir', data=>{
            socket.to(data.roomId).emit('enemyMove', data.dir);
        });
    });
};

let roomArr = [];
function newRoom(socket, nickName){
    const roomId = makeid(5);
    const roomInfo = {
        roomId: roomId,
        roomName: nickName,
        socketId: socket.id
    };
    socket.nickname = nickName;
    roomArr.push(roomInfo);
    socket.join(roomId);
    socket.number = 1;

    socket.emit('initGame', {playerNumber: 1, nickName: nickName, roomInfo: roomInfo});
    socket.broadcast.emit('reloadRoomList', roomArr);
}

function checkRoom(io, socket, roomInfo){
    
    let numPlayers = 0;
    try{
        numPlayers = io.sockets.adapter.rooms.get(roomInfo.roomId).size;
    }catch(err){
        socket.emit('wrongRoomId');
        return;
    }
  
    if(numPlayers > 1){
        socket.emit('roomOnPlaying');
        return;
    }

    socket.emit('goToRoom', roomInfo);
}

function joinRoom(socket, data){
    socket.nickname = data.nickName;
    socket.join(data.roomInfo.roomId);
    socket.number = 2;
    for(let a = 0; a < roomArr.length; a++){
        if(roomArr[a].roomId === data.roomInfo.roomId){
            roomArr.splice(a, 1);
            break;
        }
    }
    socket.emit('initGame', {playerNumber: 2, nickName: data.nickName, roomInfo: data.roomInfo});
    socket.to(data.roomInfo.roomId).emit('startTheGame_newEnemy', {nickName: data.nickName, socketId: socket.id});
    socket.broadcast.emit('reloadRoomList', roomArr);
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
