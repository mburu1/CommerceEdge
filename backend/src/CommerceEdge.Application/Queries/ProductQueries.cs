namespace CommerceEdge.Application.Queries;

public record GetProductByIdQuery(Guid ProductId);

public record GetProductBySkuQuery(string Sku);

public record ListProductsQuery(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    Guid? CategoryId = null);
