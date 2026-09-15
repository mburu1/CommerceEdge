using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CommerceEdge.Infrastructure.Persistence.Repositories;

internal sealed class CartRepository(AppDbContext db) : ICartRepository
{
    public Task<Cart?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Carts.Include(c => c.Lines).FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<Cart?> GetActiveCartForCustomerAsync(Guid customerId, Guid storeId, CancellationToken ct = default)
        => db.Carts.Include(c => c.Lines).FirstOrDefaultAsync(c => c.CustomerId == customerId && c.StoreId == storeId && c.Status == CartStatus.Active, ct);

    public async Task AddAsync(Cart entity, CancellationToken ct = default) => await db.Carts.AddAsync(entity, ct);
    public Task UpdateAsync(Cart entity, CancellationToken ct = default) { db.Carts.Update(entity); return Task.CompletedTask; }
    public Task DeleteAsync(Cart entity, CancellationToken ct = default) { db.Carts.Remove(entity); return Task.CompletedTask; }
}
