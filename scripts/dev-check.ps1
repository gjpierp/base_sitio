# Script de diagnóstico para Windows PowerShell
# Comprueba si hay un proceso escuchando en el puerto 3005 y sugiere comandos para arrancar el backend

$port = 3005
Write-Host "Comprobando puerto $port..."

$net = netstat -ano | Select-String ":$port "
if ($net) {
    Write-Host "Hay un proceso escuchando en el puerto $port:" -ForegroundColor Green
    $net | ForEach-Object { Write-Host $_ }
    Write-Host "Si quieres ver el proceso en el administrador de tareas, toma el PID de la última columna." -ForegroundColor Yellow
} else {
    Write-Host "No hay proceso escuchando en el puerto $port." -ForegroundColor Yellow
    Write-Host "Comandos sugeridos para arrancar el backend (ejecutar desde la carpeta 'bcknd'):" -ForegroundColor Cyan
    Write-Host "cd bcknd" -ForegroundColor White
    Write-Host "npm install    # si es la primera vez" -ForegroundColor White
    Write-Host "npm run start:dev    # arranca con nodemon" -ForegroundColor White
}

# Intento de petición HTTP simple (si curl está disponible)
$testUrl = "http://localhost:$port/api/themes/fach-light"
Write-Host "\nProbando petición GET $testUrl ..."
try {
    $resp = Invoke-WebRequest -Uri $testUrl -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Respuesta HTTP: $($resp.StatusCode)" -ForegroundColor Green
    Write-Host "Body (primeros 500 chars):" -ForegroundColor Gray
    $text = $resp.Content
    if ($text.Length -gt 500) { $text = $text.Substring(0,500) + '... (truncated)' }
    Write-Host $text
} catch {
    Write-Host "No se pudo conectar a $testUrl (posible ECONNREFUSED). Comprueba que el backend esté arrancado." -ForegroundColor Red
}
