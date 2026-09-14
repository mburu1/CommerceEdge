using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;

namespace CommerceEdge.Application.Services;

public interface IOrderService
{
    Task<OrderDto> CreateAsync(CreateOrderCommand command, CancellationToken ct = default);
    Task<OrderDto> AddLineAsync(AddOrderLineCommand command, CancellationToken ct = default);
    Task ConfirmAsync(ConfirmOrderCommand command, CancellationToken ct = default);
    Task CancelAsync(CancelOrderCommand command, CancellationToken ct = default);
    Task<OrderDto> AddPaymentAsync(AddOrderPaymentCommand command, CancellationToken ct = default);
    Task SetShippingAddressAsync(SetOrderShippingAddressCommand command, CancellationToken ct = default);
    Task<OrderDto?> GetByIdAsync(GetOrderByIdQuery query, CancellationToken ct = default);
    Task<OrderDto?> GetByNumberAsync(GetOrderByNumberQuery query, CancellationToken ct = default);
    Task<IReadOnlyList<OrderDto>> ListAsync(ListOrdersQuery query, CancellationToken ct = default);
}
