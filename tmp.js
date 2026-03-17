const http=require('http');
const body=JSON.stringify({query:'{ __type(name:\"LoginInput\") { name inputFields { name type { kind name ofType { kind name } } } } }'});
const req=http.request({hostname:'127.0.0.1', port:3000, path:'/graphql', method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}}, res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>console.log(d));});
req.write(body);
req.end();
