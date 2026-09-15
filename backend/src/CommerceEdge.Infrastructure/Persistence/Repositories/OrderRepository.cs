using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CommerceEdge.Infrastructure.Persistence.Repositories;

internal sealed class OrderRepository(AppDbContext db) : IOrderRepository
{
    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Orders.Include(o => o.Lines).Include(o => o.Payments).FirstOrDefaultAsync(o => o.Id == id, ct);

    public Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default)
        => db.Orders.Include(o => o.Lines).Include(o => o.Payments).FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);

    public async Task<IReadOnlyList<Order>> GetByCustomerAsync(Guid customerId, CancellationToken ct = default)
        => await db.Orders.Where(o => o.CustomerId == customerId).ToListAsync(ct);

    public async Task<IReadOnlyList<Order>> GetByStoreAsync(Guid storeId, CancellationToken ct = default)
        => await db.Orders.Where(o => o.StoreId == storeId).ToListAsync(ct);

    public async Task<IReadOnlyList<Order>> ListAsync(int page, int pageSize, Guid? customerId, Guid? storeId, OrderStatus? status, CancellationToken ct = default)
    {
        var q = db.Orders.Include(o => o.Lines).Include(o => o.Payments).AsQueryable();
        if (customerId.HasValue) { q = q.Where(o => o.CustomerId == customerId.Value); }
        if (storeId.HasValue) { q = q.Where(o => o.StoreId == storeId.Value); }
        if (status.HasValue) { q = q.Where(o => o.Status == status.Value); }
        return await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task AddAsync(Order entity, CancellationToken ct = default) => await db.Orders.AddAsync(entity, ct);
    public Task UpdateAsync(Order entity, CancellationToken ct = default) { db.Orders.Update(entity); return Task.CompletedTask; }
    public Task DeleteAsync(Order entity, CancellationToken ct = default) { db.Orders.Remove(entity); return Task.CompletedTask; }
}
