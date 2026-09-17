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

`Observability:ApplicationInsightsConnectionString` enables Azure Application Insights export for traces and metrics when configured.

Logs are written to standard output as JSON and, for the API, to the ignored `logs/` directory. Do not add credentials, tokens, payment data, or customer data to log templates or metric labels.

## OpenTelemetry Collector (Production)

An OpenTelemetry Collector configuration is provided at `infra/docker/otel-collector/config.yaml` for production deployments. It receives traces and metrics via OTLP, exports to Jaeger, Prometheus, and optionally Azure Monitor. To deploy:

```bash
docker run --rm -p 4317:4317 -p 4318:4318 -p 8888:8888 \
  -v $(pwd)/infra/docker/otel-collector/config.yaml:/otel-config.yaml:ro \
  otel/opentelemetry-collector-contrib:0.104.0 \
  --config /otel-config.yaml
```

## Alerting

Prometheus alerting rules are defined at `infra/docker/prometheus/alerts.yml`. Rules cover:

- High error rate on operations (>5% over 5 minutes)
- Slow operations (p95 > 2s over 5 minutes)
- Database unreachable
- Redis unreachable
- High request latency (p99 > 5s over 5 minutes)
- Low traffic (fewer than 10 operations in 10 minutes)

To load the alert rules, add `--alert.dump=alerts.yml` to the Prometheus command or reference them in `infra/docker/prometheus/prometheus.yml`.
