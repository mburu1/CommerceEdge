using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Tests.ValueObjects;

public class MoneyTests
{
    [Fact]
    public void Money_CreatesValidInstance()
    {
        var money = new Money(99.95m, "usd");

        money.Amount.Should().Be(99.95m);
        money.Currency.Should().Be("USD");
        money.ToString().Should().Be("99.95 USD");
    }

    [Theory]
    [InlineData(-0.01, "USD", "Amount cannot be negative.")]
    [InlineData(0, "us", "Currency must be a 3-letter ISO code.")]
    [InlineData(0, "USDR", "Currency must be a 3-letter ISO code.")]
    [InlineData(0, null, "Currency must be a 3-letter ISO code.")]
    public void Money_InvalidConstruction_ThrowsDomainException(decimal amount, string? currency, string message)
    {
        var act = () => new Money(amount, currency!);

        act.Should().Throw<DomainException>().WithMessage(message);
    }

    [Fact]
    public void Money_AddSubtractAcrossMatchingCurrency()
    {
        var ten = new Money(10, "USD");
        var sum = ten.Add(new Money(5, "USD"));
        sum.Amount.Should().Be(15);

        ten.Invoking(m => m.Add(new Money(1, "EUR")))
            .Should().Throw<DomainException>().WithMessage("Currency mismatch*");

        ten.Invoking(m => new Money(2, "USD").Subtract(ten))
            .Should().Throw<DomainException>().WithMessage("Amount cannot be negative.");

        ten.Multiply(3).Amount.Should().Be(30);
        Money.Zero("USD").Amount.Should().Be(0);
    }

    [Fact]
    public void Money_HasValueEquality()
    {
        new Money(10, "USD").Should().Be(new Money(10, "USD"));
        new Money(10, "USD").Should().NotBe(new Money(11, "USD"));
    }
}

public class QuantityTests
{
    [Fact]
    public void Quantity_CreatesValidInstance()
    {
        new Quantity(5).Value.Should().Be(5);
        new Quantity(0).Value.Should().Be(0);
        Quantity.Zero.Value.Should().Be(0);
        new Quantity(2).Add(new Quantity(3)).Value.Should().Be(5);
    }

    [Fact]
    public void Quantity_Negative_ThrowsDomainException()
    {
        var act = () => new Quantity(-1);
        act.Should().Throw<DomainException>().WithMessage("Quantity cannot be negative.");

        var three = new Quantity(3);
        three.Invoking(q => q.Subtract(new Quantity(5)))
            .Should().Throw<DomainException>().WithMessage("Quantity cannot be negative.");
    }
}

public class EmailTests
{
    [Fact]
    public void Email_NormalizesAndComparesByValue()
    {
        new Email("A@B.COM").Value.Should().Be("a@b.com");
        new Email("user@example.com").Value.Should().Be("user@example.com");
        new Email("a@b.com").Should().Be(new Email("A@B.COM"));
    }

    [Theory]
    [InlineData("no-at-sign")]
    [InlineData("")]
    [InlineData("   ")]
    public void Email_Invalid_ThrowsDomainException(string value)
    {
        var act = () => new Email(value);
        act.Should().Throw<DomainException>().WithMessage("Invalid email address.");
    }
}

public class AddressTests
{
    [Fact]
    public void Address_EqualityAndOptionalFields()
    {
        var address = new Address("1 Main", null, "City", "State", "12345", "Country");

        address.Line1.Should().Be("1 Main");
        address.Line2.Should().BeNull();
        address.City.Should().Be("City");
        address.Should().Be(new Address("1 Main", null, "City", "State", "12345", "Country"));
        address.Should().NotBe(new Address("2 Main", null, "City", "State", "12345", "Country"));
    }

    [Theory]
    [InlineData("", null, "City", "State", "12345", "Country", "Address line 1 is required.")]
    [InlineData("1 Main", null, "", "State", "12345", "Country", "City is required.")]
    [InlineData("1 Main", null, "City", "State", "12345", "", "Country is required.")]
    public void Address_MissingMandatory_ThrowsDomainException(
        string line1, string? line2, string city, string state, string postal, string country, string message)
    {
        var act = () => new Address(line1, line2, city, state, postal, country);
        act.Should().Throw<DomainException>().WithMessage(message);
    }
}

public class PhoneNumberTests
{
    [Fact]
    public void PhoneNumber_TrimsAndComparesByValue()
    {
        new PhoneNumber("  123-456  ").Value.Should().Be("123-456");
        new PhoneNumber("123").Should().Be(new PhoneNumber("123"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void PhoneNumber_Empty_ThrowsDomainException(string value)
    {
        var act = () => new PhoneNumber(value);
        act.Should().Throw<DomainException>().WithMessage("Phone number is required.");
    }
}
