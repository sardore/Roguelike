export class Rng {
  constructor(public state:number){}
  next():number{let x=this.state|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.state=x>>>0;return this.state/4294967296}
  int(min:number,max:number):number{return min+Math.floor(this.next()*(max-min+1))}
  chance(p:number):boolean{return this.next()<p}
  pick<T>(xs:readonly T[]):T{const v=xs[Math.floor(this.next()*xs.length)];if(v===undefined)throw new Error('empty pick');return v}
}
export function hash(text:string):number{let h=2166136261>>>0;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
