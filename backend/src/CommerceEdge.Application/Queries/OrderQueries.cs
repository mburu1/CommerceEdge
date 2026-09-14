namespace CommerceEdge.Application.Queries;

public record GetOrderByIdQuery(Guid OrderId);

public record GetOrderByNumberQuery(string OrderNumber);

public record ListOrdersQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? CustomerId = null,
    Guid? StoreId = null,
    string? Status = null);
