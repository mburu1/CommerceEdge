namespace CommerceEdge.Application.Queries;

public record GetShiftByIdQuery(Guid ShiftId);

public record GetActiveShiftQuery(Guid RegisterId);

public record ListShiftsQuery(Guid StoreId, int Page = 1, int PageSize = 20);
