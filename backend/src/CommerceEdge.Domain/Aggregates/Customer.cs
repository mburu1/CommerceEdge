using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Entities;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Events;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Aggregates;

public sealed class Customer : AggregateRoot
{
    private readonly List<CustomerAddress> _addresses = [];

    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public Email Email { get; private set; }
    public PhoneNumber? Phone { get; private set; }
    public CustomerStatus Status { get; private set; }
    public LoyaltyAccount? LoyaltyAccount { get; private set; }
    public IReadOnlyList<CustomerAddress> Addresses => _addresses.AsReadOnly();

    private Customer() { FirstName = default!; LastName = default!; Email = default!; }

    public static Customer Create(string firstName, string lastName, Email email, PhoneNumber? phone = null)
    {
        if (string.IsNullOrWhiteSpace(firstName)) { throw new DomainException("First name is required."); }
        if (string.IsNullOrWhiteSpace(lastName)) { throw new DomainException("Last name is required."); }

        var customer = new Customer
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            Status = CustomerStatus.Active
        };

        customer.Raise(new CustomerCreatedEvent(customer.Id, email.Value));
        return customer;
    }

    public void EnrollLoyalty()
    {
        if (LoyaltyAccount is not null) { throw new DomainException("Customer already has a loyalty account."); }
        LoyaltyAccount = LoyaltyAccount.Create(Id);
        Raise(new CustomerLoyaltyEnrolledEvent(Id, LoyaltyAccount.Id));
    }

    public CustomerAddress AddAddress(Address address, bool isDefault = false)
    {
        if (isDefault)
        {
            foreach (var a in _addresses) { a.SetDefault(false); }
        }

        var customerAddress = CustomerAddress.Create(Id, address, isDefault || _addresses.Count == 0);
        _addresses.Add(customerAddress);
        return customerAddress;
    }

    public void Block() => Status = CustomerStatus.Blocked;
    public void Activate() => Status = CustomerStatus.Active;
}
