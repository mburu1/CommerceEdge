# Progress — CommerceEdge

## What Exists
- README with full architecture specification
- `.amazonq/rules/memory-bank/` — Memory Bank initialized
- Repository structure defined (not yet scaffolded on disk)

## What Is Not Yet Built
Everything in the implementation roadmap (Phases 2–10). No source code, database scripts, Docker configs, CI/CD workflows, or documentation files have been created yet.

## Planned Repository Structure (to be scaffolded)
```
backend/src/   — CommerceEdge.Api, .Application, .Domain, .Infrastructure, .CommerceRuntime, .ScaleUnit, .HardwareStation
backend/tests/ — Unit, Application.Integration, Api.Integration, CommerceRuntime, ScaleUnit, Contract tests
pos/CommerceEdge.POS/ — operations, triggers, requests, handlers, views, services, tests
web/commerce-edge-web/ — src (components, features, pages, hooks, services, models, routes), tests
database/      — migrations, schema, stored-procedures, views, seed
docs/          — architecture, ooad, uml, database, api, security, messaging, observability, testing, adr
infra/         — docker/, compose/, kubernetes/, scripts/
.github/workflows/ — ci.yml, backend.yml, frontend.yml, security.yml
```

## Core Domain Entities (to be modeled)
Store, Channel, Register, Employee, Product, ProductVariant, Category, Price, Promotion, Customer, CustomerAddress, LoyaltyAccount, InventoryItem, StockLevel, StockReservation, Cart, CartLine, Order, OrderLine, Payment, Refund, Return, Shift, Till, Transaction, Receipt

## API Surface (to be built)
/api/products, /api/categories, /api/inventory, /api/customers, /api/carts, /api/orders, /api/payments, /api/stores, /api/pos

## Known Constraints
- Architecture and documentation must precede implementation (by design)
- Domain layer must remain infrastructure-independent
- Sensitive data must never be written to logs
- Cache must never be treated as system of record
- Payment providers must be abstracted behind interfaces
- Hardware integrations must be abstracted so simulators can be swapped for real hardware
