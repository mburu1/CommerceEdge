namespace CommerceEdge.CommerceRuntime.Entities;

/// <summary>
/// Represents the active runtime state of a POS session on a register.
/// Held in memory during a transaction; not a domain aggregate.
/// </summary>
public sealed class CommerceSession
{
    public Guid SessionId { get; init; } = Guid.NewGuid();
    public Guid StoreId { get; init; }
    public Guid RegisterId { get; init; }
    public Guid EmployeeId { get; init; }
    public Guid? ShiftId { get; set; }
    public Guid? ActiveCartId { get; set; }
    public Guid? AttachedCustomerId { get; set; }
    public DateTime StartedAt { get; init; } = DateTime.UtcNow;
    public bool IsShiftOpen => ShiftId.HasValue;
}
