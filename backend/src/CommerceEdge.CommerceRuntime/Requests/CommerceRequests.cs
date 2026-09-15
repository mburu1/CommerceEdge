using CommerceEdge.Domain.Enums;

namespace CommerceEdge.CommerceRuntime.Requests;

// ── Cart ─────────────────────────────────────────────────────────────────────

public sealed record StartTransactionRequest : CommerceRequest
{
    public Guid? CustomerId { get; init; }
}

public sealed record AddItemRequest : CommerceRequest
{
    public required Guid CartId { get; init; }
    public required string Sku { get; init; }
    public int Quantity { get; init; } = 1;
}

public sealed record RemoveItemRequest : CommerceRequest
{
    public required Guid CartId { get; init; }
    public required Guid LineId { get; init; }
}

public sealed record VoidTransactionRequest : CommerceRequest
{
    public required Guid CartId { get; init; }
}

// ── Checkout ─────────────────────────────────────────────────────────────────

public sealed record CheckoutRequest : CommerceRequest
{
    public required Guid CartId { get; init; }
    public required string OrderNumber { get; init; }
}

public sealed record TenderPaymentRequest : CommerceRequest
{
    public required Guid OrderId { get; init; }
    public PaymentMethod Method { get; init; }
    public decimal Amount { get; init; }
}

// ── Customer ─────────────────────────────────────────────────────────────────

public sealed record LookupCustomerRequest : CommerceRequest
{
    public required string Email { get; init; }
}

public sealed record AttachCustomerRequest : CommerceRequest
{
    public required Guid CartId { get; init; }
    public required Guid CustomerId { get; init; }
}

// ── Shift ────────────────────────────────────────────────────────────────────

public sealed record OpenShiftRequest : CommerceRequest
{
    public decimal OpeningFloat { get; init; }
}

public sealed record CloseShiftRequest : CommerceRequest
{
    public required Guid ShiftId { get; init; }
    public decimal ClosingFloat { get; init; }
}

// ── Inventory ────────────────────────────────────────────────────────────────

public sealed record CheckStockRequest : CommerceRequest
{
    public required string Sku { get; init; }
}
