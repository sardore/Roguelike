const scale=1.18;
const widthDesc=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'width');
const heightDesc=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'height');
if(widthDesc?.get&&widthDesc.set&&heightDesc?.get&&heightDesc.set){
  Object.defineProperty(HTMLCanvasElement.prototype,'width',{
    configurable:true,
    get(){return widthDesc.get!.call(this)},
    set(value:number){widthDesc.set!.call(this,this.id==='game'?Math.floor(value*scale):value)}
  });
  Object.defineProperty(HTMLCanvasElement.prototype,'height',{
    configurable:true,
    get(){return heightDesc.get!.call(this)},
    set(value:number){heightDesc.set!.call(this,this.id==='game'?Math.floor(value*scale):value)}
  });
}
void import('./main3');
