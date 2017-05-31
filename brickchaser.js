
//https://www.smashingmagazine.com/2012/10/design-your-own-mobile-game/
//https://www.w3.org/TR/touch-events/#the-touchmove-event



window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var BRICKCHASER = {
    WIDTH: 320,
    HEIGHT: 480,
    entities: [],

    nextRow: null,    
    gameSpeed: 5,
    bricksPerRow: 8,
    brickWidth: null,
    brickGrid: null,
    numColors: 3,
    score : {
        points: 0,
        moves: 0,
        level: 1,

    },
    

    RATIO: null,
    currentWidth: null,
    currentHeight: null,
    canvas: null,
    ctx: null,
    scale: 1,
    offset: {top:0, left:0},

    init: function(){
        BRICKCHASER.RATIO = BRICKCHASER.WIDTH/BRICKCHASER.HEIGHT;
        BRICKCHASER.currentWidth = BRICKCHASER.WIDTH;
        BRICKCHASER.currentHeight = BRICKCHASER.HEIGHT;
        BRICKCHASER.canvas = document.getElementsByTagName('canvas')[0];

        BRICKCHASER.canvas.width = BRICKCHASER.WIDTH;
        BRICKCHASER.canvas.height = BRICKCHASER.HEIGHT;

        BRICKCHASER.brickWidth = BRICKCHASER.currentWidth/ BRICKCHASER.bricksPerRow;
        BRICKCHASER.nextRow = BRICKCHASER.brickWidth;

        BRICKCHASER.brickGrid = new BRICKCHASER.BrickGrid();

        BRICKCHASER.entities.push(new BRICKCHASER.Score());    
        BRICKCHASER.entities.push(BRICKCHASER.brickGrid);    

        BRICKCHASER.ctx = BRICKCHASER.canvas.getContext('2d');

        BRICKCHASER.resize();

        
  

        window.addEventListener('click',function(e){
                e.preventDefault();
                BRICKCHASER.Input.set(e);
        }, false);

        window.addEventListener('touchstart', function(e){
            e.preventDefault();
            BRICKCHASER.Input.set(e.touches[0]);
        }, false);

        window.addEventListener('touchmove', function(e){
            e.preventDefault();
            BRICKCHASER.Input.moving = true;
        },false);

        window.addEventListener('touchend', function(e){
            e.preventDefault();
            BRICKCHASER.Input.moving = false;
            BRICKCHASER.Input.move(e.touches[0]);
        }, false);

        BRICKCHASER.loop();

    },


    update: function(){

        BRICKCHASER.nextRow-= BRICKCHASER.gameSpeed;
        var i,
        checkCollision = false;
        

        BRICKCHASER.nextRow -= BRICKCHASER.gameSpeed;

        

        
        if(BRICKCHASER.Input.tapped){
            BRICKCHASER.Input.tapped = false;
            checkCollision = true;
            
        }

        for(i = 0; i < BRICKCHASER.entities.length; i++){
            BRICKCHASER.entities[i].update();

            if(BRICKCHASER.entities[i].type === 'brick' && checkCollision){
                hit = BRICKCHASER.collides(BRICKCHASER.entities[i],{x: BRICKCHASER.Input.x, y: BRICKCHASER.Input.y, r:7});
                //BRICKCHASER.entities[i].remove = hit;
                
               
            }

            if(BRICKCHASER.entities[i].remove){
                BRICKCHASER.entities.splice(i,1);
                
            }
        }

   


    },


    render: function() {
        var i;
        BRICKCHASER.Draw.rect(0,0,BRICKCHASER.WIDTH,BRICKCHASER.HEIGHT, '#036');

        for(i = 0; i < BRICKCHASER.entities.length; i++){
            BRICKCHASER.entities[i].render();
        }


    },

    loop: function(){
        requestAnimFrame(BRICKCHASER.loop);
        BRICKCHASER.update();
        BRICKCHASER.render();
    },

    resize: function(){
        BRICKCHASER.currentHeight = window.innerHeight;
        BRICKCHASER.currentWidth = BRICKCHASER.currentHeight * BRICKCHASER.RATIO;

    

        if(BRICKCHASER.android || BRICKCHASER.ios){
            document.body.style.height = (window.innerHeight + 50) + 'px';
        }

        BRICKCHASER.canvas.style.width = BRICKCHASER.currentWidth+'px';
        BRICKCHASER.canvas.style.height = BRICKCHASER.currentHeight+'px';

        window.setTimeout(function() {
                        window.scrollTo(0,1);
        }, 1);
    }

    

};

BRICKCHASER.Draw = {

    clear: function() {
        BRICKCHASER.ctx.clearRect(0,0,BRICKCHASER.WIDTH, BRICKCHASER.HEIGHT);
    },

    rect: function(x,y,w,h,col){
        BRICKCHASER.ctx.beginPath();
        BRICKCHASER.ctx.fillStyle = col;
        BRICKCHASER.ctx.fillRect(x,y,w,h);
        BRICKCHASER.ctx.closePath();
       
    },

    circle: function(x,y,r,col){
        BRICKCHASER.ctx.fillStyle = col;
        BRICKCHASER.ctx.beginPath();
        BRICKCHASER.ctx.arc(x+5, y+5, r, 0, Math.PI*2,true);
        BRICKCHASER.ctx.closePath();
        BRICKCHASER.ctx.fill();
    },

    text: function(string, x, y, size, col){
        BRICKCHASER.ctx.font = 'bold ' + size + 'px Monospace';
        BRICKCHASER.ctx.fillStyle = col;
        BRICKCHASER.ctx.fillText(string, x, y);
    }

};



