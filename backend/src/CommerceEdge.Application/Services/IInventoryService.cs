using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;

namespace CommerceEdge.Application.Services;

public interface IInventoryService
{
    Task<InventoryDto> CreateAsync(CreateInventoryItemCommand command, CancellationToken ct = default);
    Task ReceiveAsync(ReceiveInventoryCommand command, CancellationToken ct = default);
    Task ReserveAsync(ReserveInventoryCommand command, CancellationToken ct = default);
    Task ReleaseReservationAsync(ReleaseInventoryReservationCommand command, CancellationToken ct = default);
    Task AdjustAsync(AdjustInventoryCommand command, CancellationToken ct = default);
    Task<InventoryDto?> GetByIdAsync(GetInventoryByIdQuery query, CancellationToken ct = default);
    Task<InventoryDto?> GetBySkuAsync(GetInventoryBySkuQuery query, CancellationToken ct = default);
    Task<IReadOnlyList<InventoryDto>> ListAsync(ListInventoryQuery query, CancellationToken ct = default);
}
