window.addEventListener("load",function(){
let canvas=this.document.getElementById("canvas1");
let ctx=canvas.getContext("2d");
canvas.width=1500;
canvas.height=720;
let enemies=[];
let score=0;
let gameOver=false;
let fullScreenButton=this.document.getElementById("fullScreenButton");
//////////////////////////////
class InputHandler{
    constructor(){
        this.keys=[];
        this.touchY="";
        this.touchTreshold=30;
        window.addEventListener("keydown",(e)=>{
            if((e.key=="ArrowDown"||
               e.key=="ArrowUp"||
               e.key=="ArrowLeft"||
               e.key=="ArrowRight")
            &&this.keys.indexOf(e.key)===-1){
                this.keys.push(e.key);
            }
            else if(e.key=="Enter"&&gameOver){
                restartGame();
            }
        });
        window.addEventListener("keyup",(e)=>{
            if(e.key=="ArrowDown"||
               e.key=="ArrowUp"||
               e.key=="ArrowLeft"||
               e.key=="ArrowRight"){
                this.keys.splice(this.keys.indexOf(e.key),1);
            }
        });
        window.addEventListener("touchstart",e=>{
            this.touchY=e.changedTouches[0].pageY;
        });
        window.addEventListener("touchmove",e=>{
            let swipeDistance=e.changedTouches[0].pageY-this.touchY;
            if(swipeDistance<-this.touchTreshold&&this.keys.indexOf("swipe up")==-1){
                this.keys.push("swipe up");
            }
            else if(swipeDistance>this.touchTreshold&&this.keys.indexOf("swipe down")==-1){
                this.keys.push("swipe down");
                if(gameOver){
                    restartGame();
                }
            }
        });
        window.addEventListener("touchend",e=>{
            this.keys.splice(this.keys.indexOf("swipe up"),1);
            this.keys.splice(this.keys.indexOf("swipe down"),1);
        });
    }
}
//////////////////////////////
class Player{
    constructor(gameWidth,gameHeight){
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.width=200;
        this.height=200;
        this.x=100;
        this.y=this.gameHeight-this.height;
        this.image=playerImage;
        this.frameX=0;
        this.frameY=0;
        this.speed=0;
        this.vy=0;
        this.weight=1;
        this.maxFrame=8;
        this.fps=20;
        this.frameTimer=0;
        this.frameInterval=1000/this.fps;
    }
    draw(context){
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height);
    }
    update(input,deltaTime,enemies){
        //Collision Detection
        enemies.forEach(enemy=>{
            let dx=(enemy.x+enemy.width/2-20)-(this.x+this.width/2);
            let dy=(enemy.y+enemy.height/2)-(this.y+this.height/2+20);
            let distance=Math.sqrt(dx*dx+dy*dy);
            if(distance<(enemy.width/3)+(this.width/3)){
                gameOver=true;
            }
        });
        //Sprite Animations
        if(this.frameTimer>this.frameInterval){
        if(this.frameX>=this.maxFrame){
            this.frameX=0;
        }
        else{
            this.frameX++;
        }
        this.frameTimer=0;
    }
    else{
        this.frameTimer+=deltaTime;
    }
        //Horizontal Movements
        if(input.keys.indexOf("ArrowRight")>-1){
            this.speed=5;
        }
        else if(input.keys.indexOf("ArrowLeft")>-1){
            this.speed=-5;
        }
        this.x+=this.speed;
        if(this.x<0){
            this.x=0;
        }
        else if(this.x>this.gameWidth-this.width){
            this.x=this.gameWidth-this.width;
        }
        //Vertical Movements
        if(((input.keys.indexOf("ArrowUp")>-1)||(input.keys.indexOf("swipe up")>-1))&&this.onGround()){
            this.vy=-32;
        }
        else{
            this.speed=0;
        }
        this.y+=this.vy;
        if(!this.onGround()){
            this.maxFrame=6;
            this.frameX=0;
            this.frameY=1;
            this.vy+=this.weight;
        }
        else{
            this.maxFrame=8;
            this.frameY=0;
            this.vy=0;
            this.y=this.gameHeight-this.height;
        }
    }
    onGround(){
        return this.y>=this.gameHeight-this.height
    }
    restart(){
        this.x=100;
        this.y=this.gameHeight-this.height;
        this.maxFrame=8;
        this.frameY=0;
        this.frameX=0;
    }
}
//////////////////////////////
class Background{
    constructor(gameHeight,gameWidth){
        this.gameHeight=gameHeight;
        this.gameWidth=gameWidth;
        this.x=0;
        this.y=0;
        this.image=backgroundImage;
        this.width=2400;
        this.height=720;
        this.speed=5;
    }
    draw(context){
        context.drawImage(this.image,this.x,this.y);
        context.drawImage(this.image,this.x+this.width-1,this.y);
    }
    update(){
        if(this.x<=-2400){
            this.x=0;
        }
        this.x-=this.speed;
    }
    restart(){
        this.x=0;
    }
}
//////////////////////////////
class Enemy{
    constructor(gameWidth,gameHeight){
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.image=enemyImage;
        this.width=160;
        this.height=119;
        this.x=this.gameWidth;
        this.y=this.gameHeight-this.height;
        this.frameX=0;
        this.speed=8;
        this.maxFrame=5;
        this.fps=20;
        this.frameTimer=0;
        this.frameInterval=1000/this.fps;
        this.markedForDeletion=false;
    }
    draw(context){
        context.drawImage(this.image,this.frameX*this.width,0,this.width,this.height,this.x,this.y,this.width,this.height);
    }
    update(deltaTime){
        if(this.frameTimer>this.frameInterval){
            if(this.frameX>=this.maxFrame){
                this.frameX=0;
            }
            else{
                this.frameX++;
            }
            this.frameTimer=0;
        }
        else{
            this.frameTimer+=deltaTime;
        }
        this.x-=this.speed;
        if(this.x<0-this.width){
            score++;
            this.markedForDeletion=true;
        }
    }
}
//////////////////////////////
function handleEnemies(deltaTime){
    if(enemyTimer>enemyInterval+randomEnemyInterval){
        enemies.push(new Enemy(canvas.width,canvas.height));
        enemyTimer=0;
    }
    else{
        enemyTimer+=deltaTime;
    }
    enemies.forEach((enemy)=>{
        enemy.draw(ctx);
        enemy.update(deltaTime);
    });
    enemies=enemies.filter((object)=>!object.markedForDeletion);
}
//////////////////////////////
function displayStatus(context){
    context.textAlign="start";
    context.fillStyle="black";
    context.font="40px Helvetica";
    context.fillText("Score: "+score,20,50);
    context.fillStyle="white";
    context.fillText("Score: "+score,22,52);
    if(gameOver){
        context.clearRect(0,0,canvas.width,canvas.height);
        context.fillStyle="red";
        context.textAlign="center";
        context.font="50px Helvetica";
        context.fillText("Game Over",canvas.width/2,canvas.height/2);
        context.fillText("Your score is: "+score,canvas.width/2,canvas.height/2+100);
        context.fillText("Press Enter to restart or swipe down",canvas.width/2,canvas.height/2+200);
    }
}
//////////////////////////////
function restartGame(){
    player.restart();
    background.restart();
    enemies=[];
    score=0;
    gameOver=false;
    animate(0);
}
//////////////////////////////
let input = new InputHandler();
let player = new Player(canvas.width,canvas.height);
let background = new Background(canvas.width,canvas.height);
let lastTime=0;
let enemyTimer=0;
let enemyInterval=1000;
let randomEnemyInterval=Math.random()*1000+500;

function animate(timestamp){
    let deltaTime=timestamp-lastTime;
    lastTime=timestamp;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    background.draw(ctx);
    background.update();
    player.draw(ctx);
    player.update(input,deltaTime,enemies);
    handleEnemies(deltaTime);
    displayStatus(ctx);
    if(!gameOver){requestAnimationFrame(animate);}
}
animate(0);
});