BRICKCHASER.Touch = function(x,y){
    this.type = 'touch';
    this.x = x;
    this.y = y;
    this.r = 5;
    this.opacity = 1;
    this.fade = 0.05;
    this.remove = false;

    this.update = function(){
        this.opacity -= this.fade;
        this.remove = (this.opacity <0) ? true: false;
        if(this.remove){

        }
    };

    this.render = function(){
        BRICKCHASER.Draw.circle(this.x, this.y, this.r, 'rgba(255,0,0,'+this.opacity+')');
        
    };
},

BRICKCHASER.Particle = function(x, y,r, col) {

    this.x = x;
    this.y = y;
    this.r = r;
    this.col = col;

    this.dir = (Math.random() * 2 > 1) ? 1 : -1;


    this.vx = ~~(Math.random() * 4) * this.dir;
    this.vy = ~~(Math.random() * 7);

    this.remove = false;

    this.update = function() {


        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.99;
        this.vy *= 0.99;


        this.vy -= 0.25;


        if (this.y < 0) {
            this.remove = true;
        }

    };

    this.render = function() {
        BRICKCHASER.Draw.circle(this.x, this.y, this.r, this.col);
    };

};

BRICKCHASER.ColorGenerator = function(){
    this.color;

    this.generateColor = function(){
        switch(Math.floor(Math.random * (BRICKCHASER.numColors-1) * 1)){
        case 1: this.color = "#FA6A00";
            break;
        case 2: this.color = "#FAF200";
            break;
        case 3: this.color = "#91FA00";
            break;
        case 4: this.color = "#00FADA";
            break;
        case 5: this.color = "#003FFA";
            break;
        case 6: this.color = "#AB00FA";
            break;
        case 7: this.color = "#FA00D7";
            break;
        case 8: this.color = "#FA0031";
            break;
        }

        return this.color;
    };

};

BRICKCHASER.Brick = function(x, y, w, col){
    this.x = x;
    this.y = y;
    this.w = w;
    this.col = col;


    this.remove = false;

    this.update = function(){
        this.y-= gameSpeed;
    }

    this.render = function(){
        BRICKCHASER.Draw.rect(this.x, this.y, this.w,this.w,this.col);
    }

},



BRICKCHASER.BrickGrid = function(){
    
    var bricks = [];
    var i;

    var addRow = function(){
        var rowN = [];
        for(i = 0; i < BRICKCHASER.bricksPerRow; i++){
            rowN.push(new BRICKCHASER.Brick(i*BRICKCHASER.brickWidth, 0, BRICKCHASER.brickWidth, BRICKCHASER.ColorGenerator.generateColor()))
        }
    };

    this.update = function(){

        if(BRICKCHASER.nextRow < 0){
            /*add row to grid*/      
            addRow();      
            
        }
        for(i = 0; i < bricks.length; i++){
            for(var j = 0; j < bricks[i].length; j++){
                bricks[i][j].update();
            }
        }
    };

    this.render = function(){
        for(i = 0; i < bricks.length; i++){
            for(var j = 0; j < bricks[i].length; j++){
                bricks[i][j].render();
            }
        }
    }


};

BRICKCHASER.Score = function(){

    this.update = function(){

    
    }


    this.render = function(){
        BRICKCHASER.Draw.text("Score: " + BRICKCHASER.score.points, 10, 10, 12, "red");
        

      
    }

},


BRICKCHASER.collides = function(a,b){
    var distance_squared = (((a.x - b.x) * (a.x-b.x))+((a.y-b.y)*(a.y-b.y)));
    var radii_squared = (a.r + b.r) * (a.r + b.r);

    if(distance_squared < radii_squared){
        return true;
    }else{
        return false;
    }

    

};

BRICKCHASER.Input = {
    x:0,
    y:0,
    dx: 0,
    dy: 0,
    tapped: false,
    moving: false,


    set: function(data){
        var offsetTop = BRICKCHASER.canvas.offsetTop,
        offsetLeft = BRICKCHASER.canvas.offsetLeft;
        scale = BRICKCHASER.currentWidth / BRICKCHASER.WIDTH;

        this.x = ( data.pageX - offsetLeft ) / scale;
        this.y = ( data.pageY - offsetTop ) / scale;
        this.tapped = true;

    },

    move: function(data){
        var offsetTop = BRICKCHASER.canvas.offsetTop,
        offsetLeft = BRICKCHASER.canvas.offsetLeft;
        scale = BRICKCHASER.currentWidth / BRICKCHASER.WIDTH;

        dx = (( data.pageX - offsetLeft ) / scale) - this.x;
        dy = (( data.pageY - offsetTop ) / scale) - this.y;
    }
};


BRICKCHASER.ua = navigator.userAgent.toLowerCase();
BRICKCHASER.android = BRICKCHASER.ua.indexOf('android') > -1 ? true: false;
BRICKCHASER.ios = ( BRICKCHASER.ua.indexOf('iphone') > -1 || BRICKCHASER.ua.indexOf('ipad') > -1  ) ? 
    true : false;

window.addEventListener('load', BRICKCHASER.init, false);
window.addEventListener('resize', BRICKCHASER.resize,false);
