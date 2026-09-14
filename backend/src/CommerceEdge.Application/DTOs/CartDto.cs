namespace CommerceEdge.Application.DTOs;

public record CartDto(
    Guid Id,
    Guid StoreId,
    Guid? CustomerId,
    string Currency,
    string Status,
    decimal Subtotal,
    IReadOnlyList<CartLineDto> Lines);

public record CartLineDto(
    Guid Id,
    Guid ProductId,
    Guid? VariantId,
    string ProductName,
    string Sku,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal);
