# Stop Project

## Stop current processes
In terminal running service, press:
- `CTRL + C`

## Stop all Node processes (Windows)
```bash
taskkill /F /IM node.exe
```

## Kill service ports
```bash
npx kill-port 3000 4200 4300 4400
```

## Reset Nx daemon
```bash
npx nx reset
```

## Docker if running
```bash
docker-compose -f docker-compose.dev.yml down
```
