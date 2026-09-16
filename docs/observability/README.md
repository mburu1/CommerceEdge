# CommerceEdge Observability

CommerceEdge emits structured logs, OpenTelemetry traces, and Prometheus metrics from the API, Scale Unit, and Hardware Station services.

## Local stack

```powershell
Copy-Item infra/compose/.env.example infra/compose/.env
.\infra\scripts\observability.ps1 -Action Start
```

Endpoints:

| Surface | URL |
|---|---|
| API | `http://localhost:5000` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3001` (admin/admin) |
| Jaeger | `http://localhost:16686` |
| Metrics | `http://localhost:5000/metrics` |
| Liveness | `http://localhost:5000/health` |
| Readiness | `http://localhost:5000/health/ready` |

Stop the stack with:

```powershell
.\infra\scripts\observability.ps1 -Action Stop
```

## Signals

- ASP.NET Core request duration, status, route, and exceptions
- Runtime, HTTP client, and SQL Client instrumentation
- Commerce Runtime, cache, messaging, payment, and hardware-station operations
- Structured Serilog events with service, environment, process, and thread context
- Correlation IDs and OpenTelemetry trace IDs on responses and error payloads

Metric names use the `commerceedge_*` prefix for application instrumentation. Grafana provisions the Prometheus and Jaeger data sources and loads the CommerceEdge dashboard automatically.

## Configuration

`Observability:OtlpEndpoint` controls OTLP trace export, while `Observability:OtlpMetricsEndpoint` optionally overrides metric export and `Observability:OtlpMetricsEnabled` controls whether metrics are sent through OTLP. `Observability:TraceSampleRate` accepts values from `0` through `1`; the Compose observability override points traces at Jaeger's OTLP gRPC endpoint and uses Prometheus for metrics. `Observability:PrometheusEnabled` controls the `/metrics` endpoint.

Logs are written to standard output as JSON and, for the API, to the ignored `logs/` directory. Do not add credentials, tokens, payment data, or customer data to log templates or metric labels.
