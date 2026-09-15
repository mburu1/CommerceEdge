using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CommerceEdge.Infrastructure.Persistence.Repositories;

internal sealed class StoreRepository(AppDbContext db) : IStoreRepository
{
    public Task<Store?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Stores.Include(s => s.Registers).FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<Store?> GetByStoreNumberAsync(string storeNumber, CancellationToken ct = default)
        => db.Stores.Include(s => s.Registers).FirstOrDefaultAsync(s => s.StoreNumber == storeNumber, ct);

    public async Task<IReadOnlyList<Store>> GetAllActiveAsync(CancellationToken ct = default)
        => await db.Stores.Include(s => s.Registers).Where(s => s.Status == StoreStatus.Active).ToListAsync(ct);

    public async Task<IReadOnlyList<Store>> ListAsync(int page, int pageSize, CancellationToken ct = default)
        => await db.Stores.Include(s => s.Registers).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

    public async Task AddAsync(Store entity, CancellationToken ct = default) => await db.Stores.AddAsync(entity, ct);
    public Task UpdateAsync(Store entity, CancellationToken ct = default) { db.Stores.Update(entity); return Task.CompletedTask; }
    public Task DeleteAsync(Store entity, CancellationToken ct = default) { db.Stores.Remove(entity); return Task.CompletedTask; }
}
