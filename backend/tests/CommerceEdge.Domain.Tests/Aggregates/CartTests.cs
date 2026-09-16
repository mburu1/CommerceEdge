using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Events;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Tests.Aggregates;

public class CartTests
{
    private readonly Guid _storeId = Guid.NewGuid();

    [Fact]
    public void Create_MakesAnActiveEmptyCart()
    {
        var cart = Cart.Create(_storeId, "USD");

        cart.Status.Should().Be(CartStatus.Active);
        cart.StoreId.Should().Be(_storeId);
        cart.CustomerId.Should().BeNull();
        cart.Lines.Should().BeEmpty();
        cart.Subtotal.Should().Be(Money.Zero("USD"));
        cart.DomainEvents.Should().ContainSingle(e => e is CartCreatedEvent);
        var createdEvent = (CartCreatedEvent)cart.DomainEvents[0];
        createdEvent.CartId.Should().Be(cart.Id);
    }

    [Fact]
    public void AddLine_AppendsLineAndRaisesEvent()
    {
        var cart = Cart.Create(_storeId, "USD");

        var price = new Money(10, "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", price, 2);

        cart.Lines.Should().HaveCount(1);
        cart.Lines[0].Quantity.Should().Be(2);
        cart.Lines[0].LineTotal.Should().Be(new Money(20, "USD"));
        cart.Subtotal.Should().Be(new Money(20, "USD"));
        cart.DomainEvents.Should().Contain(e => e is CartLineAddedEvent);
    }

    [Fact]
    public void AddLine_DuplicateSku_UpdatesQuantity()
    {
        var cart = Cart.Create(_storeId, "USD");
        var price = new Money(10, "USD");
        var lineId = cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", price, 2).Id;

        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", price, 3);

        cart.Lines.Should().HaveCount(1);
        cart.Lines[0].Id.Should().Be(lineId);
        cart.Lines[0].Quantity.Should().Be(5);
        cart.DomainEvents.Should().ContainSingle(e => e is CartLineAddedEvent);
        var lineAddedEvent = cart.DomainEvents.OfType<CartLineAddedEvent>().Single();
        lineAddedEvent.CartId.Should().Be(cart.Id);
    }

    [Fact]
    public void AddLine_InvalidQuantity_Throws()
    {
        var cart = Cart.Create(_storeId, "USD");

        cart.Invoking(_ => _.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 0))
            .Should().Throw<DomainException>().WithMessage("Quantity must be positive.");
    }

    [Fact]
    public void RemoveLine_UnknownLine_Throws()
    {
        var cart = Cart.Create(_storeId, "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 1);
        var lineId = cart.Lines[0].Id;

        cart.RemoveLine(lineId);
        cart.Lines.Should().BeEmpty();

        cart.Invoking(_ => _.RemoveLine(Guid.NewGuid())).Should().Throw<NotFoundException>();
    }

    [Fact]
    public void Checkout_EmptyCart_Throws()
    {
        var cart = Cart.Create(_storeId, "USD");

        cart.Invoking(c => c.Checkout())
            .Should().Throw<DomainException>().WithMessage("Cannot checkout an empty cart.");
    }

    [Fact]
    public void Checkout_TransfersToCheckedOutAndRaisesEvent()
    {
        var cart = Cart.Create(_storeId, "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 2);

        cart.Checkout();

        cart.Status.Should().Be(CartStatus.CheckedOut);
        cart.DomainEvents.Should().ContainSingle(e => e is CartCheckedOutEvent);
        var checkoutEvent = cart.DomainEvents.OfType<CartCheckedOutEvent>().Single();
        checkoutEvent.CartId.Should().Be(cart.Id);
    }

    [Fact]
    public void Checkout_WhenNotActive_Throws()
    {
        var cart = Cart.Create(_storeId, "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 2);
        cart.Checkout();

        cart.Invoking(c => c.Checkout())
            .Should().Throw<DomainException>().WithMessage("Cart is not active.");
    }

    [Fact]
    public void AddLine_AfterCheckout_Throws()
    {
        var cart = Cart.Create(_storeId, "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 2);
        cart.Checkout();

        cart.Invoking(c => c.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 1))
            .Should().Throw<DomainException>().WithMessage("Cart is not active.");
    }

    [Fact]
    public void Abandon_TransitionsActiveToAbandoned()
    {
        var cart = Cart.Create(_storeId, "USD");
        cart.Abandon();
        cart.Status.Should().Be(CartStatus.Abandoned);
    }

    [Fact]
    public void Abandon_WhenNotActive_IsNoOp()
    {
        var cart = Cart.Create(_storeId, "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 1);
        cart.Checkout();
        cart.Abandon();
        cart.Status.Should().Be(CartStatus.CheckedOut);
    }
}
