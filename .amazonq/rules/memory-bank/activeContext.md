# Active Context — CommerceEdge

## Current Phase
Phase 1 — Architecture (in progress). All implementation phases are pending.

## Phase 1 Checklist
- [ ] Define bounded contexts
- [ ] Define domain model
- [ ] Define architecture
- [ ] Create UML
- [ ] Create ERD
- [ ] Define API contracts
- [ ] Create ADRs

## Upcoming Phases (in order)
2. Backend Foundation (Domain, Application, Infrastructure, API projects; DI, config, logging, exception handling, validation)
3. Commerce (products, stores, channels, customers, inventory, pricing, promotions, orders)
4. Commerce Runtime (requests, responses, handlers, entities, business rules, transaction processing)
5. POS (shell, operations, triggers, requests, handlers, views, services)
6. Payments (abstraction, cash, card sim, mobile money sim, refunds, reconciliation)
7. Hardware (barcode scanner, receipt printer, cash drawer, payment terminal simulations)
8. E-Commerce (React app, catalog, search, cart, checkout, customer accounts, order history)
9. Distributed Systems (Redis, messaging, event publishing/consumers, retry, idempotency, offline sync)
10. Production Engineering (OpenTelemetry, Prometheus, Grafana, Jaeger, Docker, CI/CD, security scanning, perf testing)

## Key Decisions Pending (ADRs to write)
ADR-001 through ADR-010 covering: backend architecture, Commerce Runtime boundary, SQL Server selection, Redis caching strategy, messaging strategy, POS offline strategy, payment abstraction, authentication strategy, observability strategy, test organization.
