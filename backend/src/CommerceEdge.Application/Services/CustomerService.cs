using CommerceEdge.Application.Abstractions;
using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.Repositories;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Application.Services;

public sealed class CustomerService(
    ICustomerRepository customers,
    IUnitOfWork uow,
    IDomainEventDispatcher dispatcher) : ICustomerService
{
    public async Task<CustomerDto> CreateAsync(CreateCustomerCommand cmd, CancellationToken ct = default)
    {
        var existing = await customers.GetByEmailAsync(cmd.Email, ct);
        if (existing is not null)
        {
            throw new DomainException($"Customer with email '{cmd.Email}' already exists.");
        }

        var phone = cmd.Phone is not null ? new PhoneNumber(cmd.Phone) : null;
        var customer = Customer.Create(cmd.FirstName, cmd.LastName, new Email(cmd.Email), phone);
        await customers.AddAsync(customer, ct);
        await SaveAndDispatchAsync(customer, ct);
        return Map(customer);
    }

    public async Task EnrollLoyaltyAsync(EnrollCustomerLoyaltyCommand cmd, CancellationToken ct = default)
    {
        var customer = await GetOrThrowAsync(cmd.CustomerId, ct);
        customer.EnrollLoyalty();
        await customers.UpdateAsync(customer, ct);
        await SaveAndDispatchAsync(customer, ct);
    }

    public async Task<CustomerDto> AddAddressAsync(AddCustomerAddressCommand cmd, CancellationToken ct = default)
    {
        var customer = await GetOrThrowAsync(cmd.CustomerId, ct);
        var address = new Address(cmd.Line1, cmd.Line2, cmd.City, cmd.State, cmd.PostalCode, cmd.Country);
        customer.AddAddress(address, cmd.IsDefault);
        await customers.UpdateAsync(customer, ct);
        await SaveAndDispatchAsync(customer, ct);
        return Map(customer);
    }

    public async Task BlockAsync(BlockCustomerCommand cmd, CancellationToken ct = default)
    {
        var customer = await GetOrThrowAsync(cmd.CustomerId, ct);
        customer.Block();
        await customers.UpdateAsync(customer, ct);
        await uow.SaveChangesAsync(ct);
    }

    public async Task ActivateAsync(ActivateCustomerCommand cmd, CancellationToken ct = default)
    {
        var customer = await GetOrThrowAsync(cmd.CustomerId, ct);
        customer.Activate();
        await customers.UpdateAsync(customer, ct);
        await uow.SaveChangesAsync(ct);
    }

    public async Task<CustomerDto?> GetByIdAsync(GetCustomerByIdQuery query, CancellationToken ct = default)
    {
        var customer = await customers.GetByIdAsync(query.CustomerId, ct);
        return customer is null ? null : Map(customer);
    }

    public async Task<CustomerDto?> GetByEmailAsync(GetCustomerByEmailQuery query, CancellationToken ct = default)
    {
        var customer = await customers.GetByEmailAsync(query.Email, ct);
        return customer is null ? null : Map(customer);
    }

    public async Task<IReadOnlyList<CustomerDto>> ListAsync(ListCustomersQuery query, CancellationToken ct = default)
    {
        var status = query.Status is not null && Enum.TryParse<CustomerStatus>(query.Status, out var s) ? s : (CustomerStatus?)null;
        var list = await customers.ListAsync(query.Page, query.PageSize, status, ct);
        return list.Select(Map).ToList();
    }

    private async Task<Customer> GetOrThrowAsync(Guid id, CancellationToken ct)
        => await customers.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Customer), id);

    private async Task SaveAndDispatchAsync(Customer customer, CancellationToken ct)
    {
        await uow.SaveChangesAsync(ct);
        await dispatcher.DispatchAsync(customer.DomainEvents, ct);
        customer.ClearDomainEvents();
    }

    private static CustomerDto Map(Customer c) => new(
        c.Id, c.FirstName, c.LastName, c.Email.Value, c.Phone?.Value,
        c.Status.ToString(),
        c.LoyaltyAccount is null ? null : new LoyaltyAccountDto(c.LoyaltyAccount.Id, c.LoyaltyAccount.Points, "Standard"),
        c.Addresses.Select(a => new CustomerAddressDto(a.Id, a.Address.Line1, a.Address.Line2, a.Address.City, a.Address.State, a.Address.PostalCode, a.Address.Country, a.IsDefault)).ToList());
}
