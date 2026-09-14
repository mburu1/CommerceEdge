using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;

namespace CommerceEdge.Domain.Repositories;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<Customer?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<Customer>> ListAsync(int page, int pageSize, CustomerStatus? status, CancellationToken ct = default);
}
