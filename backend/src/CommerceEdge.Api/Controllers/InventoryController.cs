using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommerceEdge.Api.Controllers;

[ApiController]
[Route("api/inventory")]
public sealed class InventoryController(IInventoryService inventory) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid storeId, [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20, [FromQuery] string? status = null, CancellationToken ct = default)
    {
        var result = await inventory.ListAsync(new ListInventoryQuery(storeId, page, pageSize, status), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await inventory.GetByIdAsync(new GetInventoryByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("sku/{sku}")]
    public async Task<IActionResult> GetBySku(string sku, [FromQuery] Guid storeId, CancellationToken ct = default)
    {
        var result = await inventory.GetBySkuAsync(new GetInventoryBySkuQuery(storeId, sku), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInventoryItemCommand cmd, CancellationToken ct = default)
    {
        var result = await inventory.CreateAsync(cmd, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<IActionResult> Receive(Guid id, [FromBody] ReceiveInventoryCommand cmd, CancellationToken ct = default)
    {
        await inventory.ReceiveAsync(cmd with { InventoryItemId = id }, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/reserve")]
    public async Task<IActionResult> Reserve(Guid id, [FromBody] ReserveInventoryCommand cmd, CancellationToken ct = default)
    {
        await inventory.ReserveAsync(cmd with { InventoryItemId = id }, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/release")]
    public async Task<IActionResult> Release(Guid id, [FromBody] ReleaseInventoryReservationCommand cmd, CancellationToken ct = default)
    {
        await inventory.ReleaseReservationAsync(cmd with { InventoryItemId = id }, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/adjust")]
    public async Task<IActionResult> Adjust(Guid id, [FromBody] AdjustInventoryCommand cmd, CancellationToken ct = default)
    {
        await inventory.AdjustAsync(cmd with { InventoryItemId = id }, ct);
        return NoContent();
    }
}
