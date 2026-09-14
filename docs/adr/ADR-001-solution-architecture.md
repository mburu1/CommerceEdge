# ADR-001 — Solution Architecture

## Status
Proposed

## Context
CommerceEdge requires a layered, modular backend architecture that supports POS, Commerce Runtime, Scale Unit, Hardware Station, and a public API — all within a single .NET solution.

## Decision
Adopt a layered architecture: `Api → Application + Infrastructure → Domain`. Commerce Runtime sits alongside Application, consuming Domain. Scale Unit wraps Commerce Runtime. Hardware Station is an independent service consuming Domain and Application abstractions.

## Consequences
- Domain remains infrastructure-independent and fully unit-testable.
- Each layer has a single, well-defined responsibility.
- Dependency inversion is enforced at every layer boundary.
