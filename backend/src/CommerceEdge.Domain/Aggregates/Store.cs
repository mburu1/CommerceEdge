using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Entities;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Events;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Aggregates;

public sealed class Store : AggregateRoot
{
    private readonly List<Register> _registers = [];

    public string Name { get; private set; }
    public string StoreNumber { get; private set; }
    public ChannelType ChannelType { get; private set; }
    public StoreStatus Status { get; private set; }
    public Address Address { get; private set; }
    public string Currency { get; private set; }
    public string TimeZone { get; private set; }
    public IReadOnlyList<Register> Registers => _registers.AsReadOnly();

    private Store() { Name = default!; StoreNumber = default!; Address = default!; Currency = default!; TimeZone = default!; }

    public static Store Create(string name, string storeNumber, ChannelType channelType, Address address, string currency, string timeZone)
    {
        if (string.IsNullOrWhiteSpace(name)) { throw new DomainException("Store name is required."); }
        if (string.IsNullOrWhiteSpace(storeNumber)) { throw new DomainException("Store number is required."); }

        var store = new Store
        {
            Name = name,
            StoreNumber = storeNumber,
            ChannelType = channelType,
            Status = StoreStatus.Active,
            Address = address,
            Currency = currency,
            TimeZone = timeZone
        };

        store.Raise(new StoreCreatedEvent(store.Id, storeNumber));
        return store;
    }

    public Register AddRegister(string registerNumber)
    {
        if (_registers.Any(r => r.RegisterNumber == registerNumber))
        {
            throw new DomainException($"Register '{registerNumber}' already exists.");
        }

        var register = Register.Create(Id, registerNumber);
        _registers.Add(register);
        return register;
    }

    public void Deactivate()
    {
        Status = StoreStatus.Inactive;
        Raise(new StoreDeactivatedEvent(Id));
    }
}
