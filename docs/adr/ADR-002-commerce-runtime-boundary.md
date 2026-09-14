# ADR-002 — Commerce Runtime Boundary

## Status
Proposed

## Context
The Commerce Runtime must process retail transactions (cart, pricing, promotions, payments) in a request/handler pipeline, mirroring Dynamics 365 Commerce Runtime concepts.

## Decision
Commerce Runtime is a dedicated project (`CommerceEdge.CommerceRuntime`) with its own Requests, Responses, Handlers, Entities, and Services. It depends on Domain and Application but is not referenced by the API directly — Scale Unit mediates.

## Consequences
- Clear separation between API concerns and runtime transaction processing.
- Handlers are independently testable.
- Scale Unit acts as the deployment boundary for Commerce Runtime.
