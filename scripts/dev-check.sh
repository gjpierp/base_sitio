#!/usr/bin/env bash
# Script de diagnóstico para Linux/WSL/macOS
# Comprueba si hay un proceso escuchando en el puerto 3005 y sugiere comandos para arrancar el backend

PORT=3005
echo "Comprobando puerto $PORT..."

if command -v ss >/dev/null 2>&1; then
  ss -ltnp | grep -E ":$PORT\b" || true
else
  netstat -ltnp 2>/dev/null | grep -E ":$PORT\b" || true
fi

if [ $? -eq 0 ]; then
  echo "Parece que hay un proceso escuchando en el puerto $PORT." 
else
  echo "No hay proceso escuchando en el puerto $PORT. Para arrancar el backend:" 
  echo "  cd bcknd" 
  echo "  npm install   # si no lo has instalado" 
  echo "  npm run start:dev" 
fi

# Intento de petición HTTP simple con curl si está instalado
TEST_URL="http://localhost:$PORT/api/themes/fach-light"
if command -v curl >/dev/null 2>&1; then
  echo "\nProbando GET $TEST_URL ..."
  curl -sv --max-time 5 "$TEST_URL" || echo "No se pudo conectar (ECONNREFUSED probable)."
else
  echo "curl no disponible; omitiendo prueba HTTP."
fi
