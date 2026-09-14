using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;

namespace CommerceEdge.Application.Services;

public interface ICartService
{
    Task<CartDto> CreateAsync(CreateCartCommand command, CancellationToken ct = default);
    Task<CartDto> AddLineAsync(AddCartLineCommand command, CancellationToken ct = default);
    Task RemoveLineAsync(RemoveCartLineCommand command, CancellationToken ct = default);
    Task<CartDto> CheckoutAsync(CheckoutCartCommand command, CancellationToken ct = default);
    Task AbandonAsync(AbandonCartCommand command, CancellationToken ct = default);
    Task<CartDto?> GetByIdAsync(GetCartByIdQuery query, CancellationToken ct = default);
    Task<CartDto?> GetActiveByCustomerAsync(GetActiveCartByCustomerQuery query, CancellationToken ct = default);
}
