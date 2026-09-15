namespace CommerceEdge.CommerceRuntime.Entities;

/// <summary>
/// A receipt generated at the point of sale after a successful tender.
/// This is a runtime projection — not persisted as a domain aggregate.
/// </summary>
public sealed class Receipt
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string OrderNumber { get; init; } = default!;
    public Guid StoreId { get; init; }
    public Guid RegisterId { get; init; }
    public Guid? CustomerId { get; init; }
    public DateTime IssuedAt { get; init; } = DateTime.UtcNow;
    public decimal Subtotal { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal Total { get; init; }
    public string Currency { get; init; } = default!;
    public IReadOnlyList<ReceiptLine> Lines { get; init; } = [];
    public IReadOnlyList<ReceiptPayment> Payments { get; init; } = [];
}

public sealed class ReceiptLine
{
    public string ProductName { get; init; } = default!;
    public string Sku { get; init; } = default!;
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }
}

public sealed class ReceiptPayment
{
    public string Method { get; init; } = default!;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = default!;
}
