using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommerceEdge.Api.Controllers;

[ApiController]
[Route("api/carts")]
public sealed class CartsController(ICartService carts) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await carts.GetByIdAsync(new GetCartByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive([FromQuery] Guid customerId, [FromQuery] Guid storeId, CancellationToken ct = default)
    {
        var result = await carts.GetActiveByCustomerAsync(new GetActiveCartByCustomerQuery(customerId, storeId), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCartCommand cmd, CancellationToken ct = default)
    {
        var result = await carts.CreateAsync(cmd, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/lines")]
    public async Task<IActionResult> AddLine(Guid id, [FromBody] AddCartLineCommand cmd, CancellationToken ct = default)
    {
        var result = await carts.AddLineAsync(cmd with { CartId = id }, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}/lines/{lineId:guid}")]
    public async Task<IActionResult> RemoveLine(Guid id, Guid lineId, CancellationToken ct = default)
    {
        await carts.RemoveLineAsync(new RemoveCartLineCommand(id, lineId), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/checkout")]
    public async Task<IActionResult> Checkout(Guid id, CancellationToken ct = default)
    {
        var result = await carts.CheckoutAsync(new CheckoutCartCommand(id), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/abandon")]
    public async Task<IActionResult> Abandon(Guid id, CancellationToken ct = default)
    {
        await carts.AbandonAsync(new AbandonCartCommand(id), ct);
        return NoContent();
    }
}
