namespace CommerceEdge.Application.DTOs;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    Guid StoreId,
    Guid? CustomerId,
    string Status,
    string Currency,
    decimal Subtotal,
    decimal TaxAmount,
    decimal Total,
    AddressDto? ShippingAddress,
    IReadOnlyList<OrderLineDto> Lines,
    IReadOnlyList<OrderPaymentDto> Payments);

public record OrderLineDto(
    Guid Id,
    Guid ProductId,
    Guid? VariantId,
    string ProductName,
    string Sku,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal,
    string Status);

public record OrderPaymentDto(
    Guid Id,
    string Method,
    decimal Amount,
    string Currency,
    string Status);

public record AddressDto(
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country);
