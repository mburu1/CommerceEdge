using CommerceEdge.Domain.Common;

namespace CommerceEdge.Domain.Events;

public sealed record ShiftOpenedEvent(Guid ShiftId, Guid StoreId, Guid RegisterId, Guid EmployeeId) : DomainEvent;
public sealed record ShiftClosedEvent(Guid ShiftId, Guid StoreId, Guid RegisterId) : DomainEvent;
