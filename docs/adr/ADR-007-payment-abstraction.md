# ADR-007 — Payment Abstraction

## Status
Proposed

## Context
Multiple payment methods (Cash, Card, Mobile Money) must be supported. Real hardware and simulators must be interchangeable.

## Decision
All payment providers implement a common interface. Cash, Card simulator, and Mobile Money simulator are provided. No direct coupling to production payment SDKs in the domain or application layers. Hardware Station mediates physical payment terminal communication.

## Consequences
- Simulators enable full end-to-end testing without real hardware.
- Adding a new payment provider requires only a new interface implementation.
- Hardware Station must be independently deployable.
