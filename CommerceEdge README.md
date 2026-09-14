# CommerceEdge

### Omnichannel Retail Commerce & POS Platform

CommerceEdge is a production-oriented retail commerce platform inspired by the architecture and extension model of **Microsoft Dynamics 365 Commerce**.

The project is designed as a hands-on learning and portfolio project for understanding how modern enterprise retail systems are built across **POS, Commerce Runtime, Commerce APIs, Scale Unit, hardware integrations, e-commerce, payments, inventory, customers, orders, security, observability, and distributed infrastructure**.

The primary backend stack is **C#/.NET**, while the POS client uses **TypeScript** and the web commerce experience uses **React + TypeScript**.

> **Learning objective:** understand the architectural concepts behind Dynamics 365 Commerce by building a realistic commerce platform rather than a simple CRUD POS application.

---

## Table of Contents

- [About](#about)
- [Problem](#problem)
- [Goals](#goals)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Core Capabilities](#core-capabilities)
- [Commerce Architecture](#commerce-architecture)
- [POS Architecture](#pos-architecture)
- [Commerce Runtime](#commerce-runtime)
- [Scale Unit](#scale-unit)
- [Hardware Station](#hardware-station)
- [E-Commerce](#e-commerce)
- [Domain Model](#domain-model)
- [Database](#database)
- [API Contracts](#api-contracts)
- [Security](#security)
- [Messaging](#messaging)
- [Caching](#caching)
- [Offline POS](#offline-pos)
- [Payments](#payments)
- [Observability](#observability)
- [Testing Strategy](#testing-strategy)
- [Docker](#docker)
- [CI/CD](#ci-cd)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Architecture Decisions](#architecture-decisions)
- [Development Roadmap](#development-roadmap)
- [Learning Objectives](#learning-objectives)
- [Project Status](#project-status)
- [License](#license)

---

# About

CommerceEdge simulates a modern omnichannel retail ecosystem.

The platform contains three major experiences:

```text
                    CommerceEdge
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
        POS          Commerce API    E-Commerce
     TypeScript       C#/.NET       React/TS
          |              |              |
          +--------------+--------------+
                         |
                Commerce Runtime
                      C#/.NET
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
          SQL Server   Redis      Messaging
```

The system is intentionally designed around enterprise commerce concepts rather than a conventional monolithic CRUD application.

---

# Problem

Retail systems must support much more than creating products and processing orders.

A modern commerce platform needs to handle:

- Store and channel management
- Product catalogs
- Pricing
- Promotions
- Customers
- Inventory
- Shopping carts
- Orders
- Payments
- Returns
- POS operations
- Hardware peripherals
- Offline operation
- E-commerce
- Authentication and authorization
- Distributed integrations
- Caching
- Messaging
- Observability
- Auditability
- Resilience
- High transaction volumes

CommerceEdge explores how these concerns can be separated into well-defined architectural boundaries.

---

# Goals

CommerceEdge aims to demonstrate:

- Enterprise C#/.NET development
- Retail domain modeling
- POS architecture
- Commerce Runtime concepts
- Commerce API design
- TypeScript POS extensions
- React e-commerce development
- SQL Server database design
- Distributed messaging
- Redis caching
- Payment integration patterns
- Hardware integration patterns
- Offline POS architecture
- Authentication and authorization
- Observability
- Automated testing
- Docker
- CI/CD
- Architecture documentation
- OOAD and UML
- Production-oriented engineering practices

---

# Technology Stack

## Backend

| Technology | Purpose |
|---|---|
| C# | Primary backend language |
| .NET | Application runtime |
| ASP.NET Core | REST APIs |
| Entity Framework Core | Data access where appropriate |
| Dapper | High-performance SQL/query scenarios |
| SQL Server | Transactional relational database |
| Redis | Distributed caching |
| OpenTelemetry | Observability |
| Serilog | Structured logging |
| FluentValidation | Request validation |
| Swagger/OpenAPI | API documentation |
| Scalar | API exploration |
| xUnit | Unit testing |
| Testcontainers | Integration testing |

---

## POS

| Technology | Purpose |
|---|---|
| TypeScript | POS extension/client development |
| Node.js | Tooling/runtime |
| npm | Package management |
| POS APIs | Commerce POS integration concepts |
| Request/Response patterns | POS communication |
| Triggers | POS lifecycle customization |
| Operations | Custom POS workflows |
| Views | POS user interface |
| Services | Client-side integrations |

---

## Web Commerce

| Technology | Purpose |
|---|---|
| React | Web UI |
| TypeScript | Type-safe frontend development |
| Vite | Frontend build tooling |
| React Router | Client-side routing |
| TanStack Query | Server-state management |
| HTML/CSS | Presentation |
| REST/OpenAPI | Backend communication |

---

## Database & Infrastructure

| Technology | Purpose |
|---|---|
| SQL Server | Primary relational database |
| Redis | Caching |
| Docker | Containerization |
| Docker Compose | Local infrastructure |
| GitHub Actions | CI/CD |
| OpenTelemetry | Metrics/tracing |
| Grafana | Observability |
| Prometheus | Metrics |
| Jaeger | Distributed tracing |

---

# Repository Structure

```text
CommerceEdge/
│
├── CommerceEdge.slnx
├── README.md
├── LICENSE
├── .gitignore
├── .editorconfig
│
├── backend/
│   │
│   ├── src/
│   │   ├── CommerceEdge.Api/
│   │   ├── CommerceEdge.Application/
│   │   ├── CommerceEdge.Domain/
│   │   ├── CommerceEdge.Infrastructure/
│   │   ├── CommerceEdge.CommerceRuntime/
│   │   ├── CommerceEdge.ScaleUnit/
│   │   └── CommerceEdge.HardwareStation/
│   │
│   └── tests/
│       ├── CommerceEdge.UnitTests/
│       ├── CommerceEdge.Application.IntegrationTests/
│       ├── CommerceEdge.Api.IntegrationTests/
│       ├── CommerceEdge.CommerceRuntime.Tests/
│       ├── CommerceEdge.ScaleUnit.Tests/
│       └── CommerceEdge.ContractTests/
│
├── pos/
│   │
│   └── CommerceEdge.POS/
│       ├── operations/
│       ├── triggers/
│       ├── requests/
│       ├── handlers/
│       ├── views/
│       ├── services/
│       ├── models/
│       └── tests/
│           ├── unit/
│           └── integration/
│
├── web/
│   │
│   └── commerce-edge-web/
│       ├── src/
│       │   ├── components/
│       │   ├── features/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── models/
│       │   └── routes/
│       │
│       └── tests/
│           ├── unit/
│           ├── integration/
│           └── e2e/
│
├── database/
│   ├── migrations/
│   ├── schema/
│   ├── stored-procedures/
│   ├── views/
│   └── seed/
│
├── docs/
│   ├── architecture/
│   ├── ooad/
│   ├── uml/
│   ├── database/
│   ├── api/
│   ├── security/
│   ├── messaging/
│   ├── observability/
│   ├── testing/
│   └── adr/
│
├── infra/
│   ├── docker/
│   │   ├── api/
│   │   ├── sqlserver/
│   │   ├── redis/
│   │   ├── prometheus/
│   │   ├── grafana/
│   │   └── jaeger/
│   │
│   ├── compose/
│   │   ├── docker-compose.yml
│   │   └── docker-compose.dev.yml
│   │
│   ├── kubernetes/
│   └── scripts/
│
└── .github/
    └── workflows/
        ├── ci.yml
        ├── backend.yml
        ├── frontend.yml
        └── security.yml
```

---

# Solution Structure

The `.slnx` file intentionally lives at the **repository root**.

```text
CommerceEdge/
└── CommerceEdge.slnx
```

This allows the solution to orchestrate the backend projects while keeping the repository organized around multiple technology boundaries.

The solution contains the .NET projects under:

```text
backend/src/
backend/tests/
```

The POS and React applications remain independently manageable JavaScript/TypeScript projects.

---

# Architecture

CommerceEdge follows a layered and modular architecture.

```text
                         Clients
                            |
             +--------------+--------------+
             |                             |
             v                             v
       Commerce POS                  React Web
       TypeScript                    TypeScript
             |                             |
             +-------------+---------------+
                           |
                           v
                    CommerceEdge.Api
                      ASP.NET Core
                           |
                           v
                  Application Layer
                           |
             +-------------+-------------+
             |                           |
             v                           v
          Domain                  Infrastructure
             |                           |
             |                    SQL / Redis /
             |                    Messaging
             |
             v
       Commerce Runtime
             |
             v
        Scale Unit
             |
             v
      Hardware Station
```

---

# Dependency Direction

The backend follows controlled dependency direction.

```text
CommerceEdge.Api
       |
       +----> Application
       |
       +----> Infrastructure
                    |
                    +----> Application
                    |
                    +----> Domain

Application
       |
       +----> Domain

CommerceRuntime
       |
       +----> Domain
       |
       +----> Application

ScaleUnit
       |
       +----> CommerceRuntime
       |
       +----> Application
       |
       +----> Domain

HardwareStation
       |
       +----> Application
       |
       +----> Domain
```

The Domain layer remains independent of infrastructure concerns.

---

# Core Capabilities

## Product Management

- Product catalog
- Product variants
- Categories
- Brands
- Barcodes
- Product attributes
- Pricing
- Promotions

## Store Management

- Stores
- Channels
- Registers
- POS terminals
- Employees
- Shifts
- Till management

## Inventory

- Inventory levels
- Stock adjustments
- Stock reservations
- Transfers
- Low-stock detection
- Multi-store inventory

## Customer Management

- Customer profiles
- Customer accounts
- Customer addresses
- Customer loyalty
- Customer purchase history

## Cart & Checkout

- Cart creation
- Product scanning
- Quantity changes
- Discounts
- Promotions
- Tax calculation
- Payment
- Order completion

## Orders

- Order creation
- Order lifecycle
- Order lookup
- Order cancellation
- Returns
- Refunds

---

# POS Architecture

The POS application is designed around extension points.

```text
CommerceEdge.POS
│
├── operations
├── triggers
├── requests
├── handlers
├── views
└── services
```

### Operations

Represent business actions initiated by the POS.

Examples:

```text
CreateCustomer
ApplyDiscount
SuspendTransaction
RecallTransaction
ProcessPayment
ReturnTransaction
```

### Triggers

Used to intercept POS lifecycle events.

Examples:

```text
BeforePayment
AfterPayment
BeforeTransactionCommit
AfterTransactionCommit
BeforeCustomerCreation
```

### Requests

Represent communication between POS components and Commerce services.

```text
POS
 |
 | Request
 v
Commerce API
 |
 | Response
 v
POS
```

---

# Commerce Runtime

CommerceEdge models the Commerce Runtime as the backend business-processing layer.

```text
POS
 |
 v
Commerce API
 |
 v
Commerce Runtime
 |
 +---- Request
 |
 +---- Handler
 |
 +---- Business Logic
 |
 +---- Data Access
 |
 v
Database
```

The Commerce Runtime is implemented using **C#/.NET**.

Responsibilities include:

- Commerce requests
- Request handlers
- Business rules
- Product operations
- Inventory operations
- Customer operations
- Order processing
- Pricing
- Validation
- Transaction processing

---

# Scale Unit

The Scale Unit represents the scalable commerce service boundary between clients and backend commerce functionality.

```text
POS / Web
    |
    v
Commerce API
    |
    v
Scale Unit
    |
    v
Commerce Runtime
    |
    +---- SQL Server
    |
    +---- Redis
    |
    +---- Messaging
```

The implementation demonstrates:

- API composition
- Commerce service boundaries
- Request routing
- Authentication
- Authorization
- Resilience
- Distributed caching
- Observability

---

# Hardware Station

Hardware Station simulates the interaction between Commerce software and physical store devices.

Supported scenarios include:

```text
POS
 |
 v
Hardware Station
 |
 +---- Receipt Printer
 |
 +---- Barcode Scanner
 |
 +---- Cash Drawer
 |
 +---- Payment Terminal
```

Hardware integrations are abstracted behind interfaces so that real hardware can later be substituted for simulators.

---

# E-Commerce

The React application represents the online commerce experience.

```text
React
  |
  v
Commerce API
  |
  v
Commerce Runtime
  |
  +---- Products
  +---- Inventory
  +---- Customers
  +---- Cart
  +---- Orders
  +---- Payments
```

The e-commerce frontend supports:

- Product browsing
- Search
- Product details
- Cart
- Checkout
- Customer accounts
- Order history
- Inventory availability

---

# Domain Model

Core domain entities include:

```text
Store
Channel
Register
Employee

Product
ProductVariant
Category
Price
Promotion

Customer
CustomerAddress
LoyaltyAccount

InventoryItem
StockLevel
StockReservation

Cart
CartLine

Order
OrderLine
Payment
Refund
Return

Shift
Till
Transaction
Receipt
```

The domain model is documented under:

```text
docs/ooad/
docs/uml/
```

---

# Database

SQL Server is the primary transactional database.

Major database areas include:

```text
Catalog
Inventory
Customers
Stores
POS
Orders
Payments
Loyalty
Promotions
```

Database artifacts are maintained under:

```text
database/
├── migrations/
├── schema/
├── stored-procedures/
├── views/
└── seed/
```

Database documentation includes:

- ERD
- Logical model
- Physical model
- Index strategy
- Constraints
- Relationships
- Transaction boundaries
- Data retention considerations

---

# API Contracts

The backend exposes REST APIs using ASP.NET Core.

Example resource areas:

```text
/api/products
/api/categories
/api/inventory
/api/customers
/api/carts
/api/orders
/api/payments
/api/stores
/api/pos
```

API contracts are documented using:

- OpenAPI
- Swagger
- Scalar
- JSON request/response examples

Documentation:

```text
docs/api/
```

---

# Security

CommerceEdge uses a layered security model.

```text
Authentication
      |
      v
Authorization
      |
      v
Role / Permission
      |
      v
Commerce Operation
```

Security concerns include:

- JWT authentication
- Role-based authorization
- Permission-based authorization
- POS employee authorization
- API authorization
- Secure secrets management
- Input validation
- Rate limiting
- Audit logging
- Sensitive-data masking
- HTTPS
- Secure payment boundaries

Example roles:

```text
Admin
StoreManager
Cashier
InventoryManager
Customer
```

---

# Messaging

CommerceEdge uses asynchronous messaging for operations that do not require synchronous completion.

Example events:

```text
OrderCreated
OrderCompleted
PaymentCompleted
InventoryAdjusted
CustomerCreated
ProductUpdated
ReturnCompleted
```

Example architecture:

```text
Commerce Runtime
       |
       v
Event Publisher
       |
       v
Message Broker
       |
       +---- Inventory Consumer
       +---- Analytics Consumer
       +---- Notification Consumer
       +---- Audit Consumer
```

Messaging allows individual capabilities to evolve independently.

---

# Caching

Redis is used for distributed caching.

Potential cache targets:

```text
Product Catalog
Product Pricing
Inventory Availability
Store Configuration
Customer Sessions
Reference Data
```

Caching strategy includes:

- Cache-aside
- TTL
- Explicit invalidation
- Event-driven invalidation
- Distributed locking where required

The project avoids treating cache as the system of record.

---

# Offline POS

Retail POS systems must be resilient to network interruptions.

CommerceEdge therefore models offline POS operation.

```text
                 Internet
                    |
              +-----+-----+
              |           |
           ONLINE       OFFLINE
              |           |
              v           v
       Commerce API   Local POS Store
              |           |
              +-----+-----+
                    |
                 Sync
                    |
                    v
              Central System
```

Offline scenarios include:

- Product lookup
- Cart operations
- Transaction capture
- Customer lookup
- Payment recording
- Transaction synchronization

Conflict resolution and synchronization behavior are documented under:

```text
docs/architecture/
docs/adr/
```

---

# Payments

CommerceEdge provides a payment abstraction.

```text
POS
 |
 v
Payment Service
 |
 +---- Cash
 |
 +---- Card
 |
 +---- Mobile Money
 |
 +---- Mock Gateway
```

Payment providers are abstracted behind interfaces.

This makes it possible to develop and test the system without coupling the application directly to a production payment provider.

---

# Observability

Observability is treated as a first-class concern.

```text
Application
    |
    +---- Logs
    |
    +---- Metrics
    |
    +---- Traces
    |
    v
OpenTelemetry
    |
    +---- Prometheus
    +---- Grafana
    +---- Jaeger
```

The platform tracks:

- HTTP requests
- API latency
- Database calls
- Message processing
- Payment processing
- POS operations
- Exceptions
- Distributed traces

Structured logging is implemented using Serilog.

Sensitive information must never be written to logs.

---

# Testing Strategy

Testing is colocated with the subsystem it validates.

## Backend

```text
backend/tests/

├── CommerceEdge.UnitTests/
├── CommerceEdge.Application.IntegrationTests/
├── CommerceEdge.Api.IntegrationTests/
├── CommerceEdge.CommerceRuntime.Tests/
├── CommerceEdge.ScaleUnit.Tests/
└── CommerceEdge.ContractTests/
```

Testing layers:

```text
Unit Tests
    ↓
Integration Tests
    ↓
Contract Tests
    ↓
End-to-End Tests
```

## POS

```text
pos/CommerceEdge.POS/tests/

├── unit/
└── integration/
```

## React

```text
web/commerce-edge-web/tests/

├── unit/
├── integration/
└── e2e/
```

Testing focuses on:

- Domain rules
- Application services
- API contracts
- Commerce Runtime handlers
- POS operations
- POS triggers
- Payment workflows
- Inventory consistency
- Authentication
- Authorization
- React components
- Critical user journeys

---

# Docker

Infrastructure is isolated under:

```text
infra/
└── docker/
```

Docker Compose definitions live under:

```text
infra/compose/
```

Local infrastructure can include:

```text
SQL Server
Redis
CommerceEdge API
Prometheus
Grafana
Jaeger
Message Broker
```

Example:

```text
infra/
├── docker/
│   ├── api/
│   ├── sqlserver/
│   ├── redis/
│   ├── prometheus/
│   ├── grafana/
│   └── jaeger/
│
└── compose/
    ├── docker-compose.yml
    └── docker-compose.dev.yml
```

---

# CI/CD

GitHub Actions automates validation and delivery.

```text
Git Push
   |
   v
Build
   |
   v
Unit Tests
   |
   v
Integration Tests
   |
   v
Contract Tests
   |
   v
Security Checks
   |
   v
Docker Build
   |
   v
Artifact
   |
   v
Deployment
```

Workflows:

```text
.github/workflows/

├── ci.yml
├── backend.yml
├── frontend.yml
└── security.yml
```

---

# Deployment

The platform is designed to support multiple deployment targets.

Development:

```text
Developer Machine
      |
      v
Docker Compose
```

Containerized deployment:

```text
Container Registry
       |
       v
Container Platform
```

Future deployment targets may include:

- Azure
- Kubernetes
- Azure Container Apps
- Azure App Service
- Virtual Machines

---

# Documentation

Documentation is treated as part of the system rather than an afterthought.

```text
docs/
│
├── architecture/
├── ooad/
├── uml/
├── database/
├── api/
├── security/
├── messaging/
├── observability/
├── testing/
└── adr/
```

Expected documentation includes:

### Architecture

- Context diagram
- Container diagram
- Component diagram
- Deployment architecture
- Integration architecture

### OOAD

- Use cases
- Actors
- Domain model
- Responsibilities
- Object interactions

### UML

- Class diagrams
- Sequence diagrams
- Activity diagrams
- State diagrams
- Component diagrams
- Deployment diagrams

### Database

- ERD
- Logical data model
- Physical database model
- Indexing strategy

### API

- API contracts
- Request examples
- Response examples
- Error contracts

### Security

- Authentication model
- Authorization model
- Threat model
- Security boundaries

---

# Architecture Decision Records

Important architectural decisions are recorded under:

```text
docs/adr/
```

Example ADRs:

```text
ADR-001 Backend Architecture
ADR-002 Commerce Runtime Boundary
ADR-003 SQL Server Selection
ADR-004 Redis Caching Strategy
ADR-005 Messaging Strategy
ADR-006 POS Offline Strategy
ADR-007 Payment Abstraction
ADR-008 Authentication Strategy
ADR-009 Observability Strategy
ADR-010 Test Organization
```

---

# Development Roadmap

## Phase 1 — Architecture

- [ ] Define bounded contexts
- [ ] Define domain model
- [ ] Define architecture
- [ ] Create UML
- [ ] Create ERD
- [ ] Define API contracts
- [ ] Create ADRs

## Phase 2 — Backend Foundation

- [ ] Domain project
- [ ] Application project
- [ ] Infrastructure project
- [ ] API project
- [ ] Dependency injection
- [ ] Configuration
- [ ] Logging
- [ ] Exception handling
- [ ] Validation

## Phase 3 — Commerce

- [ ] Product catalog
- [ ] Stores
- [ ] Channels
- [ ] Customers
- [ ] Inventory
- [ ] Pricing
- [ ] Promotions
- [ ] Orders

## Phase 4 — Commerce Runtime

- [ ] Requests
- [ ] Responses
- [ ] Handlers
- [ ] Commerce entities
- [ ] Business rules
- [ ] Transaction processing

## Phase 5 — POS

- [ ] POS shell
- [ ] Custom operations
- [ ] Triggers
- [ ] Requests
- [ ] Handlers
- [ ] Views
- [ ] Services

## Phase 6 — Payments

- [ ] Payment abstraction
- [ ] Cash
- [ ] Card simulation
- [ ] Mobile money simulation
- [ ] Refunds
- [ ] Payment reconciliation

## Phase 7 — Hardware

- [ ] Barcode scanner simulation
- [ ] Receipt printer simulation
- [ ] Cash drawer simulation
- [ ] Payment terminal simulation
- [ ] Hardware Station abstraction

## Phase 8 — E-Commerce

- [ ] React application
- [ ] Product catalog
- [ ] Search
- [ ] Cart
- [ ] Checkout
- [ ] Customer accounts
- [ ] Order history

## Phase 9 — Distributed Systems

- [ ] Redis
- [ ] Messaging
- [ ] Event publishing
- [ ] Event consumers
- [ ] Retry policies
- [ ] Idempotency
- [ ] Offline synchronization

## Phase 10 — Production Engineering

- [ ] OpenTelemetry
- [ ] Prometheus
- [ ] Grafana
- [ ] Jaeger
- [ ] Docker
- [ ] CI/CD
- [ ] Security scanning
- [ ] Performance testing

---

# Learning Objectives

This project is intended to build practical understanding of:

### C# / .NET

- ASP.NET Core
- Dependency Injection
- Middleware
- REST APIs
- Domain-driven design
- Application services
- Infrastructure abstractions
- Async programming
- Resilience
- Distributed systems

### Dynamics 365 Commerce Concepts

- POS extensions
- Commerce Runtime
- Commerce APIs
- Scale Unit
- Hardware Station
- Commerce channels
- Store operations
- Offline POS
- Commerce integrations

### TypeScript

- Strong typing
- Interfaces
- Generics
- Async programming
- API integration
- Client architecture
- Extension patterns

### React

- Component architecture
- Hooks
- Routing
- Server state
- Forms
- API integration
- E-commerce UX

### Enterprise Engineering

- Architecture
- OOAD
- UML
- API contracts
- Database design
- Security
- Messaging
- Caching
- Observability
- Testing
- CI/CD
- Docker

---

# Why This Project?

CommerceEdge is deliberately more ambitious than a traditional portfolio CRUD application.

Instead of:

```text
Product CRUD
Customer CRUD
Order CRUD
```

the project explores:

```text
POS
 |
Commerce Runtime
 |
Commerce APIs
 |
Scale Unit
 |
Database
 |
Messaging
 |
Caching
 |
Payments
 |
Hardware
 |
Offline synchronization
 |
E-Commerce
 |
Observability
 |
CI/CD
```

This provides a practical environment for learning the architectural concepts used in enterprise retail commerce platforms.

---

# Dynamics 365 Commerce Relationship

CommerceEdge is **inspired by Dynamics 365 Commerce architecture and development concepts**.

It is **not an implementation of Microsoft's proprietary Dynamics 365 Commerce platform**, nor does it reproduce Microsoft's proprietary source code.

The project exists to develop transferable skills around:

```text
C#/.NET
        +
TypeScript
        +
POS Architecture
        +
Commerce Runtime Concepts
        +
Commerce APIs
        +
Scale Unit Concepts
        +
Hardware Integration
        +
React
        +
SQL Server
```

For actual Dynamics 365 Commerce development, the official Microsoft Commerce SDK and documentation should be used alongside this project.

---

# Recommended Learning Path

```text
C# / .NET
   ↓
ASP.NET Core
   ↓
SQL Server
   ↓
REST APIs
   ↓
Dynamics 365 Commerce Concepts
   ↓
Commerce Runtime
   ↓
Commerce SDK
   ↓
TypeScript
   ↓
POS Extensions
   ↓
Scale Unit
   ↓
Hardware Station
   ↓
React
   ↓
E-Commerce
   ↓
Offline POS
   ↓
Messaging
   ↓
Observability
   ↓
CI/CD
```

---

# Project Status

🚧 **Active Learning & Development Project**

CommerceEdge is being developed incrementally, with architecture and documentation preceding implementation.

The project prioritizes:

- Correct architectural boundaries
- Maintainable code
- Explicit contracts
- Testability
- Security
- Observability
- Realistic retail workflows
- Production-oriented engineering

---

# License

This project is intended for educational and portfolio purposes.

See `LICENSE` for details.