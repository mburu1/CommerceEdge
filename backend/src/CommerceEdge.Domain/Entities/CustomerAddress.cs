using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Entities;

public sealed class CustomerAddress : Entity
{
    public Guid CustomerId { get; private set; }
    public Address Address { get; private set; }
    public bool IsDefault { get; private set; }

    private CustomerAddress() { Address = default!; }

    internal static CustomerAddress Create(Guid customerId, Address address, bool isDefault)
        => new() { CustomerId = customerId, Address = address, IsDefault = isDefault };

    internal void SetDefault(bool value) => IsDefault = value;
}
