using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Events;

public sealed record OrderCreatedEvent(Guid OrderId, string OrderNumber, Guid StoreId) : DomainEvent;
public sealed record OrderConfirmedEvent(Guid OrderId, string OrderNumber) : DomainEvent;
public sealed record OrderCancelledEvent(Guid OrderId, string OrderNumber) : DomainEvent;
public sealed record OrderPaymentAddedEvent(Guid OrderId, Guid PaymentId, Money Amount) : DomainEvent;
