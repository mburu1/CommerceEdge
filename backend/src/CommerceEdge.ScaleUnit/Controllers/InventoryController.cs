using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using CommerceEdge.ScaleUnit.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CommerceEdge.ScaleUnit.Controllers;

[ApiController]
[Route("scaleunit/inventory")]
[Authorize]
public sealed class InventoryController(ICommerceRuntime runtime, IOptions<ScaleUnitOptions> options) : ControllerBase
{
    private readonly ScaleUnitOptions _options = options.Value;

    [HttpGet("{sku}")]
    public async Task<IActionResult> CheckStock(string sku, [FromQuery] Guid employeeId, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<CheckStockRequest, CheckStockResponse>(
            new CheckStockRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = employeeId,
                Currency = _options.Currency,
                Sku = sku
            }, ct);

        return response.Success ? Ok(response) : NotFound(response);
    }
}
