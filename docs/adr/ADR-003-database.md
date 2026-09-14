# ADR-003 — Database

## Status
Proposed

## Context
The system requires a relational database for transactional retail data: orders, payments, inventory, customers, products, and POS operations.

## Decision
Use SQL Server as the primary database. Entity Framework Core for general data access; Dapper for high-performance query scenarios. Schema is organized by domain area (catalog, customers, inventory, orders, payments, pos, stores).

## Consequences
- EF Core migrations manage schema evolution.
- Dapper is used selectively for read-heavy or complex query paths.
- SQL Server provides ACID guarantees required for payment and order transactions.
