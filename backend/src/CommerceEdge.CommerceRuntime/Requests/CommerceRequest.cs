namespace CommerceEdge.CommerceRuntime.Requests;

/// <summary>
/// Base for all commerce requests. Carries the execution context from the POS.
/// </summary>
public abstract record CommerceRequest
{
    public Guid RequestId { get; init; } = Guid.NewGuid();
    public Guid StoreId { get; init; }
    public Guid RegisterId { get; init; }
    public Guid EmployeeId { get; init; }
    public string Currency { get; init; } = "USD";
}
