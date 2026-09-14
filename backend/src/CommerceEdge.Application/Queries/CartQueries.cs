namespace CommerceEdge.Application.Queries;

public record GetCartByIdQuery(Guid CartId);

public record GetActiveCartByCustomerQuery(Guid CustomerId, Guid StoreId);
