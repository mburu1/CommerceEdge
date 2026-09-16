# CommerceEdge

Production-oriented omnichannel retail commerce and POS platform. Architecturally inspired by Microsoft Dynamics 365 Commerce.

## Status
🚧 Phase 1 — Architecture & Documentation

## Stacks
| Layer | Stack |
|---|---|
| Backend | C# / .NET 9, ASP.NET Core, EF Core, Dapper, SQL Server, Redis |
| POS | TypeScript |
| Web | React + TypeScript, Vite, TanStack Query, React Router |
| Infra | Docker, GitHub Actions, Prometheus, Grafana, Jaeger |

## Architecture
```
Clients → API → Application → Domain ← Infrastructure
                                ↑
                       CommerceRuntime
                                ↑
                           ScaleUnit
                                ↑
                       HardwareStation
```

## Getting Started
```powershell
./infra/scripts/setup.ps1
docker compose -f infra/compose/docker-compose.yml up -d
dotnet run --project backend/src/CommerceEdge.Api
```

## Observability

The local stack includes OpenTelemetry, Serilog, Prometheus, Grafana, and Jaeger. Start it with `./infra/scripts/observability.ps1 -Action Start`; see [`docs/observability/README.md`](docs/observability/README.md) for endpoints and configuration.

## Documentation
See [`docs/`](docs/) for architecture, domain model, UML, ERD, API contracts, ADRs, and more.
