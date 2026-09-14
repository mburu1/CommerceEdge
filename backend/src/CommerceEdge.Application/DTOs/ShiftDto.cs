namespace CommerceEdge.Application.DTOs;

public record ShiftDto(
    Guid Id,
    Guid StoreId,
    Guid RegisterId,
    Guid EmployeeId,
    string Status,
    decimal OpeningFloat,
    decimal? ClosingFloat,
    string Currency,
    DateTime OpenedAt,
    DateTime? ClosedAt,
    IReadOnlyList<TransactionDto> Transactions);

public record TransactionDto(
    Guid Id,
    string Type,
    decimal Amount,
    string Currency,
    Guid? OrderId,
    DateTime CreatedAt);
