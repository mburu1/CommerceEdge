using CommerceEdge.Domain.Enums;

namespace CommerceEdge.Application.Commands;

public record CreateStoreCommand(
    string Name,
    string StoreNumber,
    ChannelType ChannelType,
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country,
    string Currency,
    string TimeZone);

public record AddRegisterCommand(Guid StoreId, string RegisterNumber);

public record DeactivateStoreCommand(Guid StoreId);
