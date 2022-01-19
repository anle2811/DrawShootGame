const LINE_SIZE = 3;
const PEN_PIXEL_SIZE = 4;
const BULLET_SPEED = 3;

class LinePixel{
    constructor(x, y, size, ctx){
        this.x = x;
        this.y = y;
        this.size = size;
        this.ctx = ctx;
    }
    draw(){
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }
    increaseY(n){
        this.y += n;
        this.draw();
    }
}

class Line{
    constructor(x, y, ctx){
        this.x = x;
        this.y = y;
        this.pixelSize = PEN_PIXEL_SIZE;
        this.size = LINE_SIZE;
        this.pixelArr = [];
        this.ctx = ctx;
    }
    selfDraw(){
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.pixelSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }
    draw(){
        this.selfDraw();
        this.pixelArr = [];
        if(this.size % 2 == 0){
            for(let i = 0; i <= 1; i++){
                let posNega = this.pixelSize*2;
                if(i==1){
                    posNega = -this.pixelSize*2;
                }
                for(let k = 0; k < ((this.size/2) - i); k++){
                    const newPixel = new LinePixel(this.x, this.y + (k * posNega) + posNega, this.pixelSize, this.ctx);
                    this.pixelArr.push(newPixel);
                    newPixel.draw();
                }
            }
        }else{
            for(let i = 0; i <= 1; i++){
                let posNega = this.pixelSize*2;
                if(i==1){
                    posNega = -this.pixelSize*2;
                }
                for(let k = 0; k < Math.floor(this.size/2); k++){
                    const newPixel = new LinePixel(this.x, this.y + (k * posNega) + posNega, this.pixelSize, this.ctx);
                    this.pixelArr.push(newPixel);
                    newPixel.draw();
                }
            }
        }
    }

    increaseY(n){
        this.y += n;
        this.selfDraw();
    }
}

class Bullet{
    constructor(x, y, velocityX, velocityY, speed, ctx){
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.speed = speed;
        this.ctx = ctx;
    }

    draw(){
        this.ctx.fillStyle = 'pink';
        this.ctx.fillRect(this.x, this.y, 10, 10);
    }
    
    update(){
        this.draw();
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
}

class Tank{
    constructor(nickName, x, y, size, color, ctx){
        this.nickName = nickName;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.bulletArr = [];
        this.ctx = ctx;
    }
    draw(){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.size, this.size);
        this.ctx.font = '20px Comic Sans MS';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.nickName, this.x + this.size/2, this.y + this.size);
    }
    shoot(x, y){
        const angle = Math.atan2(y - this.y, x - this.x);
        const bx = Math.cos(angle);
        const by = Math.sin(angle);
        this.bulletArr.push(new Bullet(this.x + 20, this.y, bx, by, BULLET_SPEED, this.ctx));
    }
}

class Player{
    constructor(tank){
        this.tank = tank;
        this.lineArr = [];
    }
}

export { Line, Player, Tank, PEN_PIXEL_SIZE };
