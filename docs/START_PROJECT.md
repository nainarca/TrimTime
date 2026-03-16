# Start Project

## Start each service

### API
```bash
npx nx serve api
```

### Admin Dashboard
```bash
npx nx serve admin-dashboard
```

### Customer Mobile
```bash
npx nx serve customer-mobile
```

### Queue Display
```bash
npx nx serve queue-display
```

## Primary URLs
- GraphQL: `http://localhost:3000/graphql`
- Admin: `http://localhost:4200`
- Customer: `http://localhost:4300`
- Queue Display: `http://localhost:4400`

## Run all apps at once
```bash
npx nx run-many --target=serve --projects=api,admin-dashboard,customer-mobile,queue-display --parallel
```
