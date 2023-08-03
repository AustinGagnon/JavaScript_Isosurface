class VerletStick {
   constructor(x1, y1, x2, y2, s0, s1, ll, lh) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.distance = distance(this.x1, this.y1, this.x2, this.y2);
      this.s0 = s0;
      this.s1 = s1;
      this.lenLow = ll;
      this.lenHigh = lh;
   }

   update = (b)=>{
      this.x1 = b[this.s0].getX()
      this.y1 = b[this.s0].getY()
      this.x2 = b[this.s1].getX()
      this.y2 = b[this.s1].getY()
      this.distance = distance(this.x1, this.y1, this.x2, this.y2);
      let x;
      if (this.distance > this.lenHigh){
         let dx = this.x2 - this.x1,
             dy = this.y2 - this.y1,
             diff = this.lenHigh - this.distance,
             percent = diff / this.distance / 2,
             offsetX = dx * percent,
             offsetY = dy * percent,
             x1 = this.x1 - offsetX,
             y1 = this.y1 - offsetY,
             x2 = this.x2 + offsetX,
             y2 = this.y2 + offsetY;

         b[this.s0].setX(x1);
         b[this.s0].setY(y1);
         b[this.s1].setX(x2);
         b[this.s1].setY(y2)
      }
      else if (this.distance < this.lenLow){
         let dx = this.x2 - this.x1,
             dy = this.y2 - this.y1,
             diff = this.lenLow - this.distance,
             percent = diff / this.distance / 2,
             offsetX = dx * percent,
             offsetY = dy * percent,
             x1 = this.x1 - offsetX,
             y1 = this.y1 - offsetY,
             x2 = this.x2 + offsetX,
             y2 = this.y2 + offsetY;

         b[this.s0].setX(x1);
         b[this.s0].setY(y1);
         b[this.s1].setX(x2);
         b[this.s1].setY(y2)
      }



   }

   getIndex

   draw = ()=>{
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(this.x1 + width, this.y1);
      ctx.lineTo(this.x2 + width, this.y2);
      ctx.closePath();
      ctx.stroke();

   }

   saveState = ()=>{
      return [this.x1, this.y1, this.x2, this.y2]
   }
}

function distance(x1, y1, x2, y2) {
   let y = y2 - y1,
       x = x2 - x1;
   return Math.sqrt((x*x)+(y*y))
}
