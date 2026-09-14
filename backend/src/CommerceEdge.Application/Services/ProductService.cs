using CommerceEdge.Application.Abstractions;
using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.Repositories;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Application.Services;

public sealed class ProductService(
    IProductRepository products,
    IUnitOfWork uow,
    IDomainEventDispatcher dispatcher) : IProductService
{
    public async Task<ProductDto> CreateAsync(CreateProductCommand cmd, CancellationToken ct = default)
    {
        var price = new Money(cmd.BasePrice, cmd.Currency);
        var product = Product.Create(cmd.Name, cmd.Sku, price, cmd.Description);
        await products.AddAsync(product, ct);
        await SaveAndDispatchAsync(product, ct);
        return Map(product);
    }

    public async Task PublishAsync(PublishProductCommand cmd, CancellationToken ct = default)
    {
        var product = await GetOrThrowAsync(cmd.ProductId, ct);
        product.Publish();
        await products.UpdateAsync(product, ct);
        await SaveAndDispatchAsync(product, ct);
    }

    public async Task DiscontinueAsync(DiscontinueProductCommand cmd, CancellationToken ct = default)
    {
        var product = await GetOrThrowAsync(cmd.ProductId, ct);
        product.Discontinue();
        await products.UpdateAsync(product, ct);
        await SaveAndDispatchAsync(product, ct);
    }

    public async Task UpdatePriceAsync(UpdateProductPriceCommand cmd, CancellationToken ct = default)
    {
        var product = await GetOrThrowAsync(cmd.ProductId, ct);
        product.UpdatePrice(new Money(cmd.NewPrice, cmd.Currency));
        await products.UpdateAsync(product, ct);
        await SaveAndDispatchAsync(product, ct);
    }

    public async Task<ProductDto> AddVariantAsync(AddProductVariantCommand cmd, CancellationToken ct = default)
    {
        var product = await GetOrThrowAsync(cmd.ProductId, ct);
        var price = cmd.Price.HasValue ? new Money(cmd.Price.Value, cmd.Currency) : null;
        product.AddVariant(cmd.Sku, cmd.Name, price);
        await products.UpdateAsync(product, ct);
        await SaveAndDispatchAsync(product, ct);
        return Map(product);
    }

    public async Task<ProductDto?> GetByIdAsync(GetProductByIdQuery query, CancellationToken ct = default)
    {
        var product = await products.GetByIdAsync(query.ProductId, ct);
        return product is null ? null : Map(product);
    }

    public async Task<ProductDto?> GetBySkuAsync(GetProductBySkuQuery query, CancellationToken ct = default)
    {
        var product = await products.GetBySkuAsync(query.Sku, ct);
        return product is null ? null : Map(product);
    }

    public async Task<IReadOnlyList<ProductDto>> ListAsync(ListProductsQuery query, CancellationToken ct = default)
    {
        var status = query.Status is not null && Enum.TryParse<ProductStatus>(query.Status, out var s) ? s : (ProductStatus?)null;
        var list = await products.ListAsync(query.Page, query.PageSize, status, query.CategoryId, ct);
        return list.Select(Map).ToList();
    }

    private async Task<Product> GetOrThrowAsync(Guid id, CancellationToken ct)
        => await products.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Product), id);

    private async Task SaveAndDispatchAsync(Product product, CancellationToken ct)
    {
        await uow.SaveChangesAsync(ct);
        await dispatcher.DispatchAsync(product.DomainEvents, ct);
        product.ClearDomainEvents();
    }

    private static ProductDto Map(Product p) => new(
        p.Id, p.Name, p.Sku, p.Description,
        p.BasePrice.Amount, p.BasePrice.Currency,
        p.Status.ToString(),
        p.Variants.Select(v => new ProductVariantDto(v.Id, v.Sku, v.Name, v.Price.Amount, v.Price.Currency)).ToList(),
        p.Categories.Select(c => c.Name).ToList());
}
