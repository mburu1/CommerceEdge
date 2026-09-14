namespace CommerceEdge.Application.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string Sku,
    string? Description,
    decimal BasePrice,
    string Currency,
    string Status,
    IReadOnlyList<ProductVariantDto> Variants,
    IReadOnlyList<string> Categories);

public record ProductVariantDto(
    Guid Id,
    string Sku,
    string Name,
    decimal Price,
    string Currency);
