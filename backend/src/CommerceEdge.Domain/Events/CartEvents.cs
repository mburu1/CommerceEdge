using CommerceEdge.Domain.Common;

namespace CommerceEdge.Domain.Events;

public sealed record CartCreatedEvent(Guid CartId, Guid StoreId) : DomainEvent;
public sealed record CartLineAddedEvent(Guid CartId, Guid ProductId, int Quantity) : DomainEvent;
public sealed record CartCheckedOutEvent(Guid CartId) : DomainEvent;
