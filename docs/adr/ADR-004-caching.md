# ADR-004 — Caching Strategy

## Status
Proposed

## Context
Product catalog, pricing, and store configuration are read-heavy and benefit from caching. Cache consistency and invalidation are critical.

## Decision
Use Redis with a cache-aside pattern. TTL-based expiry plus explicit and event-driven invalidation. Distributed locking via Redis for cache stampede prevention. Cache is never the system of record.

## Consequences
- Read latency reduced for catalog and pricing queries.
- Cache invalidation must be triggered on every write to cached entities.
- Redis failure must degrade gracefully to database reads.
