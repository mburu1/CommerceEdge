using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommerceEdge.Api.Controllers;

[ApiController]
[Route("api/stores")]
public sealed class StoresController(IStoreService stores) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null, CancellationToken ct = default)
    {
        var result = await stores.ListAsync(new ListStoresQuery(page, pageSize, status), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await stores.GetByIdAsync(new GetStoreByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("number/{storeNumber}")]
    public async Task<IActionResult> GetByNumber(string storeNumber, CancellationToken ct = default)
    {
        var result = await stores.GetByNumberAsync(new GetStoreByNumberQuery(storeNumber), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStoreCommand cmd, CancellationToken ct = default)
    {
        var result = await stores.CreateAsync(cmd, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/registers")]
    public async Task<IActionResult> AddRegister(Guid id, [FromBody] AddRegisterCommand cmd, CancellationToken ct = default)
    {
        var result = await stores.AddRegisterAsync(cmd with { StoreId = id }, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct = default)
    {
        await stores.DeactivateAsync(new DeactivateStoreCommand(id), ct);
        return NoContent();
    }
}
