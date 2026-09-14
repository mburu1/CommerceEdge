namespace CommerceEdge.Application.Commands;

public record CreateCartCommand(Guid StoreId, string Currency, Guid? CustomerId);

public record AddCartLineCommand(
    Guid CartId,
    Guid ProductId,
    Guid? VariantId,
    string ProductName,
    string Sku,
    decimal UnitPrice,
    string Currency,
    int Quantity);

public record RemoveCartLineCommand(Guid CartId, Guid LineId);

public record CheckoutCartCommand(Guid CartId);

public record AbandonCartCommand(Guid CartId);
