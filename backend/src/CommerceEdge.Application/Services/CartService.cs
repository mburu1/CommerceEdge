using CommerceEdge.Application.Abstractions;
using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.Repositories;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Application.Services;

public sealed class CartService(
    ICartRepository carts,
    IUnitOfWork uow,
    IDomainEventDispatcher dispatcher) : ICartService
{
    public async Task<CartDto> CreateAsync(CreateCartCommand cmd, CancellationToken ct = default)
    {
        var cart = Cart.Create(cmd.StoreId, cmd.Currency, cmd.CustomerId);
        await carts.AddAsync(cart, ct);
        await SaveAndDispatchAsync(cart, ct);
        return Map(cart);
    }

    public async Task<CartDto> AddLineAsync(AddCartLineCommand cmd, CancellationToken ct = default)
    {
        var cart = await GetOrThrowAsync(cmd.CartId, ct);
        cart.AddLine(cmd.ProductId, cmd.VariantId, cmd.ProductName, cmd.Sku,
            new Money(cmd.UnitPrice, cmd.Currency), cmd.Quantity);
        await carts.UpdateAsync(cart, ct);
        await SaveAndDispatchAsync(cart, ct);
        return Map(cart);
    }

    public async Task RemoveLineAsync(RemoveCartLineCommand cmd, CancellationToken ct = default)
    {
        var cart = await GetOrThrowAsync(cmd.CartId, ct);
        cart.RemoveLine(cmd.LineId);
        await carts.UpdateAsync(cart, ct);
        await uow.SaveChangesAsync(ct);
    }

    public async Task<CartDto> CheckoutAsync(CheckoutCartCommand cmd, CancellationToken ct = default)
    {
        var cart = await GetOrThrowAsync(cmd.CartId, ct);
        cart.Checkout();
        await carts.UpdateAsync(cart, ct);
        await SaveAndDispatchAsync(cart, ct);
        return Map(cart);
    }

    public async Task AbandonAsync(AbandonCartCommand cmd, CancellationToken ct = default)
    {
        var cart = await GetOrThrowAsync(cmd.CartId, ct);
        cart.Abandon();
        await carts.UpdateAsync(cart, ct);
        await uow.SaveChangesAsync(ct);
    }

    public async Task<CartDto?> GetByIdAsync(GetCartByIdQuery query, CancellationToken ct = default)
    {
        var cart = await carts.GetByIdAsync(query.CartId, ct);
        return cart is null ? null : Map(cart);
    }

    public async Task<CartDto?> GetActiveByCustomerAsync(GetActiveCartByCustomerQuery query, CancellationToken ct = default)
    {
        var cart = await carts.GetActiveCartForCustomerAsync(query.CustomerId, query.StoreId, ct);
        return cart is null ? null : Map(cart);
    }

    private async Task<Cart> GetOrThrowAsync(Guid id, CancellationToken ct)
        => await carts.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Cart), id);

    private async Task SaveAndDispatchAsync(Cart cart, CancellationToken ct)
    {
        await uow.SaveChangesAsync(ct);
        await dispatcher.DispatchAsync(cart.DomainEvents, ct);
        cart.ClearDomainEvents();
    }

    private static CartDto Map(Cart c) => new(
        c.Id, c.StoreId, c.CustomerId, c.Currency, c.Status.ToString(),
        c.Subtotal.Amount,
        c.Lines.Select(l => new CartLineDto(l.Id, l.ProductId, l.VariantId, l.ProductName, l.Sku, l.UnitPrice.Amount, l.Quantity, l.LineTotal.Amount)).ToList());
}
