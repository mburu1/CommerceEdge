#!/usr/bin/env pwsh
Push-Location "$PSScriptRoot\..\.."
dotnet build --configuration Release
Pop-Location
