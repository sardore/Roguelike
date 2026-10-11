import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'};
export function serve(root,port=0){
  const srv=http.createServer((req,res)=>{
    let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';
    const f=path.join(root,p);if(!f.startsWith(path.resolve(root))||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return}
    res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);
  });
  return new Promise(r=>srv.listen(port,'127.0.0.1',()=>r({url:`http://127.0.0.1:${srv.address().port}/`,close:()=>new Promise(c=>srv.close(c))})));
}
