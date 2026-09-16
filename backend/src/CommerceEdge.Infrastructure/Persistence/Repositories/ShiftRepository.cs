using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CommerceEdge.Infrastructure.Persistence.Repositories;

/// <summary>
/// Entity Framework implementation of <see cref="IShiftRepository"/>.
/// </summary>
internal sealed class ShiftRepository(AppDbContext db) : IShiftRepository
{
    public Task<Shift?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Shifts.Include(s => s.Transactions).FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<Shift?> GetOpenShiftAsync(Guid registerId, CancellationToken ct = default)
        => db.Shifts.Include(s => s.Transactions).FirstOrDefaultAsync(s => s.RegisterId == registerId && s.Status == ShiftStatus.Open, ct);

    public async Task<IReadOnlyList<Shift>> GetByStoreAsync(Guid storeId, CancellationToken ct = default)
        => await db.Shifts.Include(s => s.Transactions).Where(s => s.StoreId == storeId).ToListAsync(ct);

    public async Task<IReadOnlyList<Shift>> ListAsync(Guid storeId, int page, int pageSize, CancellationToken ct = default)
        => await db.Shifts.Include(s => s.Transactions).Where(s => s.StoreId == storeId)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

    public async Task AddAsync(Shift entity, CancellationToken ct = default) => await db.Shifts.AddAsync(entity, ct);
    public Task UpdateAsync(Shift entity, CancellationToken ct = default) { db.Shifts.Update(entity); return Task.CompletedTask; }
    public Task DeleteAsync(Shift entity, CancellationToken ct = default) { db.Shifts.Remove(entity); return Task.CompletedTask; }
}
