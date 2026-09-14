using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;

namespace CommerceEdge.Application.Services;

public interface IShiftService
{
    Task<ShiftDto> OpenAsync(OpenShiftCommand command, CancellationToken ct = default);
    Task CloseAsync(CloseShiftCommand command, CancellationToken ct = default);
    Task<ShiftDto> AddTransactionAsync(AddShiftTransactionCommand command, CancellationToken ct = default);
    Task<ShiftDto?> GetByIdAsync(GetShiftByIdQuery query, CancellationToken ct = default);
    Task<ShiftDto?> GetActiveAsync(GetActiveShiftQuery query, CancellationToken ct = default);
    Task<IReadOnlyList<ShiftDto>> ListAsync(ListShiftsQuery query, CancellationToken ct = default);
}
