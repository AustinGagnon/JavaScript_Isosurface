const canvas = document.querySelector('#canvas'),
      ctx = canvas.getContext('2d'),
      count = document.querySelector('#count'),
      fps = document.querySelector('#frames'),
      WIDTH = 300,
      HEIGHT = WIDTH * 2,
      MIN_LIGHT = 5,
      FRAMES = 40,
      // PARTICLE & PIXEL SETTINGS
      NUM_OF_PARTICLES = 6,
      PIXEL_HEIGHT = 2,
      PIXEL_WIDTH = 2,
      PIXEL_RADIUS = .51,
      CHAIN_LENGTH = 3,
      VELOCITY_RNG = 5,
      // VERLET STICK SETTINGS
      PARTICLE_DISTANCE_LOW = 10,
      PARTICLE_DISTANCE_HIGH = 75,
      // CONSTANT ARRAYS & CALCULATED FIELD
      particles = [],
      sticks = [],
      fpsFrameCount = [],
      fpsTime = [],
      numOfSticks = NUM_OF_PARTICLES - Math.ceil(NUM_OF_PARTICLES / CHAIN_LENGTH);


let   particleBuf = [],
      stickBuf = [],
      frameBuf = [],
      frameCount = 0;


function init() {
   canvas.width = WIDTH;
   canvas.height = HEIGHT;

   for (var i = 0; i < NUM_OF_PARTICLES; i++) {
      let pData = randParticleData();
      // console.log(pData);
      particles.push(new VerletParticle(...pData));
      // console.log(i != 0 && i % CHAIN_LENGTH === 0);
      if (i != 0 && i % CHAIN_LENGTH != 0){
         //NEW STICK METHOD
         let sData = formatStickData(i);
         console.log(sData);
         sticks.push(new VerletStick(...sData));
      }
   }
   loadBuffers();
   animate();
}


function loadBuffers() {
   let tempPBuf = [],
       tempSBuf = [];
       tempFBuf = [];

   for (var i = 0; i < FRAMES; i++) {
      for (p of particles){
         p.update();
      }

      for (s of sticks){
         s.update(particles);
         s.update(particles);
         s.update(particles);
         tempSBuf.push(s.saveState());
      }
      for (p of particles){
         tempPBuf.push(p.saveState());
      }
      tempFBuf.push(newIsosurface());
   }
   particleBuf = particleBuf.concat(tempPBuf);
   stickBuf = stickBuf.concat(tempSBuf);
   frameBuf = frameBuf.concat(tempFBuf);
}

function pMaxHeight() {
   let max = particles[0].getY();
   for (var i = 1; i < particles.length; i++) {
      let p = particles[i];
      if (p.getY() > max){
         max = p.getY();
      }
   }
   return max;
}

function pMinHeight() {
   let min = particles[0].getY();
   for (var i = 1; i < particles.length; i++) {
      let p = particles[i];
      if (p.getY() < min){
         min = p.getY();
      }
   }
   return min;
}


function animate() {
   frameCount++;
   ctx.clearRect(0,0,WIDTH,HEIGHT);
   ctx.fillStyle = 'black';
   ctx.fillRect(0,0,WIDTH,HEIGHT);

   // console.log(particleBuf.length, stickBuf.length);
   if (frameBuf.length === 10){
   // if (particleBuf.length === 10 * NUM_OF_PARTICLES){
      let buffer = new Promise(function(resolve, reject) {
         loadBuffers();
         resolve();
      });
   }

   // renderParticles();
   // renderSticks();
   renderIsoPixels();
   count.innerHTML = `Frame count: ${frameCount}`
   fpsCalc(frameCount);
   window.requestAnimationFrame(animate)
}

