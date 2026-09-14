using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Events;

public sealed record ProductCreatedEvent(Guid ProductId, string Sku) : DomainEvent;
public sealed record ProductPublishedEvent(Guid ProductId) : DomainEvent;
public sealed record ProductDiscontinuedEvent(Guid ProductId) : DomainEvent;
public sealed record ProductPriceChangedEvent(Guid ProductId, Money NewPrice) : DomainEvent;
