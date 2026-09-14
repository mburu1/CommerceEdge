using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;

namespace CommerceEdge.Application.Services;

public interface ICustomerService
{
    Task<CustomerDto> CreateAsync(CreateCustomerCommand command, CancellationToken ct = default);
    Task EnrollLoyaltyAsync(EnrollCustomerLoyaltyCommand command, CancellationToken ct = default);
    Task<CustomerDto> AddAddressAsync(AddCustomerAddressCommand command, CancellationToken ct = default);
    Task BlockAsync(BlockCustomerCommand command, CancellationToken ct = default);
    Task ActivateAsync(ActivateCustomerCommand command, CancellationToken ct = default);
    Task<CustomerDto?> GetByIdAsync(GetCustomerByIdQuery query, CancellationToken ct = default);
    Task<CustomerDto?> GetByEmailAsync(GetCustomerByEmailQuery query, CancellationToken ct = default);
    Task<IReadOnlyList<CustomerDto>> ListAsync(ListCustomersQuery query, CancellationToken ct = default);
}
