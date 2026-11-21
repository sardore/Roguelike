// The fifth theme (floors 21~25) paints its own air over the world: each floor has one signature instead of the shared purple wisps.
// Everything is drawn in screen space with the same 'screen' blend as the other regions, so the cost is a few gradients and a handful of specks.
const THEME5_AIR=Object.freeze({
  21:{wash:['58,214,222',.07,[.22,.18],.9],kind:'stars',tint:'150,236,255',second:'118,84,230',n:46},
  22:{wash:['255,222,150',.07,[.50,.05],.95],kind:'shafts',tint:'255,230,170',second:'120,226,210',n:14},
  23:{wash:['182,226,240',.06,[.50,.50],1],kind:'shimmer',tint:'214,244,255',second:'140,186,214',n:10},
  24:{wash:['255,226,138',.075,[.85,.10],.9],kind:'petals',tint:'255,170,196',second:'246,255,170',n:22},
  25:{wash:['255,200,84',.08,[.50,.50],.8],kind:'embers',tint:'255,206,96',second:'140,120,255',n:30}
});
function theme5Air(){return state&&!state.branchContext105&&!state.duel?THEME5_AIR[state.floor]||null:null}
function drawTheme5Air(now,mobile){
  const A=theme5Air();if(!A)return false;
  const W=VIEW.w,H=VIEW.h,n=mobile?Math.ceil(A.n/3):A.n,[rgb,a,at,r]=A.wash;
  const g=X.createRadialGradient(W*at[0],H*at[1],12,W*at[0],H*at[1],H*r);g.addColorStop(0,`rgba(${rgb},${mobile?a*.7:a})`);g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(0,0,W,H);
  const t=now/1000;
  if(A.kind==='stars'){
    // starlight over the void sea: slow twinkling points and two drifting violet/cyan curtains
    for(let i=0;i<n;i++){const x=hash2(i,3,51)*W,y=hash2(i,5,53)*H,tw=.5+.5*Math.sin(t*(.8+i%5*.3)+i*1.7);X.fillStyle=`rgba(${A.tint},${.05+tw*.16})`;const s=1+(i%7===0?1:0);X.fillRect(x,y,s,s);if(i%7===0&&tw>.8){X.fillRect(x-3,y,7,1);X.fillRect(x,y-3,1,7)}}
    if(!mobile)for(let i=0;i<2;i++){const y=H*(.25+i*.4)+Math.sin(t*.25+i*2)*26,gr=X.createLinearGradient(0,y-70,0,y+70);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,`rgba(${i?A.tint:A.second},.04)`);gr.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=gr;X.fillRect(0,y-70,W,140)}
  }else if(A.kind==='shafts'){
    // gold light slanting down through the halls of the heart
    for(let i=0;i<(mobile?2:4);i++){const x0=W*(.12+i*.24)+Math.sin(t*.2+i)*18,w=70+i%2*34,gr=X.createLinearGradient(x0,0,x0-H*.3,H);gr.addColorStop(0,`rgba(${A.tint},.07)`);gr.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=gr;X.beginPath();X.moveTo(x0,0);X.lineTo(x0+w,0);X.lineTo(x0+w-H*.3,H);X.lineTo(x0-H*.3,H);X.closePath();X.fill()}
    for(let i=0;i<n;i++){const x=hash2(i,7,57)*W+Math.sin(t*.6+i)*10,y=(hash2(i,9,59)*H-t*9*(1+i%3)+H*2)%H;X.fillStyle=`rgba(${i%4?A.tint:A.second},.12)`;X.fillRect(x,y,2,2)}
  }else if(A.kind==='shimmer'){
    // light skating over the mercury: pale bands that slide sideways and thin out
    for(let i=0;i<n;i++){const y=H*((i+.5)/n)+Math.sin(t*.7+i*1.9)*8,x=((t*26*(1+i%3*.4)+i*173)%(W+260))-130,len=90+i%4*50;const gr=X.createLinearGradient(x,0,x+len,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,`rgba(${i%2?A.tint:A.second},${.05+.03*Math.sin(t+i)})`);gr.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=gr;X.fillRect(x,y,len,1+(i%3===0?1:0))}
  }else if(A.kind==='petals'){
    // petals and pollen drifting across the golden orchard
    for(let i=0;i<n;i++){const sp=.035+i%4*.012,x=(hash2(i,3,61)*W+t*W*sp*1.2)%(W+40)-20,y=(hash2(i,5,63)*H+t*H*sp*1.6)%(H+40)-20,sway=Math.sin(t*1.2+i*2.1)*9;X.fillStyle=`rgba(${i%3?A.tint:A.second},${i%3?.16:.12})`;if(i%3){X.save();X.translate(x+sway,y);X.rotate(Math.sin(t+i)*.9);X.fillRect(-2,-1,4,2);X.restore()}else X.fillRect(x+sway,y,2,2)}
  }else if(A.kind==='embers'){
    // the nucleus breathes: a gold pulse at the centre and embers rising from below
    const pulse=.5+.5*Math.sin(t*1.1),gr=X.createRadialGradient(W/2,H/2,20,W/2,H/2,H*.55);gr.addColorStop(0,`rgba(${A.tint},${.025+pulse*.04})`);gr.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=gr;X.fillRect(0,0,W,H);
    for(let i=0;i<n;i++){const x=hash2(i,3,67)*W+Math.sin(t*.9+i)*14,y=(hash2(i,5,69)*H-t*22*(1+i%4*.5)+H*3)%(H+20);X.fillStyle=`rgba(${i%5?A.tint:A.second},${.12+.12*Math.sin(t*2+i)})`;X.fillRect(x,y,2+(i%3===0?1:0),2)}
  }
  return true;
}
