namespace CommerceEdge.Application.DTOs;

public record InventoryDto(
    Guid Id,
    Guid ProductId,
    Guid? VariantId,
    Guid StoreId,
    string Sku,
    int QuantityOnHand,
    int QuantityReserved,
    int QuantityAvailable,
    int ReorderPoint,
    string Status);
