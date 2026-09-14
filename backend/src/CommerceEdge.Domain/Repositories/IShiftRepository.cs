using CommerceEdge.Domain.Aggregates;

namespace CommerceEdge.Domain.Repositories;

public interface IShiftRepository : IRepository<Shift>
{
    Task<Shift?> GetOpenShiftAsync(Guid registerId, CancellationToken ct = default);
    Task<IReadOnlyList<Shift>> GetByStoreAsync(Guid storeId, CancellationToken ct = default);
    Task<IReadOnlyList<Shift>> ListAsync(Guid storeId, int page, int pageSize, CancellationToken ct = default);
}
