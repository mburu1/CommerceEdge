namespace CommerceEdge.Application.Queries;

public record GetInventoryByIdQuery(Guid InventoryItemId);

public record GetInventoryBySkuQuery(Guid StoreId, string Sku);

public record ListInventoryQuery(Guid StoreId, int Page = 1, int PageSize = 20, string? Status = null);
