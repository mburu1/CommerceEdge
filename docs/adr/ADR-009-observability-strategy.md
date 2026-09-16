# ADR-009 — Observability Strategy

## Status
Proposed

## Context
CommerceEdge runs as multiple deployable services and integrates with SQL Server, Redis, messaging, POS, and hardware workflows. Operators need a consistent view of request health, latency, failures, dependency behavior, and distributed execution without coupling business code to a specific observability vendor.

## Decision
Use OpenTelemetry as the instrumentation and export boundary. ASP.NET Core, HTTP client, runtime, and SQL Client signals are collected automatically. Shared `ActivitySource` and `Meter` instrumentation covers Commerce Runtime, cache, messaging, payment, and hardware-station operations.

Use Serilog for structured application logs emitted to standard output. Use Prometheus for metrics scraping and Grafana for dashboards. Use Jaeger all-in-one with OTLP enabled for local distributed tracing. Compose provisions the data sources and dashboard so the local stack is usable without manual UI setup.

Keep credentials, tokens, payment details, and customer data out of logs, trace tags, and metric labels. Correlation IDs and trace IDs are returned on API responses to support incident investigation.

## Consequences
- Services can change telemetry backends by changing exporter configuration.
- Local debugging has metrics, logs, and traces available through one Compose command.
- Production deployment must provide durable log aggregation, Prometheus storage, and a highly available tracing backend.
- Metric cardinality is bounded by using operation names and result states rather than entity identifiers.
