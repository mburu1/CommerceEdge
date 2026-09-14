using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;

namespace CommerceEdge.Domain.Repositories;

public interface IOrderRepository : IRepository<Order>
{
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetByCustomerAsync(Guid customerId, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetByStoreAsync(Guid storeId, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> ListAsync(int page, int pageSize, Guid? customerId, Guid? storeId, OrderStatus? status, CancellationToken ct = default);
}
