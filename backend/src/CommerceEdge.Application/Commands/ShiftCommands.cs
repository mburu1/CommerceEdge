using CommerceEdge.Domain.Enums;

namespace CommerceEdge.Application.Commands;

public record OpenShiftCommand(
    Guid StoreId,
    Guid RegisterId,
    Guid EmployeeId,
    decimal OpeningFloat,
    string Currency);

public record CloseShiftCommand(Guid ShiftId, decimal ClosingFloat, string Currency);

public record AddShiftTransactionCommand(
    Guid ShiftId,
    TransactionType Type,
    decimal Amount,
    string Currency,
    Guid? OrderId);
