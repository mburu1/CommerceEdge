using CommerceEdge.Domain.Common;

namespace CommerceEdge.Domain.Events;

public sealed record CustomerCreatedEvent(Guid CustomerId, string Email) : DomainEvent;
public sealed record CustomerLoyaltyEnrolledEvent(Guid CustomerId, Guid LoyaltyAccountId) : DomainEvent;
