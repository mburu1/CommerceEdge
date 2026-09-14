using CommerceEdge.Domain.Common;

namespace CommerceEdge.Domain.Events;

public sealed record StoreCreatedEvent(Guid StoreId, string StoreNumber) : DomainEvent;
public sealed record StoreDeactivatedEvent(Guid StoreId) : DomainEvent;
