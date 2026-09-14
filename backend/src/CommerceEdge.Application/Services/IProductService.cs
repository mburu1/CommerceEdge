using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;

namespace CommerceEdge.Application.Services;

public interface IProductService
{
    Task<ProductDto> CreateAsync(CreateProductCommand command, CancellationToken ct = default);
    Task PublishAsync(PublishProductCommand command, CancellationToken ct = default);
    Task DiscontinueAsync(DiscontinueProductCommand command, CancellationToken ct = default);
    Task UpdatePriceAsync(UpdateProductPriceCommand command, CancellationToken ct = default);
    Task<ProductDto> AddVariantAsync(AddProductVariantCommand command, CancellationToken ct = default);
    Task<ProductDto?> GetByIdAsync(GetProductByIdQuery query, CancellationToken ct = default);
    Task<ProductDto?> GetBySkuAsync(GetProductBySkuQuery query, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> ListAsync(ListProductsQuery query, CancellationToken ct = default);
}
