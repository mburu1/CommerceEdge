using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommerceEdge.Api.Controllers;

[ApiController]
[Route("api/shifts")]
public sealed class ShiftsController(IShiftService shifts) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid storeId, [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await shifts.ListAsync(new ListShiftsQuery(storeId, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await shifts.GetByIdAsync(new GetShiftByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive([FromQuery] Guid registerId, CancellationToken ct = default)
    {
        var result = await shifts.GetActiveAsync(new GetActiveShiftQuery(registerId), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Open([FromBody] OpenShiftCommand cmd, CancellationToken ct = default)
    {
        var result = await shifts.OpenAsync(cmd, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id, [FromBody] CloseShiftCommand cmd, CancellationToken ct = default)
    {
        await shifts.CloseAsync(cmd with { ShiftId = id }, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/transactions")]
    public async Task<IActionResult> AddTransaction(Guid id, [FromBody] AddShiftTransactionCommand cmd, CancellationToken ct = default)
    {
        var result = await shifts.AddTransactionAsync(cmd with { ShiftId = id }, ct);
        return Ok(result);
    }
}
