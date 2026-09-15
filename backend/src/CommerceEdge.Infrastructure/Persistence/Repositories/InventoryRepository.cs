using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CommerceEdge.Infrastructure.Persistence.Repositories;

internal sealed class InventoryRepository(AppDbContext db) : IInventoryRepository
{
    public Task<InventoryItem?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.InventoryItems.FirstOrDefaultAsync(i => i.Id == id, ct);

    public Task<InventoryItem?> GetBySkuAndStoreAsync(string sku, Guid storeId, CancellationToken ct = default)
        => db.InventoryItems.FirstOrDefaultAsync(i => i.Sku == sku.ToUpperInvariant() && i.StoreId == storeId, ct);

    public async Task<IReadOnlyList<InventoryItem>> GetLowStockAsync(Guid storeId, CancellationToken ct = default)
        => await db.InventoryItems.Where(i => i.StoreId == storeId && i.Status == InventoryStatus.LowStock).ToListAsync(ct);

    public async Task<IReadOnlyList<InventoryItem>> ListAsync(Guid storeId, int page, int pageSize, InventoryStatus? status, CancellationToken ct = default)
    {
        var q = db.InventoryItems.Where(i => i.StoreId == storeId);
        if (status.HasValue) { q = q.Where(i => i.Status == status.Value); }
        return await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task AddAsync(InventoryItem entity, CancellationToken ct = default) => await db.InventoryItems.AddAsync(entity, ct);
    public Task UpdateAsync(InventoryItem entity, CancellationToken ct = default) { db.InventoryItems.Update(entity); return Task.CompletedTask; }
    public Task DeleteAsync(InventoryItem entity, CancellationToken ct = default) { db.InventoryItems.Remove(entity); return Task.CompletedTask; }
}
