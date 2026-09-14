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

public sealed class StoreService(
    IStoreRepository stores,
    IUnitOfWork uow,
    IDomainEventDispatcher dispatcher) : IStoreService
{
    public async Task<StoreDto> CreateAsync(CreateStoreCommand cmd, CancellationToken ct = default)
    {
        var address = new Address(cmd.Line1, cmd.Line2, cmd.City, cmd.State, cmd.PostalCode, cmd.Country);
        var store = Store.Create(cmd.Name, cmd.StoreNumber, cmd.ChannelType, address, cmd.Currency, cmd.TimeZone);
        await stores.AddAsync(store, ct);
        await SaveAndDispatchAsync(store, ct);
        return Map(store);
    }

    public async Task<StoreDto> AddRegisterAsync(AddRegisterCommand cmd, CancellationToken ct = default)
    {
        var store = await GetOrThrowAsync(cmd.StoreId, ct);
        store.AddRegister(cmd.RegisterNumber);
        await stores.UpdateAsync(store, ct);
        await uow.SaveChangesAsync(ct);
        return Map(store);
    }

    public async Task DeactivateAsync(DeactivateStoreCommand cmd, CancellationToken ct = default)
    {
        var store = await GetOrThrowAsync(cmd.StoreId, ct);
        store.Deactivate();
        await stores.UpdateAsync(store, ct);
        await SaveAndDispatchAsync(store, ct);
    }

    public async Task<StoreDto?> GetByIdAsync(GetStoreByIdQuery query, CancellationToken ct = default)
    {
        var store = await stores.GetByIdAsync(query.StoreId, ct);
        return store is null ? null : Map(store);
    }

    public async Task<StoreDto?> GetByNumberAsync(GetStoreByNumberQuery query, CancellationToken ct = default)
    {
        var store = await stores.GetByStoreNumberAsync(query.StoreNumber, ct);
        return store is null ? null : Map(store);
    }

    public async Task<IReadOnlyList<StoreDto>> ListAsync(ListStoresQuery query, CancellationToken ct = default)
    {
        var list = await stores.ListAsync(query.Page, query.PageSize, ct);
        return list.Select(Map).ToList();
    }

    private async Task<Store> GetOrThrowAsync(Guid id, CancellationToken ct)
        => await stores.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Store), id);

    private async Task SaveAndDispatchAsync(Store store, CancellationToken ct)
    {
        await uow.SaveChangesAsync(ct);
        await dispatcher.DispatchAsync(store.DomainEvents, ct);
        store.ClearDomainEvents();
    }

    private static StoreDto Map(Store s) => new(
        s.Id, s.Name, s.StoreNumber, s.ChannelType.ToString(), s.Status.ToString(),
        new AddressDto(s.Address.Line1, s.Address.Line2, s.Address.City, s.Address.State, s.Address.PostalCode, s.Address.Country),
        s.Currency, s.TimeZone,
        s.Registers.Select(r => new RegisterDto(r.Id, r.RegisterNumber, r.Status.ToString())).ToList());
}
