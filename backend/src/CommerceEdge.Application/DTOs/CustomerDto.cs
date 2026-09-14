namespace CommerceEdge.Application.DTOs;

public record CustomerDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string Status,
    LoyaltyAccountDto? LoyaltyAccount,
    IReadOnlyList<CustomerAddressDto> Addresses);

public record LoyaltyAccountDto(Guid Id, int Points, string Tier);

public record CustomerAddressDto(
    Guid Id,
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country,
    bool IsDefault);
