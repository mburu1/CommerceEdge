using CommerceEdge.Domain.Enums;

namespace CommerceEdge.Application.Commands;

public record CreateOrderCommand(
    string OrderNumber,
    Guid StoreId,
    string Currency,
    Guid? CustomerId,
    Guid? CartId);

public record AddOrderLineCommand(
    Guid OrderId,
    Guid ProductId,
    Guid? VariantId,
    string ProductName,
    string Sku,
    decimal UnitPrice,
    string Currency,
    int Quantity);

public record ConfirmOrderCommand(Guid OrderId);

public record CancelOrderCommand(Guid OrderId);

public record AddOrderPaymentCommand(
    Guid OrderId,
    PaymentMethod Method,
    decimal Amount,
    string Currency);

public record SetOrderShippingAddressCommand(
    Guid OrderId,
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country);
