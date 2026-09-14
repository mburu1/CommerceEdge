using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;

namespace CommerceEdge.Domain.ValueObjects;

public sealed class Address : ValueObject
{
    public string Line1 { get; }
    public string? Line2 { get; }
    public string City { get; }
    public string State { get; }
    public string PostalCode { get; }
    public string Country { get; }

    public Address(string line1, string? line2, string city, string state, string postalCode, string country)
    {
        if (string.IsNullOrWhiteSpace(line1)) { throw new DomainException("Address line 1 is required."); }
        if (string.IsNullOrWhiteSpace(city)) { throw new DomainException("City is required."); }
        if (string.IsNullOrWhiteSpace(country)) { throw new DomainException("Country is required."); }

        Line1 = line1;
        Line2 = line2;
        City = city;
        State = state;
        PostalCode = postalCode;
        Country = country;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Line1;
        yield return Line2;
        yield return City;
        yield return State;
        yield return PostalCode;
        yield return Country;
    }
}
