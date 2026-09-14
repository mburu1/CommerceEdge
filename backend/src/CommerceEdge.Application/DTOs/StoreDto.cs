namespace CommerceEdge.Application.DTOs;

public record StoreDto(
    Guid Id,
    string Name,
    string StoreNumber,
    string ChannelType,
    string Status,
    AddressDto Address,
    string Currency,
    string TimeZone,
    IReadOnlyList<RegisterDto> Registers);

public record RegisterDto(Guid Id, string RegisterNumber, string Status);
