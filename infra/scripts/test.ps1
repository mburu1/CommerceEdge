#!/usr/bin/env pwsh
Push-Location "$PSScriptRoot\..\.."
dotnet test --configuration Release --no-build
Pop-Location
