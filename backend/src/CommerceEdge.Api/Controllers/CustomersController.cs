using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommerceEdge.Api.Controllers;

[ApiController]
[Route("api/customers")]
public sealed class CustomersController(ICustomerService customers) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null, CancellationToken ct = default)
    {
        var result = await customers.ListAsync(new ListCustomersQuery(page, pageSize, status), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await customers.GetByIdAsync(new GetCustomerByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetByEmail(string email, CancellationToken ct = default)
    {
        var result = await customers.GetByEmailAsync(new GetCustomerByEmailQuery(email), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerCommand cmd, CancellationToken ct = default)
    {
        var result = await customers.CreateAsync(cmd, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/addresses")]
    public async Task<IActionResult> AddAddress(Guid id, [FromBody] AddCustomerAddressCommand cmd, CancellationToken ct = default)
    {
        var result = await customers.AddAddressAsync(cmd with { CustomerId = id }, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/loyalty/enroll")]
    public async Task<IActionResult> EnrollLoyalty(Guid id, CancellationToken ct = default)
    {
        await customers.EnrollLoyaltyAsync(new EnrollCustomerLoyaltyCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/block")]
    public async Task<IActionResult> Block(Guid id, CancellationToken ct = default)
    {
        await customers.BlockAsync(new BlockCustomerCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct = default)
    {
        await customers.ActivateAsync(new ActivateCustomerCommand(id), ct);
        return NoContent();
    }
}
