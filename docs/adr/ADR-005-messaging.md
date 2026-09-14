# ADR-005 — Messaging Strategy

## Status
Proposed

## Context
Async operations (inventory updates, analytics, notifications, audit) must not block the transaction path.

## Decision
Use a message broker (RabbitMQ in dev/local) with Commerce Runtime publishing domain events. Consumers handle inventory, analytics, notifications, and audit asynchronously. Retry and idempotency are required on all consumers.

## Consequences
- Transaction path is decoupled from side-effect processing.
- Consumers must be idempotent to handle redelivery.
- Message schema changes require versioning discipline.
