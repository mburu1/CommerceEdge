using CommerceEdge.Application.Abstractions;
using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.Repositories;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Application.Services;

public sealed class ShiftService(
    IShiftRepository shifts,
    IUnitOfWork uow,
    IDomainEventDispatcher dispatcher) : IShiftService
{
    public async Task<ShiftDto> OpenAsync(OpenShiftCommand cmd, CancellationToken ct = default)
    {
        var shift = Shift.Open(cmd.StoreId, cmd.RegisterId, cmd.EmployeeId,
            new Money(cmd.OpeningFloat, cmd.Currency));
        await shifts.AddAsync(shift, ct);
        await SaveAndDispatchAsync(shift, ct);
        return Map(shift);
    }

    public async Task CloseAsync(CloseShiftCommand cmd, CancellationToken ct = default)
    {
        var shift = await GetOrThrowAsync(cmd.ShiftId, ct);
        shift.Close(new Money(cmd.ClosingFloat, cmd.Currency));
        await shifts.UpdateAsync(shift, ct);
        await SaveAndDispatchAsync(shift, ct);
    }

    public async Task<ShiftDto> AddTransactionAsync(AddShiftTransactionCommand cmd, CancellationToken ct = default)
    {
        var shift = await GetOrThrowAsync(cmd.ShiftId, ct);
        shift.AddTransaction(cmd.Type, new Money(cmd.Amount, cmd.Currency), cmd.OrderId);
        await shifts.UpdateAsync(shift, ct);
        await uow.SaveChangesAsync(ct);
        return Map(shift);
    }

    public async Task<ShiftDto?> GetByIdAsync(GetShiftByIdQuery query, CancellationToken ct = default)
    {
        var shift = await shifts.GetByIdAsync(query.ShiftId, ct);
        return shift is null ? null : Map(shift);
    }

    public async Task<ShiftDto?> GetActiveAsync(GetActiveShiftQuery query, CancellationToken ct = default)
    {
        var shift = await shifts.GetOpenShiftAsync(query.RegisterId, ct);
        return shift is null ? null : Map(shift);
    }

    public async Task<IReadOnlyList<ShiftDto>> ListAsync(ListShiftsQuery query, CancellationToken ct = default)
    {
        var list = await shifts.ListAsync(query.StoreId, query.Page, query.PageSize, ct);
        return list.Select(Map).ToList();
    }

    private async Task<Shift> GetOrThrowAsync(Guid id, CancellationToken ct)
        => await shifts.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Shift), id);

    private async Task SaveAndDispatchAsync(Shift shift, CancellationToken ct)
    {
        await uow.SaveChangesAsync(ct);
        await dispatcher.DispatchAsync(shift.DomainEvents, ct);
        shift.ClearDomainEvents();
    }

    private static ShiftDto Map(Shift s) => new(
        s.Id, s.StoreId, s.RegisterId, s.EmployeeId,
        s.Status.ToString(),
        s.OpeningFloat.Amount, s.ClosingFloat?.Amount,
        s.OpeningFloat.Currency,
        s.OpenedAt, s.ClosedAt,
        s.Transactions.Select(t => new TransactionDto(t.Id, t.Type.ToString(), t.Amount.Amount, t.Amount.Currency, t.OrderId, t.CreatedAt)).ToList());
}
