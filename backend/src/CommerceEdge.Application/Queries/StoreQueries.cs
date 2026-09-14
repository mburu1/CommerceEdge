namespace CommerceEdge.Application.Queries;

public record GetStoreByIdQuery(Guid StoreId);

public record GetStoreByNumberQuery(string StoreNumber);

public record ListStoresQuery(int Page = 1, int PageSize = 20, string? Status = null);
