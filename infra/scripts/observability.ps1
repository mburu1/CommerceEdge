param(
    [ValidateSet("Start", "Stop", "Status", "Logs")]
    [string]$Action = "Start"
)

Push-Location "$PSScriptRoot\..\.."
$composeFiles = @(
    "-f", "infra/compose/docker-compose.yml",
    "-f", "infra/compose/docker-compose.observability.yml"
)

switch ($Action) {
    "Start" { docker compose @composeFiles up -d }
    "Stop" { docker compose @composeFiles down }
    "Status" { docker compose @composeFiles ps }
    "Logs" { docker compose @composeFiles logs -f }
}

Pop-Location
