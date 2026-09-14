using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;

namespace CommerceEdge.Application.Services;

public interface IStoreService
{
    Task<StoreDto> CreateAsync(CreateStoreCommand command, CancellationToken ct = default);
    Task<StoreDto> AddRegisterAsync(AddRegisterCommand command, CancellationToken ct = default);
    Task DeactivateAsync(DeactivateStoreCommand command, CancellationToken ct = default);
    Task<StoreDto?> GetByIdAsync(GetStoreByIdQuery query, CancellationToken ct = default);
    Task<StoreDto?> GetByNumberAsync(GetStoreByNumberQuery query, CancellationToken ct = default);
    Task<IReadOnlyList<StoreDto>> ListAsync(ListStoresQuery query, CancellationToken ct = default);
}
