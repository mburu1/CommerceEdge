# ADR-006 — Offline POS Strategy

## Status
Proposed

## Context
POS terminals must continue operating during network outages, capturing transactions locally and syncing when connectivity is restored.

## Decision
POS maintains a local store for offline transaction capture. On reconnection, transactions are synced to the central system with conflict resolution. Online/Offline mode is explicit and surfaced in the POS UI.

## Consequences
- Local store must be durable and survive process restarts.
- Sync logic must handle conflicts (e.g., inventory already sold centrally).
- Offline mode limits certain operations (e.g., real-time loyalty balance checks).
