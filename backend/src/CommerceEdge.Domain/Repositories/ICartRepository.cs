using CommerceEdge.Domain.Aggregates;

namespace CommerceEdge.Domain.Repositories;

public interface ICartRepository : IRepository<Cart>
{
    Task<Cart?> GetActiveCartForCustomerAsync(Guid customerId, Guid storeId, CancellationToken ct = default);
}
