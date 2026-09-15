using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommerceEdge.Api.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrdersController(IOrderService orders) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] Guid? customerId = null, [FromQuery] Guid? storeId = null,
        [FromQuery] string? status = null, CancellationToken ct = default)
    {
        var result = await orders.ListAsync(new ListOrdersQuery(page, pageSize, customerId, storeId, status), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await orders.GetByIdAsync(new GetOrderByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("number/{orderNumber}")]
    public async Task<IActionResult> GetByNumber(string orderNumber, CancellationToken ct = default)
    {
        var result = await orders.GetByNumberAsync(new GetOrderByNumberQuery(orderNumber), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderCommand cmd, CancellationToken ct = default)
    {
        var result = await orders.CreateAsync(cmd, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/lines")]
    public async Task<IActionResult> AddLine(Guid id, [FromBody] AddOrderLineCommand cmd, CancellationToken ct = default)
    {
        var result = await orders.AddLineAsync(cmd with { OrderId = id }, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/payments")]
    public async Task<IActionResult> AddPayment(Guid id, [FromBody] AddOrderPaymentCommand cmd, CancellationToken ct = default)
    {
        var result = await orders.AddPaymentAsync(cmd with { OrderId = id }, ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}/shipping-address")]
    public async Task<IActionResult> SetShippingAddress(Guid id, [FromBody] SetOrderShippingAddressCommand cmd, CancellationToken ct = default)
    {
        await orders.SetShippingAddressAsync(cmd with { OrderId = id }, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id, CancellationToken ct = default)
    {
        await orders.ConfirmAsync(new ConfirmOrderCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct = default)
    {
        await orders.CancelAsync(new CancelOrderCommand(id), ct);
        return NoContent();
    }
}
