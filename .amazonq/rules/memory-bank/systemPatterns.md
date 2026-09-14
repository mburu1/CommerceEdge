# System Patterns — CommerceEdge

## Overall Architecture
Layered and modular. Clients → API → Application → Domain/Infrastructure → Commerce Runtime → Scale Unit → Hardware Station.

## Backend Layer Dependency Rules
```
Api → Application, Infrastructure
Infrastructure → Application, Domain
Application → Domain
CommerceRuntime → Domain, Application
ScaleUnit → CommerceRuntime, Application, Domain
HardwareStation → Application, Domain
```
Domain is infrastructure-independent.

## Commerce Runtime Pattern
Request → Handler → Business Logic → Data Access → Database. Mirrors Dynamics 365 Commerce Runtime concepts.

## POS Extension Model
- Operations: business actions (CreateCustomer, ApplyDiscount, ProcessPayment)
- Triggers: lifecycle hooks (BeforePayment, AfterTransactionCommit)
- Requests/Responses: POS ↔ Commerce API communication
- Views, Services: UI and client-side integrations

## Caching Strategy
Redis cache-aside with TTL, explicit invalidation, event-driven invalidation, distributed locking. Cache is never the system of record.

## Messaging Pattern
Commerce Runtime → Event Publisher → Message Broker → Consumers (Inventory, Analytics, Notification, Audit). Used for async operations that don't require synchronous completion.

## Offline POS
Online/Offline modes with local POS store for offline capture, then sync to central system with conflict resolution.

## Payment Abstraction
Payment providers (Cash, Card, Mobile Money, Mock Gateway) abstracted behind interfaces — no direct coupling to production payment providers.

## Observability
OpenTelemetry → Prometheus + Grafana + Jaeger. Structured logging via Serilog. Sensitive data must never be logged.

## Security Model
JWT authentication → Role-based + Permission-based authorization → Commerce Operation. Roles: Admin, StoreManager, Cashier, InventoryManager, Customer.

## Testing Pyramid
Unit → Integration → Contract → E2E. Tests colocated with the subsystem they validate.
