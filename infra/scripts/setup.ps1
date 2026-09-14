#!/usr/bin/env pwsh
Write-Host "Setting up CommerceEdge development environment..."

Push-Location "$PSScriptRoot\..\.."

dotnet restore
Write-Host "Backend dependencies restored."

Push-Location "pos\CommerceEdge.POS"
npm install
Pop-Location

Push-Location "web\commerce-edge-web"
npm install
Pop-Location

Pop-Location
Write-Host "Setup complete."
