using CommerceEdge.Application.DTOs;
using CommerceEdge.CommerceRuntime.Entities;

namespace CommerceEdge.CommerceRuntime.Responses;

// ── Cart ─────────────────────────────────────────────────────────────────────

public sealed record StartTransactionResponse : CommerceResponse
{
    public CartDto? Cart { get; init; }
}

public sealed record AddItemResponse : CommerceResponse
{
    public CartDto? Cart { get; init; }
}

public sealed record RemoveItemResponse : CommerceResponse
{
    public CartDto? Cart { get; init; }
}

public sealed record VoidTransactionResponse : CommerceResponse;

// ── Checkout ─────────────────────────────────────────────────────────────────

public sealed record CheckoutResponse : CommerceResponse
{
    public OrderDto? Order { get; init; }
}

public sealed record TenderPaymentResponse : CommerceResponse
{
    public OrderDto? Order { get; init; }
    public Receipt? Receipt { get; init; }
}

// ── Customer ─────────────────────────────────────────────────────────────────

public sealed record LookupCustomerResponse : CommerceResponse
{
    public CustomerDto? Customer { get; init; }
}

public sealed record AttachCustomerResponse : CommerceResponse
{
    public CartDto? Cart { get; init; }
}

// ── Shift ────────────────────────────────────────────────────────────────────

public sealed record OpenShiftResponse : CommerceResponse
{
    public ShiftDto? Shift { get; init; }
}

public sealed record CloseShiftResponse : CommerceResponse
{
    public ShiftDto? Shift { get; init; }
}

// ── Inventory ────────────────────────────────────────────────────────────────

public sealed record CheckStockResponse : CommerceResponse
{
    public InventoryDto? Inventory { get; init; }
}
