namespace CommerceEdge.Application.Queries;

public record GetCustomerByIdQuery(Guid CustomerId);

public record GetCustomerByEmailQuery(string Email);

public record ListCustomersQuery(int Page = 1, int PageSize = 20, string? Status = null);