function fpsCalc(frame) {
   if (fpsFrameCount.length === 0){
      console.log('here');
      fpsFrameCount.push(frame);
      fpsTime.push(new Date().getTime())
   }


   // console.log(frame - fpsFrameCount[0] === 10);
   if (frame - fpsFrameCount[0] === 20){
      fpsFrameCount.push(frame);
      fpsTime.push(new Date().getTime())
      let f0 = fpsFrameCount.shift(),
          f1 = fpsFrameCount.shift();
          t0 = fpsTime.shift();
          t1 = fpsTime.shift();
          dFPS = (f1 - f0) / (t1 - t0) * 1000;
          fps.innerHTML = `FPS: ${Math.round(dFPS)}`;
   }
}

function newIsosurface() {
   let tempArr = []
   for (let i = 0; i < WIDTH; i += PIXEL_WIDTH){
      for(let j = 0; j < HEIGHT; j += PIXEL_HEIGHT){
         let r = 0, g = .5, b = 1;
         for (p of particles){
            let x1 = p.x - i,
                y1 = p.y - j,
                dist = Math.sqrt((x1*x1)+(y1*y1));
            if (dist > 100){
               continue;
            }
            let col = (500 * p.r / dist);
            col *= col*col*col/(dist);
                // col *= col/(2*dist)

            r += (col * r)
            g += (col * g)
            b += (col * b)
         }
         r = Math.floor(r)
         g = Math.floor(g)
         b = Math.floor(b)

         // if (r < MIN_LIGHT && g < MIN_LIGHT && b < MIN_LIGHT){
         //    continue;
         // }
         if (b < MIN_LIGHT){
            continue;
         }
         else {
            tempArr.push([r,g,b,i,j]);
         }
      }
   }
   return tempArr;
}


function renderParticles(){
   try {
      for (var i = 0; i < NUM_OF_PARTICLES; i++) {
         drawParticles(...particleBuf.shift());
      }
   } catch(e){console.log('renderParticles() error');}
}


function renderSticks() {
   try{
      for (let i = 0; i < numOfSticks; i++){
         drawSticks(...stickBuf.shift());
      }
   }catch(e){console.log('renderSticks() error');}
}

function renderIsoPixels() {
   let temp = frameBuf.shift();
   for (t of temp){
      drawPixels(...t);
   }
}


function drawPixels(r,g,b,i,j) {
   ctx.save();
   ctx.fillStyle = `rgb(${r},${g},${b})`;
   ctx.fill()
   ctx.fillRect(i,j, PIXEL_WIDTH, PIXEL_HEIGHT)
   ctx.restore();
}


function drawParticles(x, y, r) {
   ctx.fillStyle = 'blue';
   ctx.beginPath();
   ctx.arc(x, y, r * 2, 0, Math.PI * 2)
   ctx.closePath();
   ctx.fill();
}


function drawSticks(x1, y1, x2, y2){
   ctx.strokeStyle = 'red';
   ctx.beginPath();
   ctx.moveTo(x1, y1);
   ctx.lineTo(x2, y2);
   ctx.closePath();
   ctx.stroke();
}


function formatStickData(index) {
   let x1, y1, x2, y2, s0, s1;
   s0 = index - 1;
   s1 = index;
   x1 = particles[s0].getX();
   y1 = particles[s0].getY();
   x2 = particles[s1].getX();
   y2 = particles[s1].getY();
   return [x1, y1, x2, y2, s0, s1, PARTICLE_DISTANCE_LOW, PARTICLE_DISTANCE_HIGH]

}

function randParticleData() {
   let x, y, px, py, r,
       tempX =
   // X Spawn in mid 50% of canvas width
   x = randF(PARTICLE_DISTANCE_LOW, WIDTH / 2 - PARTICLE_DISTANCE_LOW);
   y = randF(PARTICLE_DISTANCE_LOW, 100);
   px = x + randF(VELOCITY_RNG, -VELOCITY_RNG * 0.50);
   py = y + randF(VELOCITY_RNG, -VELOCITY_RNG * 0.50);
   r = PIXEL_RADIUS;
   return [x, y, px, py, r]
}

//Random integer - round to floor
function randF(rng, start) {
   return Math.floor(Math.random() * rng) + start;
}



init()
