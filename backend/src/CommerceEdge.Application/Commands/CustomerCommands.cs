namespace CommerceEdge.Application.Commands;

public record CreateCustomerCommand(
    string FirstName,
    string LastName,
    string Email,
    string? Phone);

public record EnrollCustomerLoyaltyCommand(Guid CustomerId);

public record AddCustomerAddressCommand(
    Guid CustomerId,
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country,
    bool IsDefault);

public record BlockCustomerCommand(Guid CustomerId);

public record ActivateCustomerCommand(Guid CustomerId);
