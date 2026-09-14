using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Entities;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Events;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Aggregates;

public sealed class Order : AggregateRoot
{
    private readonly List<OrderLine> _lines = [];
    private readonly List<Payment> _payments = [];

    public string OrderNumber { get; private set; }
    public Guid StoreId { get; private set; }
    public Guid? CustomerId { get; private set; }
    public Guid? CartId { get; private set; }
    public OrderStatus Status { get; private set; }
    public string Currency { get; private set; }
    public Money Subtotal { get; private set; }
    public Money TaxAmount { get; private set; }
    public Money Total { get; private set; }
    public Address? ShippingAddress { get; private set; }
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
    public IReadOnlyList<Payment> Payments => _payments.AsReadOnly();

    private Order() { OrderNumber = default!; Currency = default!; Subtotal = default!; TaxAmount = default!; Total = default!; }

    public static Order Create(string orderNumber, Guid storeId, string currency, Guid? customerId = null, Guid? cartId = null)
    {
        var order = new Order
        {
            OrderNumber = orderNumber,
            StoreId = storeId,
            Currency = currency,
            CustomerId = customerId,
            CartId = cartId,
            Status = OrderStatus.Pending,
            Subtotal = Money.Zero(currency),
            TaxAmount = Money.Zero(currency),
            Total = Money.Zero(currency)
        };
        order.Raise(new OrderCreatedEvent(order.Id, orderNumber, storeId));
        return order;
    }

    public OrderLine AddLine(Guid productId, Guid? variantId, string productName, string sku, Money unitPrice, int quantity)
    {
        EnsurePending();
        var line = OrderLine.Create(Id, productId, variantId, productName, sku, unitPrice, quantity);
        _lines.Add(line);
        RecalculateTotals();
        return line;
    }

    public void SetShippingAddress(Address address) => ShippingAddress = address;

    public void Confirm()
    {
        EnsurePending();
        Status = OrderStatus.Confirmed;
        Raise(new OrderConfirmedEvent(Id, OrderNumber));
    }

    public void Cancel()
    {
        if (Status is OrderStatus.Shipped or OrderStatus.Delivered)
        {
            throw new DomainException("Cannot cancel a shipped or delivered order.");
        }
        Status = OrderStatus.Cancelled;
        Raise(new OrderCancelledEvent(Id, OrderNumber));
    }

    public Payment AddPayment(PaymentMethod method, Money amount)
    {
        var payment = Payment.Create(Id, method, amount);
        _payments.Add(payment);
        Raise(new OrderPaymentAddedEvent(Id, payment.Id, amount));
        return payment;
    }

    private void RecalculateTotals()
    {
        Subtotal = _lines.Aggregate(Money.Zero(Currency), (sum, l) => sum.Add(l.LineTotal));
        Total = Subtotal.Add(TaxAmount);
    }

    private void EnsurePending()
    {
        if (Status != OrderStatus.Pending)
        {
            throw new DomainException("Order is no longer pending.");
        }
    }
}
