# CommerceEdge POS

TypeScript POS client implementing operations, triggers, requests, handlers, views, controls, and services.

## Structure
- `src/operations/` — Business actions (CreateCustomer, ApplyDiscount, ProcessPayment)
- `src/triggers/` — Lifecycle hooks (BeforePayment, AfterTransactionCommit)
- `src/requests/` — POS ↔ Commerce API request/response types
- `src/handlers/` — Request handlers
- `src/views/` — UI view definitions
- `src/controls/` — Reusable UI controls
- `src/services/` — Client-side services
- `src/models/` — Domain models
- `src/extensions/` — Extension points

## Getting Started
```bash
npm install
npm run build
npm test
```
