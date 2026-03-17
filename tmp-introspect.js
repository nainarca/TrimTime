const body = JSON.stringify({ query: '{ __type(name:\"Mutation\") { name fields { name } } }' });
fetch('http://localhost:3000/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(e => { console.error(e); process.exit(1); });
