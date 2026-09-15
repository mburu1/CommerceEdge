using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CommerceEdge.Infrastructure.Persistence.Repositories;

internal sealed class ProductRepository(AppDbContext db) : IProductRepository
{
    public Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Products.Include(p => p.Variants).Include(p => p.Categories).FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<Product?> GetBySkuAsync(string sku, CancellationToken ct = default)
        => db.Products.Include(p => p.Variants).Include(p => p.Categories).FirstOrDefaultAsync(p => p.Sku == sku.ToUpperInvariant(), ct);

    public Task<IReadOnlyList<Product>> GetByCategoryAsync(Guid categoryId, CancellationToken ct = default)
        => ListByQueryAsync(db.Products.Where(p => p.Categories.Any(c => c.Id == categoryId)), ct);

    public Task<IReadOnlyList<Product>> ListAsync(int page, int pageSize, ProductStatus? status, Guid? categoryId, CancellationToken ct = default)
    {
        var q = db.Products.Include(p => p.Variants).Include(p => p.Categories).AsQueryable();
        if (status.HasValue) { q = q.Where(p => p.Status == status.Value); }
        if (categoryId.HasValue) { q = q.Where(p => p.Categories.Any(c => c.Id == categoryId.Value)); }
        return ListByQueryAsync(q.Skip((page - 1) * pageSize).Take(pageSize), ct);
    }

    public async Task AddAsync(Product entity, CancellationToken ct = default) => await db.Products.AddAsync(entity, ct);
    public Task UpdateAsync(Product entity, CancellationToken ct = default) { db.Products.Update(entity); return Task.CompletedTask; }
    public Task DeleteAsync(Product entity, CancellationToken ct = default) { db.Products.Remove(entity); return Task.CompletedTask; }

    private static async Task<IReadOnlyList<Product>> ListByQueryAsync(IQueryable<Product> q, CancellationToken ct)
        => await q.ToListAsync(ct);
}
