using CommerceEdge.Domain.Aggregates;

namespace CommerceEdge.Domain.Repositories;

public interface IStoreRepository : IRepository<Store>
{
    Task<Store?> GetByStoreNumberAsync(string storeNumber, CancellationToken ct = default);
    Task<IReadOnlyList<Store>> GetAllActiveAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Store>> ListAsync(int page, int pageSize, CancellationToken ct = default);
}
