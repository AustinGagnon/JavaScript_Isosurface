let canvas = document.querySelector('#canvas'),
    ctx = canvas.getContext('2d'),
    count = document.querySelector('#count'),
    frameMem = document.querySelector('#frames'),
    colorCode = document.querySelector('#color'),
    screenwidth = screen.width,
    framesBuffer = [],
    ballsBuffer = [],
    sticksBuffer = [],
    minMax = [10000,0],
    minMaxArr = [];



if (screen.width <= 425){
   canvas.width = screen.width;
}
else {
   canvas.width = 300;
}
canvas.height = canvas.width;

const FPS = 60,
      FRAMES = 20,
      MIN_LIGHT = 20,
      width = canvas.width / 2,
      height = canvas.height,
      radius = .20,
      pixelWidth = 2,
      pixelHeight = 2,
      linkLength = 3,
      numBalls = 15,
      numSticks = numBalls - Math.ceil(numBalls / linkLength);

let balls,
    sticks,
    color,
    f = 0,
    minMaxMod = minMax,
    startT;


function init() {
   let balls = [];
   let sticks = [];
   let b = getRandFloor(2,0),
       r = 0;
   if (!b) r = Math.random();
   let color = [r,Math.random()/2+.45,b];
   for (let i = 0; i < numBalls; i++){
      if(i === 0 || i % linkLength === 0){
         balls.push(randomBall(...color))
      }
      else {
         balls.push(randomBall(...color))
         sticks.push(new Stick(balls[i-1].getX(), balls[i-1].getY(), balls[i].getX(), balls[i].getY(), i-1, i));
      }
   }
   return [balls,sticks,color];
}

function getRandFloor(max, min){
   return Math.floor((Math.random() * max) + min)
}


function randomBall(r,g,b) {
   let x = getRandFloor(15, width / 2),
       y = getRandFloor(20, width / 2),
       dx = x + (getRandFloor(3,-1.5)),
       dy = y + (getRandFloor(3,-1.5));
   return new MetaBall(x,y,dx,dy,Math.random()/2+radius,[r,g,b])
}


function isosurfaceCalc(balls) {
   let tempArr = []
   for (let i = 0; i < width; i += pixelWidth){
      for(let j = 0; j < height; j += pixelHeight){
         let r = 0, g = 0, b = 0;
         for (ball of balls){
            let x1 = ball.x - i,
                y1 = ball.y - j,
                dist = Math.sqrt((x1*x1)+(y1*y1));
            if (dist > 100){
               continue;
            }
            let col = (500 * ball.r / dist);
            col *= col*col*col/(dist)
                // col *= col/(2*dist)

            r += (col * ball.col[0])
            g += (col * ball.col[1])
            b += (col * ball.col[2])
         }
         r = Math.floor(r)
         g = Math.floor(g)
         b = Math.floor(b)

         if (r < MIN_LIGHT && g < MIN_LIGHT && b < MIN_LIGHT){
            continue;
         }
         else {
            tempArr.push([r,g,b,i,j]);
         }
      }
   }
   return tempArr;
}

function drawPixels(r,g,b,i,j) {
   ctx.save();
   ctx.fillStyle = `rgb(${r},${g},${b})`;
   ctx.fill()
   ctx.fillRect(i,j, pixelWidth, pixelHeight)
   ctx.restore();
}

drawBalls = (x, y, r)=>{
   ctx.save();
   ctx.fillStyle = 'blue';
   ctx.beginPath();
   ctx.arc(x + width, y, r * 2, 0, Math.PI * 2)
   ctx.fill();
}

drawSticks = (x1, y1, x2, y2)=>{
   ctx.save();
   ctx.strokeStyle = 'red';
   ctx.beginPath();
   ctx.moveTo(x1 + width, y1);
   ctx.lineTo(x2 + width, y2);
   ctx.stroke();
   ctx.restore();
}

function drawMinMax(min, max){
   ctx.save();
   ctx.strokeStyle = 'red';
   ctx.beginPath();
   ctx.moveTo(0, min);
   ctx.lineTo(width, min);
   ctx.stroke();


   ctx.beginPath();
   ctx.strokeStyle = 'green';
   ctx.moveTo(0, max);
   ctx.lineTo(width, max);
   ctx.stroke();

   ctx.restore();
}


function run() {
   let objects = init();
   startT = new Date().getTime();
   balls = objects[0];
   sticks = objects[1];
   color = objects[2];
   minMaxMod = minMax;
   for (var i = 0; i < FRAMES; i++) {
      for (ball of balls){
         ball.update();
         let y = ball.getY();
         if (y < minMaxMod[0]) minMaxMod[0] = y;
         else if (y > minMaxMod[1]) minMaxMod[1] = y;
         ballsBuffer.push(ball.save());
      }
      for (stick of sticks){
         stick.update(balls);
         stick.update(balls);
         stick.update(balls);
         sticksBuffer.push(stick.save());
      }
      framesBuffer.push(isosurfaceCalc(balls));
      // minMaxArr.push(minMaxMod);
   }
   animate();
}

function backgroundRun() {
   //Begin Loop
   let tempFramesArr = [],
       tempMinMaxArr = [],
   minMaxMod = minMax;
   for (var i = 0; i < 10; i++) {
      for (ball of balls){
         ball.update();
         // let y = ball.getY();
         // if (y < minMaxMod[0]) minMaxMod[0] = y;
         // else if (y > minMaxMod[1]) minMaxMod[1] = y;
         ballsBuffer.push(ball.save());
      }
      for (stick of sticks){
         stick.update(balls);
         stick.update(balls);
         stick.update(balls);
         sticksBuffer.push(stick.save())
      }
      tempFramesArr.push(isosurfaceCalc(balls));
      // tempMinMaxArr.push(minMaxMod);

   }
   // minMaxArr = minMaxArr.concat(tempMinMaxArr);
   return tempFramesArr;
}

function animate() {

   let temp,
       mem;

   if (framesBuffer.length %10 > 0){
      temp = framesBuffer.shift();

   } else {
      temp = framesBuffer. shift();
      mem = new Promise(function(res, rej) {
         res(backgroundRun())
      });

      mem.then((f)=>{
         framesBuffer = framesBuffer.concat(f);
      })
   }
   ctx.clearRect(0,0,width*2,height)
   ctx.save()
   ctx.fillStyle = `rgb(${color[0] * 10},${color[1] * 10},${color[2] * 10})`
   // ctx.fillRect(0,0,width + 2,height);
   ctx.restore();
   for (t of temp){
      drawPixels(...t);
   }
   for (let i = 0; i < numBalls; i++){
      let temp = ballsBuffer.shift();
      drawBalls(...temp);
   }
   for (let i = 0; i < numSticks; i++){
      let temp = sticksBuffer.shift();
      drawSticks(...temp);
   }
   // console.log(minMaxArr[0]);
   // drawMinMax(...minMaxArr.shift())
   let currentT = new Date().getTime(),
       duration = (currentT - startT) / 1000
   count.innerHTML = `Frames displayed: ${++f}`
   frameMem.innerHTML = `Frames in queue: ${framesBuffer.length}`
   colorCode.innerHTML = `FPS: ${Math.round(f / duration)}`
   // colorCode.innerHTML = `Color: R: ${color[0].toFixed(1)}   G: ${color[1].toFixed(1)}   B: ${color[2].toFixed(1)}`

   window.requestAnimationFrame(animate)
}

function reset() {
   f = 0;
   framesBuffer = [];
   run();
}

run();
