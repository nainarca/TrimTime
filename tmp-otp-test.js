const body = JSON.stringify({ query: 'mutation { requestOtp(input:{phone:"+10000000000"}) { success message expiresIn otp } }' });
fetch('http://localhost:3000/graphql', { method:'POST', headers:{'content-type':'application/json'}, body })
  .then(r=>r.json())
  .then(d=>console.log(JSON.stringify(d,null,2)))
  .catch(e=>console.error(e));
