using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;

namespace CommerceEdge.Domain.Repositories;

public interface IInventoryRepository : IRepository<InventoryItem>
{
    Task<InventoryItem?> GetBySkuAndStoreAsync(string sku, Guid storeId, CancellationToken ct = default);
    Task<IReadOnlyList<InventoryItem>> GetLowStockAsync(Guid storeId, CancellationToken ct = default);
    Task<IReadOnlyList<InventoryItem>> ListAsync(Guid storeId, int page, int pageSize, InventoryStatus? status, CancellationToken ct = default);
}
