# PowerShell Script: Check Surfers API Structure

Write-Host "🔍 Checking surfers API files..." -ForegroundColor Cyan

$apiPath = "C:\projects\posseable-system\app\api\surfers"

if (-not (Test-Path $apiPath)) {
    Write-Host "❌ ERROR: $apiPath does not exist!" -ForegroundColor Red
    Write-Host "   Creating directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $apiPath
}

Write-Host "`n📁 Current files in api/surfers:" -ForegroundColor Yellow
Get-ChildItem -Path $apiPath -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace($apiPath, "")
    Write-Host "   $relativePath" -ForegroundColor White
}

Write-Host "`n✅ Expected structure:" -ForegroundColor Green
Write-Host "   \route.ts" -ForegroundColor White
Write-Host "   \add\route.ts" -ForegroundColor White
Write-Host "   \update\route.ts" -ForegroundColor White

Write-Host "`n📋 Checking each file:" -ForegroundColor Cyan

$files = @(
    @{ Path = "$apiPath\route.ts"; Name = "Main route (GET)" },
    @{ Path = "$apiPath\add\route.ts"; Name = "Add route (POST)" },
    @{ Path = "$apiPath\update\route.ts"; Name = "Update route (PUT/DELETE)" }
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Write-Host "   ✅ $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($file.Name) - MISSING!" -ForegroundColor Red
    }
}

Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Make sure all 3 route.ts files exist" -ForegroundColor White
Write-Host "   2. Delete .next folder: Remove-Item -Recurse -Force .next" -ForegroundColor White
Write-Host "   3. Restart: npm run dev" -ForegroundColor White