using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Entities;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Events;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Aggregates;

public sealed class Product : AggregateRoot
{
    private readonly List<ProductVariant> _variants = [];
    private readonly List<Category> _categories = [];

    public string Name { get; private set; }
    public string Sku { get; private set; }
    public string? Description { get; private set; }
    public Money BasePrice { get; private set; }
    public ProductStatus Status { get; private set; }
    public IReadOnlyList<ProductVariant> Variants => _variants.AsReadOnly();
    public IReadOnlyList<Category> Categories => _categories.AsReadOnly();

    private Product() { Name = default!; Sku = default!; BasePrice = default!; }

    public static Product Create(string name, string sku, Money basePrice, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name)) { throw new DomainException("Product name is required."); }
        if (string.IsNullOrWhiteSpace(sku)) { throw new DomainException("SKU is required."); }

        var product = new Product
        {
            Name = name,
            Sku = sku.ToUpperInvariant(),
            BasePrice = basePrice,
            Description = description,
            Status = ProductStatus.Draft
        };

        product.Raise(new ProductCreatedEvent(product.Id, sku));
        return product;
    }

    public void Publish()
    {
        if (Status == ProductStatus.Active) { return; }
        Status = ProductStatus.Active;
        Raise(new ProductPublishedEvent(Id));
    }

    public void Discontinue()
    {
        Status = ProductStatus.Discontinued;
        Raise(new ProductDiscontinuedEvent(Id));
    }

    public void UpdatePrice(Money newPrice)
    {
        BasePrice = newPrice;
        Raise(new ProductPriceChangedEvent(Id, newPrice));
    }

    public ProductVariant AddVariant(string sku, string name, Money? price = null)
    {
        if (_variants.Any(v => v.Sku == sku.ToUpperInvariant()))
        {
            throw new DomainException($"Variant SKU '{sku}' already exists.");
        }

        var variant = ProductVariant.Create(Id, sku, name, price ?? BasePrice);
        _variants.Add(variant);
        return variant;
    }

    public void AssignCategory(Category category)
    {
        if (!_categories.Contains(category))
        {
            _categories.Add(category);
        }
    }
}
