const gravity = .005,
      bounce = .5;


class VerletParticle {
   constructor(x, y, px, py, r) {
      this.x = x;
      this.y = y;
      this.px = px;
      this.py = py;
      this.r = r;
      this.buoyancy = 0;
   }

   update = ()=>{
      let vx = this.x - this.px,
          vy = this.y - this.py;
      this.px = this.x;
      this.py = this.y;
      this.x += vx;
      this.y += vy + gravity + this.buoyancy;

      if (this.x > WIDTH - this.r){
         this.px = this.x + vx * bounce * 1.95;
      }
      else if (this.x < this.r){
         this.px = this.x + vx * bounce * 1.95;
      }
      if (this.y > HEIGHT - this.r * 2){
         this.py = this.y + vy * bounce;
      }
      else if (this.y < this.r * 2){
         this.py = this.y + vy * bounce;
      }
      if (this.y > HEIGHT * .75){
         // console.log(this.y > HEIGHT * .85);
         this.buoyancy -= .000025
      }
      if (this.y < HEIGHT * .75){
         if(this.buoyancy < 0){
            this.buoyancy += .00009
         }
      }

   }


   draw = ()=>{
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 2, 0, Math.PI * 2)
      ctx.closePath();
      ctx.fill();
   }

   saveState = ()=>{
      return [this.x, this.y, this.r]
   }


   getX = ()=>{
      return this.x;
   }

   getY = ()=>{
      return this.y;
   }

   setX = (x)=>{
      this.x = x;
   }
   setY = (y)=>{
      this.y = y;
   }
}
