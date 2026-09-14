using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Entities;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Events;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Aggregates;

public sealed class Cart : AggregateRoot
{
    private readonly List<CartLine> _lines = [];

    public Guid? CustomerId { get; private set; }
    public Guid StoreId { get; private set; }
    public string Currency { get; private set; }
    public CartStatus Status { get; private set; }
    public IReadOnlyList<CartLine> Lines => _lines.AsReadOnly();

    public Money Subtotal => _lines.Aggregate(Money.Zero(Currency), (sum, l) => sum.Add(l.LineTotal));

    private Cart() { Currency = default!; }

    public static Cart Create(Guid storeId, string currency, Guid? customerId = null)
    {
        var cart = new Cart
        {
            StoreId = storeId,
            Currency = currency,
            CustomerId = customerId,
            Status = CartStatus.Active
        };
        cart.Raise(new CartCreatedEvent(cart.Id, storeId));
        return cart;
    }

    public CartLine AddLine(Guid productId, Guid? variantId, string productName, string sku, Money unitPrice, int quantity)
    {
        EnsureActive();
        var existing = _lines.FirstOrDefault(l => l.Sku == sku);
        if (existing is not null)
        {
            existing.UpdateQuantity(existing.Quantity + quantity);
            return existing;
        }

        var line = CartLine.Create(Id, productId, variantId, productName, sku, unitPrice, quantity);
        _lines.Add(line);
        Raise(new CartLineAddedEvent(Id, productId, quantity));
        return line;
    }

    public void RemoveLine(Guid lineId)
    {
        EnsureActive();
        var line = _lines.FirstOrDefault(l => l.Id == lineId)
            ?? throw new NotFoundException(nameof(CartLine), lineId);
        _lines.Remove(line);
    }

    public void Checkout()
    {
        EnsureActive();
        if (_lines.Count == 0) { throw new DomainException("Cannot checkout an empty cart."); }
        Status = CartStatus.CheckedOut;
        Raise(new CartCheckedOutEvent(Id));
    }

    public void Abandon()
    {
        if (Status == CartStatus.Active)
        {
            Status = CartStatus.Abandoned;
        }
    }

    private void EnsureActive()
    {
        if (Status != CartStatus.Active)
        {
            throw new DomainException("Cart is not active.");
        }
    }
}
