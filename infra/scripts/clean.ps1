#!/usr/bin/env pwsh
Push-Location "$PSScriptRoot\..\.."
Get-ChildItem -Recurse -Include bin,obj | Remove-Item -Recurse -Force
Write-Host "Clean complete."
Pop-Location
