using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommerceEdge.Api.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController(IProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null, [FromQuery] Guid? categoryId = null, CancellationToken ct = default)
    {
        var result = await products.ListAsync(new ListProductsQuery(page, pageSize, status, categoryId), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await products.GetByIdAsync(new GetProductByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("sku/{sku}")]
    public async Task<IActionResult> GetBySku(string sku, CancellationToken ct = default)
    {
        var result = await products.GetBySkuAsync(new GetProductBySkuQuery(sku), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand cmd, CancellationToken ct = default)
    {
        var result = await products.CreateAsync(cmd, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken ct = default)
    {
        await products.PublishAsync(new PublishProductCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/discontinue")]
    public async Task<IActionResult> Discontinue(Guid id, CancellationToken ct = default)
    {
        await products.DiscontinueAsync(new DiscontinueProductCommand(id), ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/price")]
    public async Task<IActionResult> UpdatePrice(Guid id, [FromBody] UpdateProductPriceCommand cmd, CancellationToken ct = default)
    {
        await products.UpdatePriceAsync(cmd with { ProductId = id }, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/variants")]
    public async Task<IActionResult> AddVariant(Guid id, [FromBody] AddProductVariantCommand cmd, CancellationToken ct = default)
    {
        var result = await products.AddVariantAsync(cmd with { ProductId = id }, ct);
        return Ok(result);
    }
}
