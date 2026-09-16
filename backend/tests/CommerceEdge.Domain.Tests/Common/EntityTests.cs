using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Tests.Common;

public class EntityTests
{
    [Fact]
    public void Entity_IsEqualToItselfAndNotToNull()
    {
        var cart = Cart.Create(Guid.NewGuid(), "USD");

        cart.Equals(cart).Should().BeTrue();
        cart.Equals(null).Should().BeFalse();
        cart.Should().NotBeNull();
    }

    [Fact]
    public void Entity_WithDifferentIdAreNotEqual()
    {
        var a = Cart.Create(Guid.NewGuid(), "USD");
        var b = Cart.Create(Guid.NewGuid(), "USD");

        a.Should().NotBe(b);
        a.Should().NotBeSameAs(b);
    }

    [Fact]
    public void ValueObject_EqualityOperatorsReflectValue()
    {
        var a = new Money(10, "USD");
        var b = new Money(10, "USD");
        var c = new Money(10, "EUR");

        (a == b).Should().BeTrue();
        (a != c).Should().BeTrue();
        (a == c).Should().BeFalse();
        a.Equals(b).Should().BeTrue();
    }
}
