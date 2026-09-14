using CommerceEdge.Application.Abstractions;
using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.Repositories;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Application.Services;

public sealed class OrderService(
    IOrderRepository orders,
    IUnitOfWork uow,
    IDomainEventDispatcher dispatcher) : IOrderService
{
    public async Task<OrderDto> CreateAsync(CreateOrderCommand cmd, CancellationToken ct = default)
    {
        var order = Order.Create(cmd.OrderNumber, cmd.StoreId, cmd.Currency, cmd.CustomerId, cmd.CartId);
        await orders.AddAsync(order, ct);
        await SaveAndDispatchAsync(order, ct);
        return Map(order);
    }

    public async Task<OrderDto> AddLineAsync(AddOrderLineCommand cmd, CancellationToken ct = default)
    {
        var order = await GetOrThrowAsync(cmd.OrderId, ct);
        order.AddLine(cmd.ProductId, cmd.VariantId, cmd.ProductName, cmd.Sku,
            new Money(cmd.UnitPrice, cmd.Currency), cmd.Quantity);
        await orders.UpdateAsync(order, ct);
        await uow.SaveChangesAsync(ct);
        return Map(order);
    }

    public async Task ConfirmAsync(ConfirmOrderCommand cmd, CancellationToken ct = default)
    {
        var order = await GetOrThrowAsync(cmd.OrderId, ct);
        order.Confirm();
        await orders.UpdateAsync(order, ct);
        await SaveAndDispatchAsync(order, ct);
    }

    public async Task CancelAsync(CancelOrderCommand cmd, CancellationToken ct = default)
    {
        var order = await GetOrThrowAsync(cmd.OrderId, ct);
        order.Cancel();
        await orders.UpdateAsync(order, ct);
        await SaveAndDispatchAsync(order, ct);
    }

    public async Task<OrderDto> AddPaymentAsync(AddOrderPaymentCommand cmd, CancellationToken ct = default)
    {
        var order = await GetOrThrowAsync(cmd.OrderId, ct);
        order.AddPayment(cmd.Method, new Money(cmd.Amount, cmd.Currency));
        await orders.UpdateAsync(order, ct);
        await SaveAndDispatchAsync(order, ct);
        return Map(order);
    }

    public async Task SetShippingAddressAsync(SetOrderShippingAddressCommand cmd, CancellationToken ct = default)
    {
        var order = await GetOrThrowAsync(cmd.OrderId, ct);
        order.SetShippingAddress(new Address(cmd.Line1, cmd.Line2, cmd.City, cmd.State, cmd.PostalCode, cmd.Country));
        await orders.UpdateAsync(order, ct);
        await uow.SaveChangesAsync(ct);
    }

    public async Task<OrderDto?> GetByIdAsync(GetOrderByIdQuery query, CancellationToken ct = default)
    {
        var order = await orders.GetByIdAsync(query.OrderId, ct);
        return order is null ? null : Map(order);
    }

    public async Task<OrderDto?> GetByNumberAsync(GetOrderByNumberQuery query, CancellationToken ct = default)
    {
        var order = await orders.GetByOrderNumberAsync(query.OrderNumber, ct);
        return order is null ? null : Map(order);
    }

    public async Task<IReadOnlyList<OrderDto>> ListAsync(ListOrdersQuery query, CancellationToken ct = default)
    {
        var status = query.Status is not null && Enum.TryParse<OrderStatus>(query.Status, out var s) ? s : (OrderStatus?)null;
        var list = await orders.ListAsync(query.Page, query.PageSize, query.CustomerId, query.StoreId, status, ct);
        return list.Select(Map).ToList();
    }

    private async Task<Order> GetOrThrowAsync(Guid id, CancellationToken ct)
        => await orders.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Order), id);

    private async Task SaveAndDispatchAsync(Order order, CancellationToken ct)
    {
        await uow.SaveChangesAsync(ct);
        await dispatcher.DispatchAsync(order.DomainEvents, ct);
        order.ClearDomainEvents();
    }

    private static OrderDto Map(Order o) => new(
        o.Id, o.OrderNumber, o.StoreId, o.CustomerId,
        o.Status.ToString(), o.Currency,
        o.Subtotal.Amount, o.TaxAmount.Amount, o.Total.Amount,
        o.ShippingAddress is null ? null : new AddressDto(o.ShippingAddress.Line1, o.ShippingAddress.Line2, o.ShippingAddress.City, o.ShippingAddress.State, o.ShippingAddress.PostalCode, o.ShippingAddress.Country),
        o.Lines.Select(l => new OrderLineDto(l.Id, l.ProductId, l.VariantId, l.ProductName, l.Sku, l.UnitPrice.Amount, l.Quantity, l.LineTotal.Amount, l.Status.ToString())).ToList(),
        o.Payments.Select(p => new OrderPaymentDto(p.Id, p.Method.ToString(), p.Amount.Amount, p.Amount.Currency, p.Status.ToString())).ToList());
}
