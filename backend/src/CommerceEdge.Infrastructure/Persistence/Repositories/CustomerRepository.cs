using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CommerceEdge.Infrastructure.Persistence.Repositories;

internal sealed class CustomerRepository(AppDbContext db) : ICustomerRepository
{
    public Task<Customer?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Customers.Include(c => c.Addresses).Include(c => c.LoyaltyAccount).FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<Customer?> GetByEmailAsync(string email, CancellationToken ct = default)
        => db.Customers.Include(c => c.Addresses).Include(c => c.LoyaltyAccount).FirstOrDefaultAsync(c => c.Email.Value == email.ToLowerInvariant(), ct);

    public async Task<IReadOnlyList<Customer>> ListAsync(int page, int pageSize, CustomerStatus? status, CancellationToken ct = default)
    {
        var q = db.Customers.Include(c => c.Addresses).Include(c => c.LoyaltyAccount).AsQueryable();
        if (status.HasValue) { q = q.Where(c => c.Status == status.Value); }
        return await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task AddAsync(Customer entity, CancellationToken ct = default) => await db.Customers.AddAsync(entity, ct);
    public Task UpdateAsync(Customer entity, CancellationToken ct = default) { db.Customers.Update(entity); return Task.CompletedTask; }
    public Task DeleteAsync(Customer entity, CancellationToken ct = default) { db.Customers.Remove(entity); return Task.CompletedTask; }
}
