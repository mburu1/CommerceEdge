using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Entities;

public sealed class ProductVariant : Entity
{
    public Guid ProductId { get; private set; }
    public string Sku { get; private set; }
    public string Name { get; private set; }
    public Money Price { get; private set; }

    private ProductVariant() { Sku = default!; Name = default!; Price = default!; }

    internal static ProductVariant Create(Guid productId, string sku, string name, Money price)
    {
        if (string.IsNullOrWhiteSpace(sku)) { throw new DomainException("Variant SKU is required."); }
        return new ProductVariant { ProductId = productId, Sku = sku.ToUpperInvariant(), Name = name, Price = price };
    }

    public void UpdatePrice(Money price) => Price = price;
}
