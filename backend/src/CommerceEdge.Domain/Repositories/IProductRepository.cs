using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;

namespace CommerceEdge.Domain.Repositories;

public interface IProductRepository : IRepository<Product>
{
    Task<Product?> GetBySkuAsync(string sku, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> GetByCategoryAsync(Guid categoryId, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> ListAsync(int page, int pageSize, ProductStatus? status, Guid? categoryId, CancellationToken ct = default);
}
