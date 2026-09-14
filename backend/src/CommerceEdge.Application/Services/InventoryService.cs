using CommerceEdge.Application.Abstractions;
using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.Repositories;

namespace CommerceEdge.Application.Services;

public sealed class InventoryService(
    IInventoryRepository inventory,
    IUnitOfWork uow,
    IDomainEventDispatcher dispatcher) : IInventoryService
{
    public async Task<InventoryDto> CreateAsync(CreateInventoryItemCommand cmd, CancellationToken ct = default)
    {
        var item = InventoryItem.Create(cmd.ProductId, cmd.StoreId, cmd.Sku, cmd.VariantId, cmd.ReorderPoint);
        await inventory.AddAsync(item, ct);
        await uow.SaveChangesAsync(ct);
        return Map(item);
    }

    public async Task ReceiveAsync(ReceiveInventoryCommand cmd, CancellationToken ct = default)
    {
        var item = await GetOrThrowAsync(cmd.InventoryItemId, ct);
        item.Receive(cmd.Quantity);
        await inventory.UpdateAsync(item, ct);
        await SaveAndDispatchAsync(item, ct);
    }

    public async Task ReserveAsync(ReserveInventoryCommand cmd, CancellationToken ct = default)
    {
        var item = await GetOrThrowAsync(cmd.InventoryItemId, ct);
        item.Reserve(cmd.Quantity);
        await inventory.UpdateAsync(item, ct);
        await SaveAndDispatchAsync(item, ct);
    }

    public async Task ReleaseReservationAsync(ReleaseInventoryReservationCommand cmd, CancellationToken ct = default)
    {
        var item = await GetOrThrowAsync(cmd.InventoryItemId, ct);
        item.ReleaseReservation(cmd.Quantity);
        await inventory.UpdateAsync(item, ct);
        await uow.SaveChangesAsync(ct);
    }

    public async Task AdjustAsync(AdjustInventoryCommand cmd, CancellationToken ct = default)
    {
        var item = await GetOrThrowAsync(cmd.InventoryItemId, ct);
        item.Adjust(cmd.Quantity, cmd.Reason);
        await inventory.UpdateAsync(item, ct);
        await SaveAndDispatchAsync(item, ct);
    }

    public async Task<InventoryDto?> GetByIdAsync(GetInventoryByIdQuery query, CancellationToken ct = default)
    {
        var item = await inventory.GetByIdAsync(query.InventoryItemId, ct);
        return item is null ? null : Map(item);
    }

    public async Task<InventoryDto?> GetBySkuAsync(GetInventoryBySkuQuery query, CancellationToken ct = default)
    {
        var item = await inventory.GetBySkuAndStoreAsync(query.Sku, query.StoreId, ct);
        return item is null ? null : Map(item);
    }

    public async Task<IReadOnlyList<InventoryDto>> ListAsync(ListInventoryQuery query, CancellationToken ct = default)
    {
        var status = query.Status is not null && Enum.TryParse<InventoryStatus>(query.Status, out var s) ? s : (InventoryStatus?)null;
        var list = await inventory.ListAsync(query.StoreId, query.Page, query.PageSize, status, ct);
        return list.Select(Map).ToList();
    }

    private async Task<InventoryItem> GetOrThrowAsync(Guid id, CancellationToken ct)
        => await inventory.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(InventoryItem), id);

    private async Task SaveAndDispatchAsync(InventoryItem item, CancellationToken ct)
    {
        await uow.SaveChangesAsync(ct);
        await dispatcher.DispatchAsync(item.DomainEvents, ct);
        item.ClearDomainEvents();
    }

    private static InventoryDto Map(InventoryItem i) => new(
        i.Id, i.ProductId, i.VariantId, i.StoreId, i.Sku,
        i.QuantityOnHand, i.QuantityReserved, i.QuantityAvailable,
        i.ReorderPoint, i.Status.ToString());
}
