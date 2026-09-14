namespace CommerceEdge.Application.Commands;

public record CreateProductCommand(
    string Name,
    string Sku,
    decimal BasePrice,
    string Currency,
    string? Description);

public record PublishProductCommand(Guid ProductId);

public record DiscontinueProductCommand(Guid ProductId);

public record UpdateProductPriceCommand(Guid ProductId, decimal NewPrice, string Currency);

public record AddProductVariantCommand(
    Guid ProductId,
    string Sku,
    string Name,
    decimal? Price,
    string Currency);
