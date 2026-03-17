const body = JSON.stringify({ query: 'mutation { login(input:{username:"admin@example.com",password:"password",role:"ADMIN"}) { accessToken refreshToken userId isNewUser } }' });
fetch('http://localhost:3000/graphql', { method:'POST', headers:{'content-type':'application/json'}, body })
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e));
